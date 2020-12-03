// @ts-check

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    transform: { '.(js|jsx|tx|tsx)': '@sucrase/jest-plugin' },
}

module.exports = config
