import { build } from 'esbuild'
import { writeFiles } from 'test-support'

require('debug').enable(require('../package.json').name)

test('works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `process.version`,
    })
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        format: 'esm',
        target: 'es2017',
        bundle: true,
        inject: [require.resolve('../process')],
    })
    const output = res.outputFiles[0].text
    // console.log(output)
    eval(output)
    unlink()
})
