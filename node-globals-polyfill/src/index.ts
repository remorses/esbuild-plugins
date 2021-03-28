import path from 'path'
import * as esbuild from 'esbuild'

export function NodeGlobalsPolyfillPlugin({
    buffer = false,
    process = true,
} = {}): esbuild.Plugin {
    return {
        name: 'node-globals-polyfill',
        setup({ initialOptions, onResolve, onLoad }) {
            onResolve({ filter: /_node-buffer-polyfill_\.js/ }, (arg) => {
                return {
                    path: path.resolve(__dirname, '../Buffer.js'),
                }
            })
            onResolve({ filter: /_node-process-polyfill_\.js/ }, (arg) => {
                return {
                    path: path.resolve(__dirname, '../process.js'),
                }
            })

            const polyfills: string[] = []
            if (process) {
                polyfills.push(path.resolve(__dirname, '../_process.js'))
            }
            if (buffer) {
                polyfills.push(path.resolve(__dirname, '../_buffer.js'))
            }
            if (initialOptions.inject) {
                initialOptions.inject.push(...polyfills)
            } else {
                initialOptions.inject = [...polyfills]
            }
        },
    }
}


export default NodeGlobalsPolyfillPlugin