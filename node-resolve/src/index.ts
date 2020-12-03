import { build, OnResolveArgs, Plugin } from 'esbuild'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import builtins from 'builtin-modules'
import resolve from 'resolve'

const NAMESPACE = 'node-resolve'

const resolveAsync = promisify(resolve)

export function NodeResolvePlugin(): Plugin {
    const builtinsSet = new Set(builtins)
    return {
        name: 'custom-resolver',
        setup: function setup({ onLoad, onResolve }) {
            onLoad({ filter: /.*/, namespace: NAMESPACE }, async (args) => {
                const contents = await (
                    await fs.promises.readFile(args.path)
                ).toString()
                let resolveDir = path.dirname(args.path)
                // console.log({ resolveDir })
                return {
                    loader: 'js',
                    contents,
                    resolveDir,
                    // errors: [{ text: resolveDir }],
                }
            })
            
            
            onResolve({ filter: /.*/ }, async function resolver(args: OnResolveArgs)  {
                if (builtinsSet.has(args.path)) {
                    return null
                }
                const resolved = await resolveAsync(args.path, {
                    basedir: args.resolveDir,
                    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx',  '.cjs'],
                })

                if (!resolved) {
                    return {
                        external: true,
                        errors: [{ text: 'could not resolve ' + args.path }],
                    }
                }
                return {
                    path: resolved,
                    namespace: NAMESPACE,
                }
            })

            // onResolve({ filter: /.*/, namespace: NAMESPACE }, resolver)
        },
    }
}


export default NodeResolvePlugin