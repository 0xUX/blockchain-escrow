const path = require('path');
const webpack = require("webpack");
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            // you can specify a publicPath here
                            // by default it use publicPath in webpackOptions.output
                            // publicPath: '../'
                        }
                    },
                    "css-loader"
                ]
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, './dist'),
        hotOnly: true
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css"
        }),
        new webpack.HotModuleReplacementPlugin(),
        new WebpackBuildNotifierPlugin({
            title: "0xUX Webpack Build"
        })
    ]
});
