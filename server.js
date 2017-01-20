const main = require('./lib/index').default;
const express = require('express');
const app = express();

app.listen(3006, () => {
  console.log('Logger service listening on port 3006!');
  main();
})