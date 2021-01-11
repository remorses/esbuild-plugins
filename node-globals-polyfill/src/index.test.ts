import { build } from 'esbuild'
import { writeFiles } from 'test-support'

require('debug').enable(require('../package.json').name)

test('process works', async () => {
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

test('process is tree shaken', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `console.log('hei')`,
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
    expect(output.length).not.toContain('process')
    unlink()
})

test('Buffer works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `new Buffer('xxx')`,
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

test('Buffer is tree shaken', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `console.log('hei')`,
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
    expect(output.length).not.toContain('Buffer')
    unlink()
})
