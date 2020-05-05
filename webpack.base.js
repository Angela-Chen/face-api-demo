const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  plugins: [
    // 每次构建前清理 /dist 文件夹
    new CleanWebpackPlugin(),
    // 默认生成它自己的 index.html 文件
    new HtmlWebpackPlugin({
      title: '管理输出',
      template: './index.html'
    }),
    new webpack.HotModuleReplacementPlugin()
  ],

  // 可以将编译后的代码映射回原始源代码。如果一个错误来自于哪一个js，source map 就会明确的告诉你
  // devtool: 'inline-source-map',

  // webpack-dev-server 为你提供了一个简单的 web server，并且具有 live reloading(实时重新加载) 功能
  // devServer: {
  //   contentBase: './dist',
  //   hot: true
  // },

  module: {
    rules: [
      // 加载 CSS
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
      // 加载 images 图像
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      // 加载 fonts 字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  node: {
    fs: "empty"
  }
};