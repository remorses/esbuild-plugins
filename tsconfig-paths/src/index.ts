import { Plugin } from 'esbuild'
import path from 'path'
import fs from 'fs'
import { nodeModuleNameResolver, sys } from 'typescript'
import findUp from 'find-up'
import stripJsonComments from 'strip-json-comments'

const NAME = require('../package.json').name
const debug = require('debug')(NAME)

interface Options {
    name?: string
    absolute?: boolean
    tsconfig?: Tsconfig | string
    onResolved?: (resolved: string) => any
    // aliases: Record<string, string[]>
}

interface Tsconfig {
    baseUrl?: string
    compilerOptions?: {
        paths?: Record<string, string[]>
    }
}

export function TsconfigPathsPlugin({
    name = NAME,
    absolute = true,
    onResolved,
    tsconfig,
}: Options): Plugin {
    debug('setup')
    const compilerOptions = loadCompilerOptions(tsconfig)
    return {
        name,
        setup: function setup({ onResolve }) {
            onResolve({ filter: /.*/ }, async (args) => {
                const hasMatchingPath = Object.keys(
                    compilerOptions?.paths || {},
                ).some((path) =>
                    new RegExp(path.replace('*', '\\w*')).test(args.path),
                )

                if (!hasMatchingPath) {
                    return null
                }

                const { resolvedModule } = nodeModuleNameResolver(
                    args.path,
                    args.importer,
                    compilerOptions || {},
                    sys,
                )

                if (!resolvedModule) {
                    return null
                }

                const { resolvedFileName } = resolvedModule

                if (!resolvedFileName || resolvedFileName.endsWith('.d.ts')) {
                    return null
                }

                let resolved = absolute
                    ? sys.resolvePath(resolvedFileName)
                    : resolvedFileName

                if (onResolved) {
                    onResolved(resolved)
                }

                return {
                    path: resolved,
                }
            })
        },
    }
}

function loadJSON(p: string) {
    try {
        let data = fs.readFileSync(p).toString()
        data = stripJsonComments(data)
        return JSON.parse(data)
    } catch (e) {
        throw new Error(`Cannot load json for '${p}'`)
    }
}

function loadCompilerOptions(tsconfig?: Tsconfig | string) {
    if (!tsconfig) {
        const configPath = findUp.sync(['tsconfig.json', 'jsconfig.json'])
        if (configPath) {
            const config = loadJSON(configPath)
            return config['compilerOptions'] || {}
        }
    }
    if (typeof tsconfig === 'string') {
        if (fs.existsSync(tsconfig)) {
            const config = loadJSON(tsconfig)
            return config['compilerOptions'] || {}
        }
    }
    if (tsconfig && tsconfig['compilerOptions']) {
        return tsconfig['compilerOptions']
    }
    return {}
}

export default TsconfigPathsPlugin
