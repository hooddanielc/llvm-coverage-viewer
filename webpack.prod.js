const cfg = require('./webpack.config.js');

Object.keys(cfg).forEach((key) => {
  cfg[key].mode = 'production';
  if (cfg.devtool) {
    delete cfg.devtool;
  }
});

module.exports = cfg;
