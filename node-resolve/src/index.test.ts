import { build } from 'esbuild'
import { randomOutputFile, writeFiles } from 'test-support'
import NodeResolvePlugin from '.'
import fs from 'fs'

require('debug').enable(require('../package.json').name)


test('works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.js': `import {x} from './utils.js'; x;`,
        'utils.js': `import resolve from 'mod'; export const x = resolve('x');`,
        'node_modules/mod/index.js': 'export default 9',
        'node_modules/mod/package.json': JSON.stringify({
            name: 'resolve',
        }),
    })
    const outfile = randomOutputFile()
    const res = await build({
        entryPoints: [ENTRY],
        outfile,
        // write: false,
        bundle: true,
        plugins: [NodeResolvePlugin()],
    })
    fs.unlinkSync(outfile)
    unlink()
})
