import { build } from 'esbuild'
import { writeFiles } from 'test-support'
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
