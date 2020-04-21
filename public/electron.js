const { app } = require('electron');

let main;
if (process.env.NODE_ENV === 'development') {
  require('ts-node').register({
    project: __dirname + '/../main/tsconfig.json',
    compilerOptions: {
      module: 'CommonJS',
    },
  });
  main = require('../main/index').default;
} else {
  main = require('../main/dist.js').default;
}

app.on('ready', main);
