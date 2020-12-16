import { OnResolveArgs, OnResolveResult, Plugin } from 'esbuild'
import fs from 'fs'
import { builtinModules as builtins } from 'module'
import path from 'path'
import resolve, { AsyncOpts } from 'resolve'
import { promisify } from 'util'

const NAME = require('../package.json').name
const debug = require('debug')(NAME)

export const resolveAsync: (
    id: string,
    opts: AsyncOpts,
) => Promise<string | void> = promisify(resolve)

interface Options {
    namespace?: string | undefined
    onUnresolved?: (e: Error) => OnResolveResult | undefined | null | void
    onResolved?: (p: string) => Promise<any> | any
    resolveOptions?: Partial<AsyncOpts>
}

export function NodeResolvePlugin({
    onUnresolved,
    namespace,
    onResolved,
    resolveOptions,
}: Options = {}): Plugin {
    const builtinsSet = new Set(builtins)
    debug('setup')
    return {
        name: NAME,
        setup: function setup({ onLoad, onResolve }) {
            onLoad({ filter: /.*/, namespace }, async (args) => {
                try {
                    const contents = await (
                        await fs.promises.readFile(args.path)
                    ).toString()
                    let resolveDir = path.dirname(args.path)
                    debug('onLoad')
                    return {
                        loader: 'default',
                        contents,
                        resolveDir,
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
                            preserveSymlinks: false,
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
                    // resolved = path.relative(resolved, process.cwd())
                    debug(`resolved '${resolved}'`)
                    if (resolved && onResolved) {
                        const res = await onResolved(resolved)
                        if (typeof res === 'string') {
                            return {
                                path: res,
                                namespace,
                            }
                        }
                        if (res?.path) {
                            return res
                        }
                    }

                    debug('onResolve')
                    return {
                        path: resolved,
                        namespace,
                    }
                },
            )
        },
    }
}

export default NodeResolvePlugin
