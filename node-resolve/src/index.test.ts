import { build } from 'esbuild'
import path from 'path'
import { writeFiles } from 'test-support'
import NodeResolvePlugin from '.'

require('debug').enable(require('../package.json').name)


build
test('works', async () => {
    const [ENTRY] = await writeFiles({
        'entry.js': `import './utils.js`,
        'utils.js': `import resolve from './resolve'`
    })
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        plugins: [NodeResolvePlugin()],
    })
    res.outputFiles.find((x) => {
        path.basename(x.path) === ENTRY
        x.path
    })
})
