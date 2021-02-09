## @esbuild-plugins/esm-externals

Makes some packages externals and forces the output to be valid ESM, converting all require calls to valid ESM

```ts
import EsmExternals from '@esbuild-plugins/esm-externals'
import { build } from 'esbuild'
build({
    plugins: [EsmExternals({ externals: ['react', 'react-dom'] })],
})
```
