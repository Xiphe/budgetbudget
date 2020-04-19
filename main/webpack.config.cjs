module.exports = {
  mode: 'production',
  entry: './main/index.ts',
  target: 'node',
  externals: {
    electron: 'electron',
  },
  node: {
    __dirname: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'dist.js',
    libraryTarget: 'commonjs2',
    path: __dirname,
  },
};
