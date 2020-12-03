import { build } from 'esbuild'
import path from 'path'
import { writeFiles } from 'test-support'
import NodeResolvePlugin from '.'

require('debug').enable(require('../package.json').name)

build
test('works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.js': `import {x} from './utils.js'; x;`,
        'utils.js': `import resolve from 'resolve'; export const x = resolve('x');`,
    })
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        bundle: true,
        format: 'esm',
        plugins: [NodeResolvePlugin()],
    })
    console.log(res.outputFiles.map((x) => x.text))
    unlink
})
