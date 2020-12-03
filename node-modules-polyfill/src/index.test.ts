import { build } from 'esbuild'
import { writeFiles } from 'test-support'
import NodeModulesPolyfillsPlugin from '.'

require('debug').enable(require('../package.json').name)

test('works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `import {x} from './utils'; console.log(x);`,
        'utils.ts': `import path from 'path'; export const x = path.resolve('x');`,
    })
    // const outfile = randomOutputFile()
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        format: 'esm',
        target: 'es2017',
        bundle: true,
        plugins: [NodeModulesPolyfillsPlugin()],
    })
    // console.log(res.outputFiles[0].text)
    unlink()
})
