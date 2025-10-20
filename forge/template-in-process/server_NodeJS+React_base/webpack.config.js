import path from "path";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { fileURLToPath } from "url";
import dotenv from 'dotenv';

//import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __PORT = process.env.PORT || 12345;
const __isDevelopment = process.env.NODE_ENV === 'development';

const devView = "/erste.html";

const entries = {
    erste: "./src/app/erste/erste.jsx"
};
const plugins = [
    new HtmlWebpackPlugin({
        template: './src/erste/erste_template.html', // template HTML-file
        filename: 'erste.html',       // result file name
        inject: 'body',                // Scripts will be included before </body> tag
        chunks: ['modules', 'main', 'erste']
    }),
    new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css' 
    }),
    //new BundleAnalyzerPlugin()
].filter(Boolean);


////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
export default {
    mode: __isDevelopment ? "development" : "production",
    devtool: __isDevelopment ? "source-map" : false,

    entry: entries,
    output:{
        path: path.resolve(__dirname, "./public"),     // output path dir - public
        publicPath: "/",
        filename: "[name].[contenthash].js",       // name of created file
        clean: true
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            '@src': path.resolve(__dirname, 'src/'),
            '@styles': path.resolve(__dirname, 'src/styles/'),
            '@app': path.resolve(__dirname, 'src/app/')
          }
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'), // active entry dir
            publicPath: "/",

        },
        historyApiFallback: {
            index: devView //view file for development mode
        },  
        hot: true, 
        open: true, 
        compress: true, 
        port: __PORT, 
        devMiddleware: {
            publicPath: '/',
        },
        watchFiles: ["src/**/*"],
    },
    optimization: {
        usedExports: true,
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                modules: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "modules",
                    chunks: "all"
                },
                main: {
                    test: /[\\/]src[\\/]common[\\/]/,
                    name: "main",
                    chunks: "all"
                },
            }
        },
        minimize: process.env.NODE_ENV === 'production',
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                  compress: {
                    drop_console: true, // remove console.log
                    drop_debugger: true, // remove debugger
                  },
                  output: {
                    comments: false, // remove comments
                  },
                },
                extractComments: false, // Do not create comments file
            }),
            new CssMinimizerPlugin()
        ]
    },
    module:{
        rules:[   //загрузчик для jsx
            {
                test: /\.jsx?$/, 
                exclude: /(node_modules)/, 
                loader: "babel-loader",   
                options:{
                    presets:[ "@babel/preset-react"] 
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader, 
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
                parser: {
                    dataUrlCondition: {
                        maxSize: 8192, // Files less than 8 KB - built-in
                    },
                },
                generator: {
                    filename: 'assets/images/[name].[hash][ext]',
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i, 
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name].[hash][ext]',
                },
            }
        ]
    },
    plugins: plugins
}
