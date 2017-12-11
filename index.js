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

var _login = {
  username: '',
  password: ''
};

var _api;

var clearValue = function(cb) {
    cb(text.clearValue());
}

usernamePrompt.readInput(function() {});

usernamePrompt.on('submit', (value) => {
  _login.username = value;
  usernameLabel.hide();
  usernamePrompt.hide();
  passwordLabel.show();
  passwordPrompt.show();
  screen.render();
  passwordPrompt.readInput(function() {});

});

passwordPrompt.on('submit', (value) => {
    //_login.password = value;

    passwordLabel.hide();
    passwordPrompt.hide();
    logger.show();
    text.show();
    screen.render();

    logger.log('logging in...');

    login({email: _login.username, password: _login.password}, {logLevel: 'silent'}, (err, api) => {
    		    if(err) return logger.log('unable to login: ' + err.error);
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

  clearValue(function(value) {
    if (command[0]==='/list') {
      logger.log('retrieving friend list...');
      _api.getFriendsList(function(err, arr) {
        _.pluck(arr, 'vanity').forEach(function(vanity) {
          logger.log(vanity);
        });
      });
    }

    if (command[0].indexOf('/find')>-1&&command[1]) {
      logger.log('searching for users...');
      _api.getUserID(command[1], (err, data) => {
        if(err) return logger.log(err);
        //logger.log(JSON.stringify(data));

        var userIDs = _.pluck(data, 'userID');

        _api.getUserInfo(userIDs, (err, ret) => {
          if(err) return logger.log(err);

          _.pluck(ret, 'vanity').forEach(function(vanity) {
            logger.log(vanity);
          });
        });

      });
    }

    if (command[0].indexOf('/pm')>-1&&command[1]) {

      //logger.log(active);
      if (command.length>2 && command[2]!=='') {
        var _msg = command.slice();
        _msg.splice(0, 2);
        var msg = _msg.toString().replace(new RegExp(',', 'g'), ' ');

        logger.log('you: ' + msg);
        active = command[1];
        text.setValue('/pm ' + active +' ');

        _api.getUserID(active, function(err, obj) {
          if (obj.length==1) {
            screen.render();
            _api.sendMessage(msg, obj[0].userID, function(err, messageInfo) {
              if (err) logger.log('your message to ' + messageInfo.threadID + ' was not sent.');
            });
          }
        });
      } else if (active) {
        text.setValue('/pm ' +active+' ');
        screen.render();
      }

    }

    if (command[0]==='/quit') {
      process.exit(0);
    }

    text.readInput(function() {});
  });


});

passwordPrompt.key([
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
  'S-a','S-b','S-c','S-d','S-e','S-f','S-g','S-h','S-i','S-j','S-k','S-l','S-m','S-n','S-o','S-p','S-q','S-r','S-s','S-t','S-u','S-v','S-w','S-x','S-y','S-z',
  '1','2','3','4','5','6','7','8','9','0',
  '!','@','#','$','%','^','&','*','(',')'], function(key) {
  var _mask = passwordPrompt.getValue().split('');
  var mask = '';

  _mask.forEach(function(char) {
    mask = mask+'*';
  });

  passwordPrompt.setValue(mask);
  _login.password = _login.password+key;
  screen.render();
});

screen.key('enter', function() {
  text.readInput(function() {});
});

screen.render();
