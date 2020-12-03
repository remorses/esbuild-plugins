import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import { v4 } from 'uuid'

export async function writeFiles(graph: { [name: string]: string }) {
    const dirname = v4().slice(0, 4)
    const base = path.resolve(os.tmpdir(), dirname)
    await fs.ensureDir(base)
    const promises = Object.keys(graph).map(async (name) => {
        const p = path.resolve(base, name)
        await fs.createFile(p)
        await fs.writeFile(p, graph[name] || '')
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
