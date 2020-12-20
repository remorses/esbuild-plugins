import { Plugin } from 'esbuild'
import fs from 'fs'
import path from 'path'
import { bareImportRE, getHtmlScriptsUrls } from './html'
import { NodeResolvePlugin, resolveAsync } from '@esbuild-plugins/node-resolve'
const NAME = require('../package.json').name
const debug = require('debug')(NAME)

interface Options {
    // TODO i need to know the esbuild output entrypoint to inject it into the html,
    // TODO i need to emit html file but i don't know the outdir
    name?: string
    root: string // to resolve paths in case the html page is not in root
    transformImportPath?: (importPath?: string) => string
    // emitHtml?: (arg: { path: string; html: string }) => Promise<void>
}

/**
 * Let you use html files as entrypoints for esbuild
 */
export function HtmlIngestPlugin({
    name = NAME,
    root,
    transformImportPath,
}: Options): Plugin {
    debug('setup')
    return {
        name,
        setup: function setup({ onLoad, onResolve }) {
            onResolve({ filter: /\.html$/ }, async (args) => {
                const resolved = await resolveAsync(args.path, {
                    basedir: args.resolveDir,
                    extensions: ['.html'],
                }).catch(() => '')
                if (!resolved) {
                    return
                }
                return {
                    path: resolved, // .replace('.html', '.html.js'),
                }
            })

            onLoad({ filter: /\.html$/ }, async (args) => {
                try {
                    const realFilePath = args.path // .replace('.html.js', '.html')
                    const html = await (
                        await fs.promises.readFile(realFilePath, {
                            encoding: 'utf-8',
                        })
                    ).toString()

                    const jsUrls = await getHtmlScriptsUrls(html)

                    // const folder = path.relative(root, path.dirname(args.path))
                    const pathToRoot = path.relative(
                        path.dirname(args.path),
                        root,
                    )

                    const contents = jsUrls
                        .map((importPath) => {
                            if (importPath.startsWith('/')) {
                                importPath = path.posix.join(
                                    pathToRoot,
                                    '.' + importPath,
                                )
                            }
                            if (bareImportRE.test(importPath)) {
                                importPath = './' + importPath
                            }

                            return importPath
                        })
                        .map((x) =>
                            transformImportPath ? transformImportPath(x) : x,
                        )
                        .map((importPath) => `export * from '${importPath}'`)
                        .join('\n')

                    let resolveDir = path.dirname(args.path)

                    debug('onLoad')
                    return {
                        loader: 'js',
                        contents,
                        resolveDir,
                    }
                } catch (e) {
                    throw new Error(`Cannot load ${args.path}, ${e}`)
                }
            })
        },
    }
}

// let htmlPlugin: Plugin = {
//     name: 'example',
//     setup({ onEmit, onLoad }) {
//         onEmit({ filter: /\.html/ }, (args) => {
//             const htmlPath = args.path
//             const jsPath = args.path + '.js'
//             const scriptSrc = '/' + path.basename(jsPath)
//             return [
//                 { path: jsPath, contents: args.contents },
//                 {
//                     path: htmlPath,
//                     content: `
//                     <html>
//                         <body>
//                             <script src="${scriptSrc}" type="module"></script>
//                         </body>
//                     </html>
//                     `,
//                 },
//             ]
//         })
//         onLoad({ filter: /\.html$/ }, async (args) => {
//             const html = await (
//                 await fs.promises.readFile(args.path, {
//                     encoding: 'utf-8',
//                 })
//             ).toString()

//             const jsUrls = await getHtmlScriptsUrls(html)
//             const contents = jsUrls
//                 .map((importPath) => `import '${importPath}'`)
//                 .join('\n')

//             let resolveDir = path.dirname(args.path)

//             return {
//                 loader: 'js',
//                 contents,
//                 resolveDir,
//             }
//         })
//     },
// }
