'use strict';
const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const YFilesOptimizerPlugin = require('@yworks/optimizer/webpack-plugin');
const { apiServer } = require("./api");
const notFoundHandler = require("./api/404.js");
const config = {
  devServer: {
    historyApiFallback: false,
    writeToDisk: true,
    port:3000,
    before: devServer => {
      devServer.use(apiServer);
    },
    after: devServer => {
      devServer.use(notFoundHandler);
    },
  },

  entry: {
    app: ['@babel/polyfill', path.resolve('app/scripts/app.ts')]
  },

  output: {
    path: path.resolve(__dirname, 'app/dist/'),
    publicPath: 'dist',
    filename: '[name].js'
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"]
  },

  module: {
    rules: [
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        exclude: /(node_modules|lib[/\\]yfiles)/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-typescript'],
          plugins: [
            "@babel/plugin-proposal-class-properties"
          ]
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        lib: {
          test: /([\\/]lib)|([\\/]node_modules[\\/])/,
          name: 'lib',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ]
};

module.exports = config;