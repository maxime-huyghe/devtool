const webpack = require('webpack')

module.exports = {
  pluginOptions: {
    electronBiulder: {
      preload: 'src/preload.js',
      nodeIntegration: true,
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.ExternalsPlugin('commonjs', [
        'electron'
      ])
    ]
  },
  productionSourceMap: false,
  css: {
    sourceMap: true
  },
}