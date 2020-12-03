import { build } from 'esbuild'
import fs from 'fs'
import { randomOutputFile, writeFiles } from 'test-support'
import NodeResolvePlugin from '.'

require('debug').enable(require('../package.json').name)

test('works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.js': `import {x} from './utils.js'; x;`,
        'utils.js': `import resolve from 'mod'; export const x = resolve('x');`,
        'node_modules/mod/index.js': 'export default () => {}',
    })
    const outfile = randomOutputFile()
    // process.chdir(path.dirname(ENTRY))
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        bundle: true,
        plugins: [NodeResolvePlugin()],
    })
    fs.unlinkSync(outfile)
    unlink()
})
