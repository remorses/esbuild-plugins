import builtins from 'builtin-modules'
import { OnResolveArgs, Plugin } from 'esbuild'
import fs from 'fs'
import path from 'path'
import resolve from 'resolve'
import { promisify } from 'util'

const NAME = require('../package.json').name
const debug = require('debug')(NAME)
const NAMESPACE = NAME

const resolveAsync = promisify(resolve)

interface Options {
    external?: (path : string) => boolean
    unresolvedAreExternals?: boolean
}

export function NodeResolvePlugin({
    unresolvedAreExternals = false,
    external=undefined
}: Options = {}): Plugin {
    const builtinsSet = new Set(builtins)

    return {
        name: NAME,
        setup: function setup({ onLoad, onResolve }) {
            onLoad({ filter: /.*/, namespace: NAMESPACE }, async (args) => {
                const contents = await (
                    await fs.promises.readFile(args.path)
                ).toString()
                let resolveDir = path.dirname(args.path)
                // console.log({ resolveDir })
                debug('onLoad')
                return {
                    loader: 'default',
                    contents,
                    resolveDir,
                    // errors: [{ text: resolveDir }],
                }
            })

            onResolve({ filter: /.*/ }, async function resolver(
                args: OnResolveArgs,
            ) {
                if (builtinsSet.has(args.path)) {
                    return null
                }
                const resolved = await resolveAsync(args.path, {
                    basedir: args.resolveDir,
                    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.cjs'],
                })
                debug('resolved', resolved)
                if (external && external(resolved)) {
                    debug('externalizing', external)
                    return {
                        external: true // TODO maybe use the ESM external trick?
                    }
                }

                if (!resolved) {
                    debug(`not resolved ${args.path}`)
                    if (unresolvedAreExternals) {
                        return {
                            external: true,
                            errors: [
                                { text: 'could not resolve ' + args.path },
                            ],
                        }
                    }
                    return null
                }
                debug('onResolve')
                return {
                    path: resolved,
                    namespace: NAMESPACE,
                }
            })
        },
    }
}

export default NodeResolvePlugin
