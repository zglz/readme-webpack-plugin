const webpack = require('webpack');
const path = require('path')
const utils = require('./utils')
const vueLoaderConfig = require('./vue-loader.conf')
const isProduction = process.env.NODE_ENV === 'prod'

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [path.join(__dirname)],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: true,
    fix: true
  }
})

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  context: __dirname,
  entry: './index',
  output: {
    path: path.resolve(__dirname, '../client-dist'),
    filename: 'index.js',
    // publicPath: '/'
  },
  devtool: !isProduction?'source-map':'none',
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  watch: !isProduction,
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        include: [
          path.join(__dirname),
          resolve('public'),
          resolve("node_modules/_asn1.js@5.4.1@asn1.js"),
          resolve("node_modules/_highlight.js@11.2.0@highlight.js"),
        ],
        options: {
          presets: [  
            ["env", {
              "modules": false,
              "targets": {
                "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
              }
            }],
            "stage-2"
          ],
          plugins: [
            [
              "component",
              {
                "libraryName": "element-ui",
                "styleLibraryName": "theme-chalk"
              }
            ],
            "transform-vue-jsx",
            "transform-runtime"
          ]
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '/fonts/[name].[hash:7].[ext]'
        }
      },
      ...utils.styleLoaders({ sourceMap: true, usePostCSS: true }),
      createLintingRule()
    ]
  },
  plugins: (plugins => {
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: process.env.NODE_ENV
        }
      }),
      plugins.push(
        new webpack.ProgressPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
      );
      if(isProduction){
        plugins.push(
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: false,
              negate_iife: false
            },
            mangle: true,
            comments: false,
            sourceMap: true
          })
        )
      }
    return plugins;
  })([])
};
