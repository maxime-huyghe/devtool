const webpack = require('webpack')

module.exports = {
    pluginOptions: {},
    configureWebpack: {
        devtool: 'source-map',
        plugins: [new webpack.ExternalsPlugin('commonjs', ['electron'])],
    },
    productionSourceMap: false,
    css: {
        sourceMap: true,
    },
}
