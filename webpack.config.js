const process = require('process');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const moduleDir = process.env.PWD || __dirname;
const nodeModulesDir = path.join(moduleDir, 'node_modules');

const add_entry = (entry) => ['@babel/polyfill', entry];
const node_shims = path.join(moduleDir, 'src', 'shims', 'node');
const web_shims = path.join(moduleDir, 'src', 'shims', 'web');

const REACT_CONFIG = {
  target: 'node-webkit',
  mode: 'development',
  entry: {
    'llvm-coverage-viewer.js': add_entry('./src/app/llvm-coverage-viewer.jsx'),
    'llvm-coverage-viewer-html.js': add_entry('./src/app/index.html'),
  },
  output: {
    path: path.join(moduleDir, "/dist"),
    filename: "[name]"
  },
  node: {
    fs: 'empty',
    __filename: true,
    __dirname: true,
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          plugins: [
            '@babel/plugin-proposal-export-default-from',
          ],
          presets: ['@babel/preset-env', '@babel/preset-react'],
        },
      },
      {
        test: /\.(scss|css)$/,
        rules: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              import: true,
              modules: true,
              sourceMap: true,
              localIdentName: '[name]_[local]__[hash:base64:5]',
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              includePaths: [
                nodeModulesDir,
                path.join(nodeModulesDir, 'typeface-roboto', 'files'),
                path.join(nodeModulesDir, 'hack-font', 'build', 'web'),
              ],
            },
          },
        ],
      },
      {
        test: /\.(svg|png|jpg|gif)(\?.*)?/,
        loader: 'url-loader',
        options: {limit: 100000},
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        loader: 'file-loader',
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          },
          {
            loader: 'extract-loader'
          },
          {
            loader: 'html-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    modules: [
      nodeModulesDir,
      path.join(nodeModulesDir, 'hack-font', 'build', 'web'),
    ],
    extensions: ['.js', '.jsx'],
    alias: {
      'llvm-coverage-viewer-webworker': path.join(web_shims, 'llvm-coverage-viewer-webworker.js'),
      'llvm-coverage-viewer-dom': path.join(web_shims, 'llvm-coverage-viewer-dom.js'),
    }
  },
}

const BROWSER_REACT_CONFIG = {
  ...REACT_CONFIG,
  target: 'web',
  entry: {
    'llvm-coverage-viewer-browser.js': add_entry('./src/app/llvm-coverage-viewer.jsx'),
  },
  node: {
    fs: 'empty',
    __filename: true,
    __dirname: true,
  },
  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },
}

const CLI_CONFIG = {
  mode: 'development',
  entry: {
    'dev-server.js': add_entry('./src/server/dev-server.js'),
    'server.js': add_entry('./src/server/server.js'),
  },

  context: process.cwd(),

  output: {
    path: path.join(moduleDir, "/dist"),
    filename: "[name]"
  },

  target: 'node',

  node: false,

  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      test: 'llvm-coverage-viewer-cli.js',
      raw: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: [
            '@babel/preset-env',
          ],
        }
      },
    ]
  },
  externals: [nodeExternals()],
  resolveLoader: {
    modules: [nodeModulesDir],
  },
  resolve: {
    modules: [nodeModulesDir],
    alias: {
      'llvm-coverage-viewer-webworker': path.join(node_shims, 'llvm-coverage-viewer-webworker.js'),
      'llvm-coverage-viewer-dom': path.join(node_shims, 'llvm-coverage-viewer-dom.js'),
    },
  },
};

const CLI_BIN_CONFIG = {
  ...CLI_CONFIG,
  node: false,
  entry: {
    'llvm-coverage-viewer-cli.js': add_entry('./src/server/llvm-coverage-viewer-cli.js'),
  },
}

const WEBWORKER_CONFIG = {
  ...REACT_CONFIG,
  target: 'webworker',
  entry: {
    'llvm-coverage-viewer-highlight-worker.js': add_entry('./src/app/llvm-coverage-viewer-highlight-worker.js'),
  },
  node: {
    fs: 'empty',
    __filename: true,
    __dirname: true,
  },
  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },
}

const WEBWORKER_NODE_CONFIG = {
  ...CLI_CONFIG,
  entry: {
    'llvm-coverage-viewer-highlight-worker-test.js': add_entry('./src/app/llvm-coverage-viewer-highlight-worker.js'),
  },
}

module.exports = [
  REACT_CONFIG,
  CLI_CONFIG,
  BROWSER_REACT_CONFIG,
  WEBWORKER_CONFIG,
  WEBWORKER_NODE_CONFIG,
  CLI_BIN_CONFIG,
];

module.exports.REACT_CONFIG = REACT_CONFIG;
module.exports.CLI_CONFIG = CLI_CONFIG;
module.exports.BROWSER_REACT_CONFIG = BROWSER_REACT_CONFIG;
module.exports.WEBWORKER_CONFIG = WEBWORKER_CONFIG;
module.exports.WEBWORKER_NODE_CONFIG = WEBWORKER_NODE_CONFIG;
module.exports.CLI_BIN_CONFIG = CLI_BIN_CONFIG;
