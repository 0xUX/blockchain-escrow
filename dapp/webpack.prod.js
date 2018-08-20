const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurifyCssPlugin = require('purifycss-webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
//const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = merge(common, {
    mode: 'production',
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
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css"
        }),
        new PurifyCssPlugin({
            purifyOptions: { minify: true },
            // Give paths to parse for rules. These should be absolute!
            paths: glob.sync(path.join(__dirname, 'src/**/*.js')),
        }),
        //new BundleAnalyzerPlugin()
    ]
});
