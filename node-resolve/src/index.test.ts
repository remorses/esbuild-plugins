import { build } from 'esbuild'
import { writeFiles } from 'test-support'
import NodeResolvePlugin from '.'

require('debug').enable(require('../package.json').name)

test('works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `import {x} from './utils'; console.log(x);`,
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
        plugins: [NodeResolvePlugin()],
    })
    unlink()
})
test('throws on unresolved', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.ts': `import {x} from 'xxx'; console.log(x);`,
    })
    expect(
        build({
            entryPoints: [ENTRY],
            write: false,
            bundle: true,
            plugins: [NodeResolvePlugin()],
        }),
    ).rejects.toThrow()
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
