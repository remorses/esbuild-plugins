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
        'utils.ts': `import path from 'path'; import { Buffer } from 'buffer'; export const x = path.resolve(Buffer.from('x').toString());`,
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
    eval(res.outputFiles[0].text)
    // console.log(res.outputFiles[0].text)
    unlink()
})
test('events works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `
        import EventEmitter from 'events';

        class Test extends EventEmitter {
            constructor() { };
        }
        console.log(Test)
        `,
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
    eval(res.outputFiles[0].text)
    unlink()
})

test('require can use default export', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `
        const assert = require('assert')
        // console.log(assert)
        assert('ok')
        `,
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
    eval(res.outputFiles[0].text)
    unlink()
})

test.skip('crypto', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `import { randomBytes } from 'crypto'; (randomBytes(20).toString('hex'))`,
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
    eval(res.outputFiles[0].text)
    // console.log(res.outputFiles[0].text)
    unlink()
})
test.skip('fs', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `import { readFile } from 'fs'; readFile('')`,
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
    eval(res.outputFiles[0].text)
    // console.log(res.outputFiles[0].text)
    unlink()
})
