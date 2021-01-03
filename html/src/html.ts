import posthtml, { Node, Plugin } from 'posthtml'

export async function getHtmlScriptsUrls(html: string) {
    const urls: string[] = []
    const transformer = posthtml([
        (tree) => {
            tree.walk((node) => {
                if (
                    node &&
                    node.tag === 'script' &&
                    node.attrs &&
                    node.attrs['type'] === 'module' &&
                    node.attrs['src'] &&
                    isRelative(node.attrs['src'])
                ) {
                    urls.push(node.attrs['src'])
                }
                return node
            })
        },
    ])
    try {
        await transformer.process(html)
    } catch (e) {
        throw new Error(`Cannot process html with posthtml: ${e}\n${html}`)
    }
    return urls.filter(Boolean)
}

export const bareImportRE = /^[^\/\.]/
export function isRelative(x: string) {
    x = cleanUrl(x)
    return bareImportRE.test(x) || x.startsWith('.') || x.startsWith('/')
}

export const queryRE = /\?.*$/
export const hashRE = /#.*$/

export const cleanUrl = (url: string) => {
    return url.replace(hashRE, '').replace(queryRE, '')
}
