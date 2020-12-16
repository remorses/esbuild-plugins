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
    emitHtml?: (arg: { path: string; html: string }) => Promise<void>
}

export function HtmlPlugin({}: Options = {}): Plugin {
    debug('setup')
    return {
        name: NAME,
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
                    path: resolved.replace('.html', '.html.js'),
                }
            })
            onLoad({ filter: /\.html\.js$/ }, async (args) => {
                try {
                    const realFilePath = args.path.replace('.html.js', '.html')
                    const html = await (
                        await fs.promises.readFile(realFilePath, {
                            encoding: 'utf-8',
                        })
                    ).toString()

                    const jsUrls = await getHtmlScriptsUrls(html)

                    const contents = jsUrls
                        .map((importPath) => {
                            if (importPath.startsWith('/')) {
                                importPath = '.' + importPath
                            }
                            if (bareImportRE.test(importPath)) {
                                importPath = './' + importPath
                            }
                            return importPath
                        })
                        .map((importPath) => `import '${importPath}'`)
                        .join('\n')

                    let resolveDir = path.dirname(args.path)

                    debug('onLoad')
                    return {
                        loader: 'file',
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

export default HtmlPlugin

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
