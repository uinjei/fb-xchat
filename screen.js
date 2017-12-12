var blessed = require('blessed');

var screen = blessed.screen({
  tput: true,
  smartCSR: true,
  autoPadding: true,
  warnings: true,
  title: 'fb xchat'
});

var layout = blessed.layout({
  parent: screen,
  top: 'center',
  left: 'center',
  width: '100%',
  height: '100%',
  layout: process.argv[2] === 'grid' ? 'grid' : 'inline',
});

module.exports.screen = screen;
module.exports.layout = layout;
