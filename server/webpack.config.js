const path = require('path');
const fs = require('fs');

const nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    mode: 'production',
    entry: './dist/app.js',
    target: 'node',
    cache: true,
    output: {
        path: path.resolve(__dirname, 'pack'),
        filename: 'server.js'
    },
    externals: nodeModules
}