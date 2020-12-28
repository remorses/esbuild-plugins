<div align='center'>
    <br/>
    <br/>
    <!-- <img src='' width='320px'> -->
    <br/>
    <h3>Esbuild plugins</h3>
    <p>project under heavy development</p>
    <br/>
    <br/>
</div>

# Plugins

-   [x] `@esbuild-plugins/node-resolve`
-   [x] `@esbuild-plugins/esm-externals`
-   [x] `@esbuild-plugins/node-modules-polyfill`
-   [x] `@esbuild-plugins/node-globals-polyfill`
-   [x] `@esbuild-plugins/tsconfig-paths`
-   [ ] `@esbuild-plugins/webpack-loader-adapter`
-   [ ] `@esbuild-plugins/html`

## @esbuild-plugins/node-resolve

Resolve files with the [resolve](https://www.npmjs.com/package/resolve) package and adds support for Yarn berry PnP.

```ts
import NodeResolve from '@esbuild-plugins/node-resolve'
import { build } from 'esbuild'
build({
    plugins: [
        NodeResolve({
            onResolved: (resolved) => {
                if (resolved.includes('node_modules')) {
                    return {
                        external: true,
                    }
                }
                return resolved
            },
        }),
    ],
})
```

## @esbuild-plugins/esm-externals

Makes some packages externals and forces the output to be valid ESM

```ts
import EsmExternals from '@esbuild-plugins/esm-externals'
import { build } from 'esbuild'
build({
    plugins: [EsmExternals({ externals: ['react', 'react-dom'] })],
})
```

## @esbuild-plugins/node-modules-polyfill

Polyfills nodejs builtin modules for the browser

```ts
import NodeModulesPolyfills from '@esbuild-plugins/node-modules-polyfill'
import { build } from 'esbuild'
build({
    plugins: [NodeModulesPolyfills()],
})
```

## @esbuild-plugins/node-globals-polyfill

Polyfills nodejs globals like `process`

```ts
import EsmExternals from '@esbuild-plugins/node-globals-polyfill'
import { build } from 'esbuild'
build({
    inject: [require.resolve('@esbuild-plugins/node-globals-polyfill/process')],
})
```
