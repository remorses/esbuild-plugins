import { build } from 'esbuild'
import path from 'path'
import { writeFiles } from 'test-support'
import NodeResolvePlugin from '.'

// TODO make an util that generates some files on disk, run esbuild on those

build
test('works', async () => {
    const [ENTRY] = await writeFiles({
        'entry.js': `import resolve from './resolve'`,
    })
    const res = await build({
        entryPoints: [ENTRY],
        write: false,
        plugins: [NodeResolvePlugin()],
    })
    res.outputFiles.find((x) => {
        path.basename(x.path) === ENTRY
        x.path
    })
})
