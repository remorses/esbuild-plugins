import { Plugin } from 'esbuild'
import fs from 'fs'
import path from 'path'
import { bareImportRE, getHtmlScriptsUrls } from './html'
import { NodeResolvePlugin } from '@esbuild-plugins/node-resolve'
const NAME = require('../package.json').name
const debug = require('debug')(NAME)

interface Options {
    // TODO i need to know the esbuild output entrypoint to inject it into the html, 
    // TODO i need to emit html file but i don't know the outdir
    emitHtml?: (arg: { path: string; html: string }) => Promise<void>
}

/*
you can use html files as entrypoints, 
plugin resolves the html files to virtual js entries,
plugin extracts scripts with type module, 
returns js made by importing these modules, 
loads this js to esbuild, 
creates the html file using the template passed from options, 
find chunks using the metafile, searching for the output files with name equal to the virtual html entries, save html files to dist
injects the chunks of corresponding loaded scripts back to html 

*/

export function HtmlPlugin({}: Options = {}): Plugin {
    debug('setup')
    return {
        name: NAME,
        setup: function setup({ onLoad, onResolve }) {
            NodeResolvePlugin({
                resolveOptions: { extensions: ['.html'] },
                namespace: null,
            }).setup({ onResolve, onLoad() {} })
            onLoad({ filter: /\.html$/ }, async (args) => {
                try {
                    const html = await (
                        await fs.promises.readFile(args.path, {
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
                        loader: 'js',
                        contents,
                        resolveDir,
                        // errors: [{ text: resolveDir }],
                    }
                } catch (e) {
                    throw new Error(`Cannot load ${args.path}, ${e}`)
                }
            })
        },
    }
}

export default HtmlPlugin
