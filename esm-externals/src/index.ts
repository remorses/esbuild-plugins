import escapeStringRegexp from 'escape-string-regexp'
const NAME = require('../package.json').name
const debug = require('debug')(NAME)
const NAMESPACE = NAME

export function EsmExternalsPlugin({ externals }: { externals: string[] }) {
    return {
        name: NAME,
        setup(build) {
            const filter = new RegExp(
                externals.map(escapeStringRegexp).join('|'),
            )
            build.onResolve({ filter: /.*/, namespace: NAMESPACE }, (args) => {
                return {
                    path: args.path,
                    external: true,
                }
            })
            build.onResolve({ filter }, (args) => {
                return {
                    path: args.path,
                    namespace: NAMESPACE,
                }
            })
            build.onLoad({ filter: /.*/, namespace: NAMESPACE }, (args) => {
                return {
                    contents: `export * from ${JSON.stringify(args.path)}`,
                }
            })
        },
    }
}

export default EsmExternalsPlugin
