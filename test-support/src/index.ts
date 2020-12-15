import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import { build, BuildResult, OutputFile } from 'esbuild'
import { v4 } from 'uuid'

export async function writeFiles(graph: { [name: string]: string }) {
    const dirname = v4().slice(0, 4)
    const base = path.resolve(os.tmpdir(), dirname)
    await fs.ensureDir(base)
    const promises = Object.keys(graph).map(async (name) => {
        const p = path.resolve(base, name)
        await fs.createFile(p)
        const content = (graph[name] || '') + '\n'
        await fs.writeFile(p, content, { encoding: 'utf8' })
        return p
    })
    const paths = await Promise.all(promises)
    function unlink() {
        paths.forEach((x) => {
            fs.unlinkSync(x)
        })
    }
    return { unlink, paths }
}

export function randomOutputFile() {
    const filename = v4().slice(0, 4) + '.js'
    const outfile = path.resolve(os.tmpdir(), filename)
    return outfile
}

export function formatEsbuildOutput(res: { outputFiles?: OutputFile[] }) {
    if (!res?.outputFiles?.length) {
        return 'No outputs!'
    }
    return res.outputFiles.map((x) => x.path + ':\n' + x.text).join(`\n---\n`)
}
