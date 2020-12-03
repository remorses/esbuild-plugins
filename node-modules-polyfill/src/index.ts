import builtins from 'builtin-modules'
import { OnResolveArgs, Plugin } from 'esbuild'
import escapeStringRegexp from 'escape-string-regexp'
import fs from 'fs'
import path from 'path'
import { builtinsPolyfills } from './polyfills'

const NAME = require('../package.json').name
const debug = require('debug')(NAME)
const NAMESPACE = NAME

function removeEndingSlash(importee) {
    if (importee && importee.slice(-1) === '/') {
        importee = importee.slice(0, -1)
    }
    return importee
}

export interface NodePolyfillsOptions {
    fs?: boolean
    crypto?: boolean
}

export function NodeModulesPolyfillPlugin(
    options: NodePolyfillsOptions = {},
): Plugin {
    const builtinsSet = new Set(builtins)

    const polyfilledBuiltins = builtinsPolyfills(options)
    const polyfilledBuiltinsNames = [...polyfilledBuiltins.keys()]

    return {
        name: NAME,
        setup: function setup({ onLoad, onResolve }) {
            onLoad({ filter: /.*/, namespace: NAMESPACE }, async (args) => {
                const resolved = polyfilledBuiltins.get(
                    removeEndingSlash(args.path),
                )
                const contents = await (
                    await fs.promises.readFile(resolved)
                ).toString()
                let resolveDir = path.dirname(resolved)
                // console.log({ resolveDir })
                debug('onLoad')
                return {
                    loader: 'js',
                    contents,
                    resolveDir,
                }
            })
            const filter = new RegExp(
                polyfilledBuiltinsNames.map(escapeStringRegexp).join('|'), // TODO builtins could end with slash, keep in mind in regex
            )

            onResolve({ filter }, async function resolver(args: OnResolveArgs) {
                if (builtinsSet.has(args.path)) {
                    return {
                        namespace: NAMESPACE,
                        path: args.path,
                    }
                }
                return null
            })
        },
    }
}

export default NodeModulesPolyfillPlugin
