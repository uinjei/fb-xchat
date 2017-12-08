const login = require("facebook-chat-api");
var inquirer = require('inquirer');
var blessed = require('blessed');
var _ = require('underscore');

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

var usernameLabel = blessed.text({
  parent: layout,
  content: 'Enter email: ',
});

var usernamePrompt = blessed.textbox({
  parent: layout,
  tags: true
});

var passwordLabel = blessed.text({
  parent: layout,
  content: 'Enter password: ',
  hidden: true
});

var passwordPrompt = blessed.textbox({
  parent: layout,
  tags: true,
  hidden: true
});

var logger = blessed.log({
  parent: layout,
  border: 'line',
  width: '100%',
  height: '95%',
  hidden: 'true',
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

var active;

// var prompt = blessed.text({
//   parent: layout,
//   border: 'line',
//   width: true,
//   //height: '10%',
//   content: '',
//   //hidden: true
// });

var text = blessed.textbox({
  parent: layout,
  border: 'line',
  //top: 'bottom',
  width: '100%',
  hidden: 'true',
  tags: true,
});

var _login = {};

var _api;

usernamePrompt.readInput(function() {});

usernamePrompt.on('submit', (value) => {
  _login.username = value;
  usernameLabel.hide();
  usernamePrompt.hide();
  passwordLabel.show();
  //passwordPrompt.show();
  screen.render();
  passwordPrompt.readInput(function() {});

});

passwordPrompt.on('submit', (value) => {

    _login.password = value;

    passwordLabel.hide();
    //passwordPrompt.hide();
    logger.show();
    text.show();
    screen.render();

    logger.log('logging in...');

    login({email: _login.username, password: _login.password}, {logLevel: 'silent'}, (err, api) => {
    		    if(err) return console.error(err);
              logger.log('successfully logged in!');
      		    api.listen((err, message) => {
                  api.getUserInfo(message.senderID, (err, ret) => {
                      if(err) return logger.log(err);
                      logger.log(ret[message.senderID].firstName + ': '+ message.threadID +': ' + message.body);
                  });
      		    });

            _api = api;

            logger.show();
            text.show();
            screen.render();
            text.readInput(function() {});
    		});

});

text.on('submit', (value) => {
  var command = value.split(' ');
  text.clearValue();

  if (command[0]==='/l')
    _api.getFriendsList(function(err, arr) {
      _.pluck(arr, 'vanity').forEach(function(fullname) {
        logger.log(fullname);
      });
    });

  if (command[0].indexOf('/pm')>-1&&command[1]) {
    active = command[1];
    text.setValue('/pm ' +active+' ');
    logger.log(active);
    if (command.length==3) {
      _api.getUserID(active, function(err, obj) {
        if (obj.length==1) {
          screen.render();
          _api.sendMessage(command[2], obj[0].userID, function(err, messageInfo) {
            if (err) logger.log('your message to ' + messageInfo.threadID +' was not sent.');
          });
        }
      });
    }
    if (command.length==2) {
      text.setValue('/pm ' +active+' ');
      screen.render();
    }

  }

  text.readInput(function() {});
});

screen.key('escape', function() {
  screen.destroy();
});

screen.render();
