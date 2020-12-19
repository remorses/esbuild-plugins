import { build, BuildOptions } from 'esbuild'
import { formatEsbuildOutput, writeFiles } from 'test-support'
import HtmlPlugin from '.'

require('debug').enable(require('../package.json').name)

// test('css', async () => {
//     const {
//         unlink,
//         paths: [ENTRY],
//     } = await writeFiles({
//         'entry.ts': `import './file1.css'; import './file2.css'; console.log('x');`,
//         'file1.css': `body { background: red; }`,
//         'file2.css': `body { background: red; }`,
//     })
//     // const outfile = randomOutputFile()
//     const res = await build({
//         entryPoints: [ENTRY],
//         outdir: 'x',
//         write: false,
//         format: 'esm',
//         target: 'es2017',
//         bundle: true,
//         plugins: [HtmlPlugin()],
//     })

//     console.log(formatEsbuildOutput(res))
//     unlink()
// })

const options: BuildOptions = {
    outdir: 'out',
    write: false,
    format: 'esm',
    // metafile: 'metafile.json',
    bundle: true,
    splitting: true,
    plugins: [HtmlPlugin()],
}
test('works', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entry.html': `
            <html>
                <body>
                    <script src="main.js" type="module"></script>
                </body>
            </html>
        `,
        'main.js': `import './file1.css'; import './file2.css'; console.log('x');`,
        'file1.css': `body { background: red; }`,
        'file2.css': `body { background: red; }`,
    })
    // const outfile = randomOutputFile()
    const res = await build({
        entryPoints: [ENTRY],
        ...options,
    })
    console.log(formatEsbuildOutput(res))
    unlink()
})

test('multiple entries', async () => {
    const { unlink, paths } = await writeFiles({
        '1.html': `
            <html>
                <body>
                    <script src="main1.js" type="module"></script>
                </body>
            </html>
        `,
        '2.html': `
            <html>
                <body>
                    <script src="main2.js" type="module"></script>
                </body>
            </html>
        `,
        'main1.js': `import './file1.css'; console.log('x'); export const x = 9`,
        'main2.js': `import './file1.css'; import './file2.css'; console.log('x');`,
        'file1.css': `body { background: red; }`,
        'file2.css': `body { background: red; }`,
    })
    // const outfile = randomOutputFile()
    const res = await build({
        entryPoints: paths.slice(0, 2),
        // metafile: 'meta',
        ...options,
    })
    console.log('multiple entries', formatEsbuildOutput(res))
    unlink()
})

test('multiple html scripts', async () => {
    const {
        unlink,
        paths: [ENTRY],
    } = await writeFiles({
        'entrypoint.html': `
            <html>
                <body>
                    <script src="main1.js" type="module"></script>
                    <script src="main2.js" type="module"></script>
                </body>
            </html>
        `,
        'main1.js': `import './file1.css'; import './file2.css'; console.log('x');`,
        'main2.js': `import './file1.js'; console.log('x');`,
        'file1.js': ` console.log('x');`,
        'file1.css': `body { background: red; }`,
        'file2.css': `body { background: red; }`,
    })
    // const outfile = randomOutputFile()
    const res = await build({
        entryPoints: [ENTRY],
        ...options,
    })
    console.log(formatEsbuildOutput(res))
    unlink()
})
