## @esbuild-plugins/esm-externals

Makes some packages externals and forces the output to be valid ESM, converting all require calls to valid ESM

```ts
import EsmExternals from '@esbuild-plugins/esm-externals'
import { build } from 'esbuild'
build({
    plugins: [EsmExternals({ externals: ['react', 'react-dom'] })],
})
```

If you would like to customize the filter for externals, you can pass a RegExp or a string to the externals option.

```ts

import EsmExternals from '@esbuild-plugins/esm-externals'
import { build } from 'esbuild'

const filter = new RegExp("^(" + ["react", "react-dom"].join("|") + ")$")
// this will make all react and react-dom packages externals, but not react/abc or react-dom/abc

build({
    plugins: [EsmExternals({ externals: ['react', 'react-dom'], filter })],
})
```