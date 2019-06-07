module.exports = {
  // Put your normal webpack config below here
  module: {
    rules: require('./rules'),
  },
  resolve: {
    extensions: require('./extensions'),
  },
};
