import { OnResolveArgs, OnResolveResult, Plugin } from 'esbuild'
import escapeStringRegexp from 'escape-string-regexp'
import fs from 'fs'
import { builtinModules as builtins } from 'module'
import path from 'path'
import resolve, { AsyncOpts } from 'resolve'
import { promisify } from 'util'

const NAME = 'node-resolve'
const debug = require('debug')(NAME)

export const resolveAsync: (
    id: string,
    opts: AsyncOpts,
) => Promise<string | void> = async (id, opts) => {
    const result = await promisify(resolve as any)(id, opts)
    if (
        result &&
        opts.extensions &&
        !opts.extensions.includes(path.extname(result))
    ) {
        return
    }
    return result
}

interface Options {
    // extensions is required to not implicitly fail on .json and other complex scenarios like .mjs
    name?: string
    mainFields?: string[]
    extensions: string[]
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
    resolveOptions?: Partial<AsyncOpts>
}

let isUsingYarnPnp = false

try {
    require('pnpapi')
    isUsingYarnPnp = true
} catch {}

export function NodeResolvePlugin({
    onNonResolved,
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
                        loader: 'default', // TODO esbuild default loader is not working
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
                        preserveSymlinks: false,
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
                    if (onNonResolved) {
                        let res = await onNonResolved(args.path, args.importer)
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
            })
        },
    }
}

export default NodeResolvePlugin
