const path = require('path');
const webpack = require("webpack");
const merge = require('webpack-merge');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, './dist'),
        hotOnly: true,
        historyApiFallback: {
            disableDotRule: true
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new WebpackBuildNotifierPlugin({
            title: "0xUX Webpack Build"
        })
    ]
});
