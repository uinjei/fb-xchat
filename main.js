const login = require("facebook-chat-api");
var blessed = require('blessed');
var screen = require('./screen');
var _ = require('underscore');

var _api;

var logger = blessed.log({
  parent: screen.layout,
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

var text = blessed.textbox({
  parent: screen.layout,
  border: 'line',
  //top: 'bottom',
  width: '100%',
  hidden: 'true',
  tags: true,
});

var clearValue = function(cb) {
    cb(text.clearValue());
}

var setApi = function(api) {
  _api = api;
  _api.setOptions({listenEvents: true, selfListen: true});
  _api.listen((err, event) => {
    //logger.log('ret: '+JSON.stringify(event));
      if (event.type==='message') {
        api.getUserInfo(event.senderID, (err, ret) => {
            if(err) return logger.log(err);
            logger.log(ret[event.senderID].vanity + ': {white-fg}' + event.body+'{/}');
        });
      } else if (event.type==='typ') {
        api.getUserInfo(event.userID, (err, ret) => {
            if(err) return logger.log(err);
            logger.log('{white-fg}'+ret[event.userID].vanity + ' is typing...{/}');
        });
      }
  });
};

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

        active = command[1];
        //logger.log('you to '+active+': ' + '{blue-fg}'+msg+'{/}');
        text.setValue('/pm ' + active +' ');

        _api.getUserID(active, function(err, obj) {
          if (err) return logger.log(err);
          if (obj.length==1) {
            screen.screen.render();
            _api.sendMessage(msg, obj[0].userID, function(err, messageInfo) {
              if (err) logger.log('your message to ' + messageInfo.threadID + ' was not sent.');
            });
          } else {
            logger.log('{red-fg}your message to '+active+' was not sent.{/}');
          }
        });
      } else if (active) {
        text.setValue('/pm ' +active+' ');
        screen.screen.render();
      }

    }

    if (command[0]==='/quit') {
      process.exit(0);
    }

    text.readInput(function() {});
  });


});


module.exports.logger = logger;
module.exports.text = text;
module.exports.setApi = setApi;
