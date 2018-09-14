const path = require('path');
const externals = require('webpack-node-externals');

const basePlugins = [
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime'
];

const baseConfig = {
    entry: path.resolve(__dirname, 'src', 'index.js'),
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/env', {
                                targets: {
                                    browsers: [
                                        '>0.25%',
                                        'not dead'
                                    ]
                                }
                            }]
                        ],
                        plugins: basePlugins
                    }
                }
            }
        ]
    },
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'src')
        ],
    },
    devtool: 'source-map',
    mode: process.env.NODE_ENV
};

module.exports = [
    {
        ...baseConfig,
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'TronWeb.node.js',
            libraryTarget: 'commonjs2',
            libraryExport: 'default'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/env', {
                                    targets: {
                                        node: '8.11.4'
                                    }
                                }]
                            ],
                            plugins: [
                                ...basePlugins,
                                'source-map-support'
                            ]
                        }
                    }
                }
            ]
        },
        externals: [ externals() ],
        target: 'node'
    },
    {
        ...baseConfig,
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'TronWeb.js',
            library: 'TronWeb',
            libraryTarget: 'umd',
            libraryExport: 'default',
            umdNamedDefine: true
        },
    }
];