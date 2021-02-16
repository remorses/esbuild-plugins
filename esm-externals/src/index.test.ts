import { execSync } from 'child_process'
import { build } from 'esbuild'
import fs from 'fs'
import { writeFiles, randomOutputFile } from 'test-support'
import EsmExternalsPlugin, { makeFilter } from '.'

require('debug').enable(require('../package.json').name)

test('works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `import {x} from './utils';`,
        'utils.ts': `import mod from 'mod'; export const x = mod('x');`,
        'node_modules/mod/index.js': 'export default () => {}',
    })
    // const outfile = randomOutputFile()
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        format: 'esm',
        target: 'es2017',
        bundle: true,
        plugins: [EsmExternalsPlugin({ externals: ['mod'] })],
    })
    unlink()
})

test('works with both import and require', async () => {
    const {
        unlink,
        paths: [ENTRY, OUTPUT],
    } = await writeFiles({
        'entry.ts': `import {x} from './utils'; const {z} = require('mod'); z(x || '', 'ciao')`,
        'output.js': ``,
        'utils.ts': `import * as mod from 'mod'; import {z} from 'mod'; z('hello'); export const x = mod.z('x'); console.log('z', z,); console.log('namespace', {...mod});`,
        'node_modules/mod/index.esm.js': 'export const z = console.log',
        'node_modules/mod/index.cjs.js': 'exports.z = console.log',
        'node_modules/mod/package.json':
            '{ "name": "mod", "version": "0.0.0", "main": "index.cjs.js", "module": "index.esm.js" }',
    })

    const res = await build({
        entryPoints: [ENTRY],
        // write: false,
        outfile: OUTPUT,
        format: 'esm',
        minify: false,
        bundle: true,
        plugins: [EsmExternalsPlugin({ externals: ['mod'] })],
    })
    console.log(OUTPUT)
    // console.log(fs.readFileSync(OUTPUT).toString())
    const outfile = randomOutputFile()
    const res2 = await build({
        entryPoints: [OUTPUT],
        outfile,
        format: 'cjs',
        bundle: true,
    })
    const out = execSync(`node ${outfile}`, { stdio: 'pipe' })
    console.log(out.toString())
    console.log(outfile)
    // unlink()
})

describe('makeFilter', () => {
    const filter = makeFilter(['react'])
    const positiveCases = ['react', 'react/', 'react/dist', 'react/dist/index']
    for (let t of positiveCases) {
        test(t, () => {
            expect(filter.test(t)).toBe(true)
        })
    }

    const falseCases = ['reactx', 'reactx/', 'react-dom']
    for (let t of falseCases) {
        test(t, () => {
            expect(filter.test(t)).toBe(false)
        })
    }
})
