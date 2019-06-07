module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './main/bootstrap.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./rules'),
  },
  resolve: {
    extensions: require('./extensions'),
  },
};
