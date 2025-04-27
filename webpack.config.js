const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin"); // Import html-webpack-plugin

module.exports = {
    entry: "./src/index.js", // Specify your entry point
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'index.bundle.js',
    },
    devServer: {
        port: 3000,
        open: true,
        hot: true,
        static: path.resolve(__dirname, 'dist'), // Serve content from the 'dist' folder
    },
    module: {
        rules: [
            {
                test: /\.js(x?)$/, // Matches .js and .jsx files
                exclude: /node_modules/, // Exclude node_modules from processing
                use: {
                    loader: 'babel-loader', // Use babel-loader to transpile JavaScript and JSX
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'], // Process CSS files
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource', // Process image files as assets
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource', // Process font files as assets
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx"], // Automatically resolve certain extensions
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html", // Path to your template file
        }),
    ],
};
