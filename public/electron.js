if (process.env.NODE_ENV === 'development') {
  require('ts-node').register({
    project: __dirname + '/../main/tsconfig.json',
  });
  require('../main/index').default();
} else {
  require('../main/dist/index').default();
}
