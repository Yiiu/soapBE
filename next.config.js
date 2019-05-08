require('dotenv').config()

const withTypescript = require('@zeit/next-typescript');
const webpack = require('webpack');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const Dotenv = require('dotenv-webpack')

module.exports = withTypescript({
  useFileSystemPublicRoutes: false,
  webpack(config, options) {
    if (options.isServer) config.plugins.push(new ForkTsCheckerWebpackPlugin())
    config.plugins.push(
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /(en)/)
    )

    config.plugins.push(
      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true
      })
    )
  
    config.resolve = {
      ...config.resolve,
      ...{
        alias: {
          ...config.resolve.alias,
          '@pages': path.resolve(__dirname, 'pages'),
        }
      },
    };

    return config
  }
});
