var webpack = require('webpack');
var utils=require("./utils");

var fullPath  = utils.fullPath;
var pickFiles = utils.pickFiles;

// 项目根路径
var ROOT_PATH = fullPath('../');
// 项目源码路径
var SRC_PATH = ROOT_PATH + '/src';
// 产出路径
var DIST_PATH = ROOT_PATH + '/dist';

// node_modules
var NODE_MODULES_PATH =  ROOT_PATH + '/node_modules';
// 是否是开发环境
var __DEV__ = process.env.NODE_ENV !== 'production';

// conf
var alias = pickFiles({
  id: /(conf\/[^\/]+).js$/,
  pattern: SRC_PATH + '/conf/*.js'
});

// components
// import Alert from 'components/alert';
alias = Object.assign(alias, pickFiles({
  id: /(components\/[^\/]+)/,
  pattern: SRC_PATH + '/components/*/index.js'
}));

// reducers
// import reducers from 'reducers/index';
alias = Object.assign(alias, pickFiles({
  id: /(reducers\/[^\/]+).js/,
  pattern: SRC_PATH + '/js/reducers/*'
}));

// actions
// import actions from 'actions/index';
alias = Object.assign(alias, pickFiles({
  id: /(actions\/[^\/]+).js/,
  pattern: SRC_PATH + '/js/actions/*'
}));


var config = {
  context: SRC_PATH,
  //页面入口文件
  entry: {
    app: ['./pages/app.js'],
    lib:[
      'react', 'react-dom', 'react-router',
      'redux', 'react-redux', 'redux-thunk'
    ]
  },
  //入口文件输出配置
  output: {
    path: DIST_PATH,
    // chunkhash 不能与 --hot 同时使用
    // see https://github.com/webpack/webpack-dev-server/issues/377
    filename: 'js/[name].[hash].js'
  },
  module: {
    //加载器配置
  },
  //其他解决方案配置
  resolve: {
    alias: alias
  },
  //插件项
  plugins: [
    new webpack.DefinePlugin({
      // http://stackoverflow.com/questions/30030031/passing-environment-dependent-variables-in-webpack
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.optimize.CommonsChunkPlugin('lib', 'js/lib.js')
  ]
};

// 使用缓存
var CACHE_PATH = ROOT_PATH + '/cache';

// loaders
config.module.loaders = [];
// 使用 babel 编译 jsx、es6
config.module.loaders.push({
  test: /\.js$/,
  exclude: /node_modules/,
  include: SRC_PATH,
  // 这里使用 loaders ，因为后面还需要添加 loader
  loaders: ['babel?cacheDirectory=' + CACHE_PATH]
});

// 编译 sass
config.module.loaders.push({
  test: /\.(scss|css)$/,
  loaders: ['style', 'css', 'sass','postcss']
});

// css autoprefix
var precss = require('precss');
var autoprefixer = require('autoprefixer');
config.postcss = function() {
  return [precss, autoprefixer];
}

// html 页面
var HtmlwebpackPlugin = require('html-webpack-plugin');
config.plugins.push(
  new HtmlwebpackPlugin({
    filename: 'index.html',
    chunks: ['app','lib'],
    template: SRC_PATH + '/pages/app.html',
    minify: {
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeComments: true
    }
  })
);

// 压缩 js、css
config.plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
);

// 图片路径处理，压缩
config.module.loaders.push({
  test: /\.(?:jpg|gif|png|svg)$/,
  loaders: [
    'url?limit=8000&name=img/[hash].[ext]',
    'image-webpack'
  ]
});

module.exports = config;