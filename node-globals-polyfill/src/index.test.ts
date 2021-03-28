import { build } from 'esbuild'
import { writeFiles } from 'test-support'
import { NodeGlobalsPolyfillPlugin } from '.'

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
    expect(output).not.toContain('process')
    unlink()
})

test('Buffer works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `console.log(Buffer.from('xxx').toString())`,
    })
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        format: 'esm',
        target: 'es2017',
        bundle: true,
        inject: [require.resolve('../buffer')],
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
        inject: [require.resolve('../Buffer')],
    })
    const output = res.outputFiles[0].text
    expect(output).not.toContain('Buffer')
    unlink()
})

test('Buffer works using plugin', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `
        let buf = new Buffer(256);
        let len = buf.write("Simply Easy Learning");
        console.log("Octets written : "+  len);`,
    })
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        format: 'esm',
        target: 'es2017',
        bundle: true,
        plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
    })
    const output = res.outputFiles[0].text
    // console.log(output)
    eval(output)
    unlink()
})
test('process works using plugin', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `console.log(process.cwd())`,
    })
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        format: 'esm',
        target: 'es2017',
        bundle: true,
        plugins: [NodeGlobalsPolyfillPlugin({ process: true })],
    })
    const output = res.outputFiles[0].text
    // console.log(output)
    eval(output)
    unlink()
})
