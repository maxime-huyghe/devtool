module.exports = {
  pluginOptions: {
    electronBiulder: {
      externals: ['dns'],
    }
  },
  productionSourceMap: false,
  css: {
    sourceMap: true
  },
}