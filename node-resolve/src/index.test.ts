import { build } from 'esbuild'
import { writeFiles } from 'test-support'
import NodeResolvePlugin from '.'
import slash from 'slash'
import path from 'path'

require('debug').enable(require('../package.json').name)

test('works', async () => {
    const {
        unlink,
        base,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `import {x} from './utils'; console.log(x);`,
        'utils.ts': `import mod from 'mod'; export const x = mod('x');`,
        'node_modules/mod/index.js': 'export default () => {}',
    })
    let called = 0
    let resolved: string[] = []
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        format: 'esm',
        target: 'es2017',
        bundle: true,
        plugins: [
            NodeResolvePlugin({
                onUnresolved: (e) => {
                    throw e
                },
                onResolved: (x) => {
                    resolved.push(x)
                    called++
                    return x
                },
            }),
        ],
    })
    expect(called).toBe(3)
    const expected = ['entry.ts', 'utils.ts', 'node_modules/mod/index.js']
    expect(resolved.map((x) => slash(path.relative(base, x)))).toEqual(expected)
    unlink()
})

test('does not throw when onUnresolved', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `import {x} from 'xxx'; console.log(x);`,
    })
    let called = false

    await build({
        entryPoints: [ENTRY],
        write: false,
        bundle: true,
        plugins: [
            NodeResolvePlugin({
                onUnresolved: () => {
                    called = true
                    return {
                        external: true,
                    }
                },
            }),
        ],
    })
    expect(called).toBeTruthy()
    unlink()
})
