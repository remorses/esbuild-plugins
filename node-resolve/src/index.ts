import { OnResolveArgs, OnResolveResult, Plugin } from 'esbuild'
import escapeStringRegexp from 'escape-string-regexp'
import fs from 'fs'
import { builtinModules as builtins } from 'module'
import path from 'path'
import resolve, { Opts as ResolveOpts } from 'resolve'
import { promisify } from 'util'

const NAME = 'node-resolve'
const debug = require('debug')(NAME)

type ResolveAsyncOpts = ResolveOpts & { mainFields?: string[] }

export const resolveAsync: (
    id: string,
    opts: ResolveAsyncOpts,
) => Promise<string | void> = async (id, { mainFields, ..._opts }) => {
    function packageFilter(packageJSON) {
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
    }
    const opts: ResolveOpts = {
        ..._opts,
        preserveSymlinks: false,
        packageFilter,
    }
    const res = await promisify(resolve as any)(id, opts)
    return res
}

interface Options {
    // extensions is required to not implicitly fail on .json and other complex scenarios like .mjs
    name?: string
    mainFields?: string[]
    extensions: string[]
    resolveSynchronously?: boolean
    isExtensionRequiredInImportPath?: boolean
    // TODO add an importsNeedExtension to only match imports with given extension, useful to resolve css and assets only if they match regex
    namespace?: string | undefined
    onNonResolved?: (
        id: string,
        importer: string,
    ) => OnResolveResult | undefined | null | void
    onResolved?: (
        p: string,
        importer: string,
    ) => Promise<string | undefined | void | OnResolveResult> | any
    resolveOptions?: Partial<ResolveOpts>
}

export function NodeResolvePlugin({
    onNonResolved,
    namespace,
    extensions,
    onResolved,
    resolveOptions,
    mainFields,
    name = NAME,
    isExtensionRequiredInImportPath,
    resolveSynchronously,
}: Options): Plugin {
    const builtinsSet = new Set(builtins)
    debug('setup')
    const filter = new RegExp(
        '(' + extensions.map(escapeStringRegexp).join('|') + ')(\\?.*)?$', // allows query strings
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
                        loader: 'default', // TODO esbuild default loader is not working
                        contents,
                        resolveDir,
                    }
                } catch (e) {
                    return null
                }
            })

            onResolve(
                { filter: isExtensionRequiredInImportPath ? filter : /.*/ },
                async function resolver(args: OnResolveArgs) {
                    args.path = cleanUrl(args.path)
                    if (builtinsSet.has(args.path)) {
                        return null
                    }
                    if (args.path.startsWith('data:')) {
                        return null
                    }

                    let resolved
                    try {
                        const options: ResolveAsyncOpts = {
                            basedir: args.resolveDir,
                            preserveSymlinks: false,
                            extensions,
                            mainFields,
                            ...resolveOptions,
                        }
                        resolved = resolveSynchronously
                            ? resolve.sync(args.path, options)
                            : await resolveAsync(args.path, options)
                    } catch (e) {
                        debug(`not resolved ${args.path}`)
                        if (onNonResolved) {
                            let res = await onNonResolved(
                                args.path,
                                args.importer,
                            )
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
                        if (
                            res?.path != null ||
                            res?.external != null ||
                            res?.namespace != null ||
                            res?.errors != null
                        ) {
                            return res
                        }
                    }

                    debug('onResolve')
                    if (resolved) {
                        return {
                            path: resolved,
                            namespace,
                        }
                    }
                },
            )
        },
    }
}

export default NodeResolvePlugin

export const queryRE = /\?.*$/

export const cleanUrl = (url: string) => url.replace(queryRE, '')
