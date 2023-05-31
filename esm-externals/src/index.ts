import escapeStringRegexp from 'escape-string-regexp'
const NAME = 'esm-externals'
const NAMESPACE = NAME

export function EsmExternalsPlugin({ externals }: { externals: string[] | RegExp  }) {
    return {
        name: NAME,
        setup(build) {
            const filter = Array.isArray(externals) ? makeFilter(externals) : externals;

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
                    contents: `export * as default from ${JSON.stringify(args.path)}; export * from ${JSON.stringify(args.path)};`,
                }
            })
        },
    }
}

export default EsmExternalsPlugin

export function makeFilter(externals: string[]) {
    return new RegExp(
        '^(' + externals.map(escapeStringRegexp).join('|') + ')(\\/.*)?$', // TODO support for query strings?
    )
}
