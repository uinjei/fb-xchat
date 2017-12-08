var blessed = require('blessed');

var screen = blessed.screen({
  tput: true,
  smartCSR: true,
  autoPadding: true,
  warnings: true
});

var layout = blessed.layout({
  parent: screen,
  top: 'center',
  left: 'center',
  width: '100%',
  height: '100%',
  layout: process.argv[2] === 'grid' ? 'grid' : 'inline',
});

var logger = blessed.log({
  parent: layout,
  width: '100%',
  height: '90%',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  scrollback: 100,
  scrollbar: {
    ch: ' ',
    track: {
      bg: 'yellow'
    },
    style: {
      inverse: true
    }
  }
});

var text = blessed.textbox({
  parent: layout,
  // Possibly support:
  // align: 'center',
  top: 'bottom',
  width: '100%',
  height: '10%',
  tags: true
});

text.on('submit', (value) => {
  if (value!=='') {
    logger.log(value);
    text.clearValue();
  }
  text.readInput(function() {});
});

screen.key('escape', function() {
  screen.destroy();
});

screen.render();
text.readInput(function() {});
