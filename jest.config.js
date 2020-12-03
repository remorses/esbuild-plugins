// @ts-check

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    transform: { '.(js|jsx|ts|tsx)': '@sucrase/jest-plugin' },
    modulePathIgnorePatterns: ['dist', 'esm', 'node_modules'],
}

module.exports = config
