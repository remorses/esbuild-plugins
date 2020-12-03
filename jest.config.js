// @ts-check

const path = require('path')

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    transform: { '.(js|jsx|ts|tsx)': '@sucrase/jest-plugin' },
    roots: require('./package.json').workspaces.packages.map((x) =>
        path.join('<rootDir>', x, 'src'),
    ),

    modulePathIgnorePatterns: ['dist', 'esm', 'node_modules'],
    testEnvironment: 'node',
}

module.exports = config
