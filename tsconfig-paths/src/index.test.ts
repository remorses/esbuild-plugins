import { build } from 'esbuild'
import { writeFiles } from 'test-support'
import Plugin from '.'
import slash from 'slash'
import path from 'path'

require('debug').enable(require('../package.json').name)

test('works', async () => {
    const {
        unlink,
        base,
        paths: [ENTRY, UTILS],
    } = await writeFiles({
        'entry.ts': `import {x} from '@custom'; console.log(x);`,
        'utils.ts': `import mod from 'mod'; export const x = mod('x');`,
        'node_modules/mod/index.js': 'export default () => {}',
    })
    let called = 0
    let resolved: string[] = []
    const tsconfig = {
        baseUrl: '.',
        compilerOptions: { paths: { '@custom': [UTILS] } },
    }
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        format: 'esm',
        target: 'es2017',
        bundle: true,
        plugins: [
            Plugin({
                tsconfig,
                onResolved: (p) => {
                    called++
                    resolved.push(p)
                },
            }),
        ],
    })
    expect(called).toBe(1)
    const expected = ['utils.ts']
    expect(resolved.map((x) => slash(path.relative(base, x)))).toEqual(expected)
    unlink()
})
