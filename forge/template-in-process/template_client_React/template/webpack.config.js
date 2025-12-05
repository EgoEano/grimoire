// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const dotenv = require('dotenv');
//const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

dotenv.config();

const clientDevView = "index";
const clientEntries = { index: "./index.web.ts" };
const __DEV_PORT = process.env.DEV_PORT || 12345;
const __isDevelopment = process.env.NODE_ENV === 'development';

const clientPlugins = [
  !__isDevelopment && new WebpackObfuscator({
    rotateStringArray: true,
    stringArray: true,
    stringArrayThreshold: 0.75
  }, ['**/modules.*.js']),
  new MiniCssExtractPlugin({
    filename: __isDevelopment
      ? "[name]/[name].css"
      : ({ chunk }) => chunk.name === "main" ? "[name].[contenthash].css" : "[name]/[name].[contenthash].css"
  }),
  //new BundleAnalyzerPlugin()
].filter(Boolean);

Object.keys(clientEntries).forEach(k => {
  clientPlugins.push(new HtmlWebpackPlugin({
    template: './client/core/ui/assets/template.html',
    favicon: './client/core/ui/assets/images/favicon.png',
    filename: `${k}/${k}.html`,
    inject: 'body',
    chunks: ['modules', 'services', 'components', 'theme', 'styles', 'locales', k],
    minify: !__isDevelopment && {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    }
  }));
});

module.exports = {
  name: "client",
  mode: __isDevelopment ? "development" : "production",
  devtool: __isDevelopment ? "source-map" : false,
  entry: clientEntries,
  output: {
    path: path.resolve(__dirname, "./public"),
    publicPath: "/",
    filename: __isDevelopment
      ? "[name]/[name].js"
      : ({ chunk }) => chunk.name === "modules" ? "[name].[contenthash].js" : "[name]/[name].[contenthash].js",
    clean: true
  },
  resolve: {
    extensions: [".web.js", ".web.ts", ".web.tsx", ".ts", ".tsx", ".js"],
    alias: {
      '@root': path.resolve(__dirname),
      '@client': path.resolve(__dirname, 'client/'),
      '@styles': path.resolve(__dirname, 'client/core/ui/styles/'),
      '@ui': path.resolve(__dirname, 'client/core/ui/'),
      '@app': path.resolve(__dirname, 'client/modules/'),
      'react-native/Libraries/Renderer/shims/ReactNative': 'react-native-web/dist/cjs/exports/ReactNative',
      'react-native$': 'react-native-web',
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: "/",
      watch: true
    },
    historyApiFallback: { index: `${clientDevView}/${clientDevView}.html` },
    hot: false,
    liveReload: true,
    open: true,
    compress: true,
    port: __DEV_PORT,
    devMiddleware: { publicPath: '/' },
    watchFiles: ["client/**/*"]
  },
  optimization: {
    usedExports: true,
    splitChunks: __isDevelopment ? false : {
      chunks: 'all',
      cacheGroups: {
        modules: { test: /[\\/]node_modules[\\/]/, name: "modules", chunks: "all" },
        services: { test: /[\\/]client[\\/]core[\\/]services[\\/]/, name: "services", chunks: "all" },
        components: { test: /[\\/]client[\\/]core[\\/]ui[\\/]components[\\/]/, name: "components", chunks: "all" },
        theme: { test: /[\\/]client[\\/]core[\\/]ui[\\/]theme[\\/]/, name: "theme", chunks: "all" },
        styles: { test: /[\\/]client[\\/]core[\\/]ui[\\/]styles[\\/]/, name: "styles", chunks: "all" },
        locales: { test: /[\\/]client[\\/]core[\\/]ui[\\/]locales[\\/]/, name: "locales", chunks: "all" }
      }
    },
    runtimeChunk: 'single',
    minimize: !__isDevelopment,
    minimizer: [
      new TerserPlugin({
        terserOptions: { compress: { drop_console: true, drop_debugger: true, pure_funcs: ['console.log', 'console.warn'] }, output: { comments: false } },
        extractComments: false
      }),
      new CssMinimizerPlugin()
    ]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!react-native|react-navigation|@react-native|react-native-)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
              "@react-native/babel-preset"
            ],
            plugins: [["@babel/plugin-transform-react-jsx", { runtime: "automatic" }]]
          }
        }
      },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        parser: { dataUrlCondition: { maxSize: 8192 } },
        generator: { filename: 'assets/images/' + (__isDevelopment ? '[name].[ext]' : '[name].[hash][ext]') }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: { filename: 'assets/fonts/' + (__isDevelopment ? '[name].[ext]' : '[name].[hash][ext]') }
      }
    ]
  },
  plugins: clientPlugins
};
