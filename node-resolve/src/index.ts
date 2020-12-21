import { OnResolveArgs, OnResolveResult, Plugin } from 'esbuild'
import escapeStringRegexp from 'escape-string-regexp'
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
    // extensions is required to not implicitly fail on .json and other complex scenarios like .mjs
    name?: string
    mainFields?: string[]
    extensions: string[]
    namespace?: string | undefined
    onNonResolved?: (id: string) => OnResolveResult | undefined | null | void
    onResolved?: (p: string, importer: string) => Promise<any> | any
    resolveOptions?: Partial<AsyncOpts>
}

let isUsingYarnPnp = false

try {
    require('pnpapi')
    console.log('Using Yarn PnP resolver')
    isUsingYarnPnp = true
} catch {}

export function NodeResolvePlugin({
    onNonResolved: onUnresolved,
    namespace,
    extensions,
    onResolved,
    resolveOptions,
    mainFields,
    name = NAME,
}: Options): Plugin {
    const builtinsSet = new Set(builtins)
    debug('setup')
    const filter = new RegExp(
        '(' + extensions.map(escapeStringRegexp).join('|') + ')$',
    )
    return {
        name,
        setup: function setup({ onLoad, onResolve }) {
            onLoad({ filter, namespace }, async (args) => {
                try {
                    if (builtinsSet.has(args.path)) {
                        return
                    }
                    const contents = await fs.promises.readFile(args.path) // do not convert to string to support images and other assets
                    let resolveDir = path.dirname(args.path)
                    debug('onLoad')
                    return {
                        loader: 'default',
                        contents,
                        resolveDir,
                    }
                } catch (e) {
                    return null
                    throw new Error(`Cannot load ${args.path}, ${e}`)
                }
            })

            onResolve({ filter: /.*/ }, async function resolver(
                args: OnResolveArgs,
            ) {
                if (builtinsSet.has(args.path)) {
                    return null
                }
                let resolved
                try {
                    resolved = await resolveAsync(args.path, {
                        basedir: args.resolveDir,
                        preserveSymlinks: isUsingYarnPnp,
                        extensions,
                        packageFilter: (packageJSON) => {
                            if (!mainFields?.length) {
                                return packageJSON
                            }
                            // changes the main field to be another field
                            for (let mainField of mainFields) {
                                if (mainField === 'main') {
                                    break
                                }
                                const newMain = packageJSON[mainField]
                                if (newMain && typeof newMain === 'string') {
                                    debug(`set main to '${mainField}`)
                                    packageJSON['main'] = newMain
                                    break
                                }
                            }
                            return packageJSON
                        },
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
                    const res = await onResolved(resolved, args.importer)
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
            })
        },
    }
}

export default NodeResolvePlugin
