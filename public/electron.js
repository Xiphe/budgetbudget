if (process.env.NODE_ENV === 'development') {
  require('ts-node').register({
    project: __dirname + '/../main/tsconfig.json',
    compilerOptions: {
      module: 'CommonJS',
    },
  });
  require('../main/index').default();
} else {
  require('../main/dist.js').default();
}