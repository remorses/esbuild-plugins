Create a custom resolver to resolve paths defined in tsconfig.json



```ts
import TsconfigPathsPlugin from '@esbuild-plugins/tsconfig-paths'
import { build } from 'esbuild'


build({
    plugins: [TsconfigPathsPlugin({tsconfig: })],
})

```