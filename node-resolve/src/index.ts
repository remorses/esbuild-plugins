import builtins from 'builtin-modules'
import { OnResolveArgs, OnResolveResult, Plugin } from 'esbuild'
import fs from 'fs'
import path from 'path'
import resolve, { AsyncOpts } from 'resolve'
import { promisify } from 'util'

const NAME = require('../package.json').name
const debug = require('debug')(NAME)
const NAMESPACE = NAME

const resolveAsync: (
    id: string,
    opts: AsyncOpts,
) => Promise<string | void> = promisify(resolve)

interface Options {
    external?: (path: string) => boolean | OnResolveResult | undefined
    onUnresolved?: (e: Error) => OnResolveResult | undefined | null | void
    onResolved?: (p: string) => Promise<any> | any
    resolveOptions?: Partial<AsyncOpts>
}

export function NodeResolvePlugin({
    external,
    onUnresolved,
    onResolved,
    resolveOptions,
}: Options = {}): Plugin {
    const builtinsSet = new Set(builtins)
    debug('setup')
    return {
        name: NAME,
        setup: function setup({ onLoad, onResolve }) {
            onLoad({ filter: /.*/, namespace: NAMESPACE }, async (args) => {
                try {
                    const contents = await (
                        await fs.promises.readFile(args.path, {
                            encoding: 'utf-8',
                        })
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
                } catch (e) {
                    throw new Error(`Cannot load ${args.path}, ${e}`)
                }
            })

            onResolve(
                { filter: /.*/ },
                async function resolver(args: OnResolveArgs) {
                    if (builtinsSet.has(args.path)) {
                        return null
                    }
                    let resolved
                    try {
                        resolved = await resolveAsync(args.path, {
                            basedir: args.resolveDir,
                            extensions: [
                                '.ts',
                                '.tsx',
                                '.mjs',
                                '.js',
                                '.jsx',
                                '.cjs',
                            ],
                            ...resolveOptions,
                        })
                    } catch (e) {
                        debug(`not resolved ${args.path}`)
                        if (onUnresolved) {
                            let res = await onUnresolved(e)
                            return res || null
                        } else {
                            return null
                        }
                    }
                    debug('resolved', resolved)
                    if (resolved && onResolved) {
                        const res = await onResolved(resolved)
                        if (typeof res === 'string') {
                            return {
                                path: res,
                                namespace: NAMESPACE,
                            }
                        }
                        if (res?.path) {
                            return res
                        }
                    }
                    
                    // TODO remove external, external can be expressed with onResolved
                    if (external) {
                        debug('externalizing', external)
                        const res = external(resolved)
                        if (res === true) {
                            return {
                                path: resolved,
                                external: true, // TODO maybe use the ESM external trick?
                            }
                        }
                        if (res) {
                            return res
                        }
                    }

                    debug('onResolve')
                    return {
                        path: resolved,
                        namespace: NAMESPACE,
                    }
                },
            )
        },
    }
}

export default NodeResolvePlugin
