//const login = require("facebook-chat-api");
var blessed = require('blessed');

var screen = require('./screen');
var login = require('./login');
var main = require('./main');

screen.screen.key('enter', function() {
  main.text.readInput(function() {});
});

screen.screen.render();
