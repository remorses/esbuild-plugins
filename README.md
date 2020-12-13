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

## @esbuild-plugins/node-resolve

Resolve files with the [resolve](https://www.npmjs.com/package/resolve) package and adds support for Yarn berry PnP.

```ts
import NodeResolve from '@esbuild-plugins/node-resolve'
import { build } from 'esbuild'
build({
    // ...
    // Adds support for Yarn berry PnP
    plugins: [NodeResolve()],
})
```

## @esbuild-plugins/esm-externals

Makes some packages externals and forces the output to be valid ESM

```ts
import EsmExternals from '@esbuild-plugins/esm-externals'
import { build } from 'esbuild'
build({
    // ...
    // all calls to `require('react') will be converted to ESM valid imports
    plugins: [EsmExternals({ externals: ['react', 'react-dom'] })],
})
```

## @esbuild-plugins/node-modules-polyfill

Polyfills nodejs builtin modules for the browser

```ts
import NodeModulesPolyfills from '@esbuild-plugins/node-modules-polyfill'
import { build } from 'esbuild'
build({
    // ...
    // you can now import modules from nodejs builtins like `path`
    plugins: [NodeModulesPolyfills()],
})
```

## @esbuild-plugins/node-globals-polyfill

Polyfills nodejs globals like `process`

```ts
import EsmExternals from '@esbuild-plugins/node-globals-polyfill'
import { build } from 'esbuild'
build({
    // ...
    // Allows you to use nodejs `process` global variable
    inject: [require.resolve('@esbuild-plugins/node-globals-polyfill/process')],
})
```

# Todos

-   [x] `@esbuild-plugins/node-resolve`
-   [x] `@esbuild-plugins/esm-externals`
-   [x] `@esbuild-plugins/node-modules-polyfill`
-   [x] `@esbuild-plugins/node-globals-polyfill`
-   [ ] `@esbuild-plugins/webpack-loader-adapter`
-   [ ] `@esbuild-plugins/html`, you can use html files as entrypoints, plugin resolves the html files to virtual js entries, plugin extracts scripts with type module, returns js made by importing these modules, loads this js to esbuild, creates the html file using the template passed from options, injects the chunks of corresponding loaded scripts back to html (found using the metafile, searching for the output files with name equal to the virtual html entries, save html files to dist
