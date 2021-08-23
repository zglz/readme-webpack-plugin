'use strict'
const utils = require('./utils')
const isProduction = process.env.NODE_ENV === 'prod'
const sourceMapEnabled = isProduction? false: true
module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract: false
  }),
  cssSourceMap: sourceMapEnabled,
  cacheBusting: true,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  },
  hotReload:false
}
