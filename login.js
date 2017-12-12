const login = require("facebook-chat-api");
var blessed = require('blessed');
var screen = require('./screen');
var main = require('./main');

var _login = {
  username: '',
  password: ''
};

var usernameLabel = blessed.text({
  parent: screen.layout,
  content: 'Enter email: ',
});

var usernamePrompt = blessed.textbox({
  parent: screen.layout,
  tags: true
});

var passwordLabel = blessed.text({
  parent: screen.layout,
  content: 'Enter password: ',
  hidden: true
});

var passwordPrompt = blessed.textbox({
  parent: screen.layout,
  tags: true,
  hidden: true
});

usernamePrompt.readInput(function() {});

usernamePrompt.on('submit', (value) => {
  _login.username = value;
  usernameLabel.hide();
  usernamePrompt.hide();
  passwordLabel.show();
  passwordPrompt.show();
  screen.screen.render();
  passwordPrompt.readInput(function() {});

});

passwordPrompt.on('submit', (value) => {
    //_login.password = value;

    passwordLabel.hide();
    passwordPrompt.hide();
    main.logger.show();
    main.text.show();
    screen.screen.render();

    main.logger.log('logging in...');

    login({email: _login.username, password: _login.password}, {logLevel: 'silent'}, (err, api) => {
    		    if(err) return main.logger.log('unable to login: ' + err.error);

            main.setApi(api);

            main.logger.log('successfully logged in!');

            //main._api = api;

            main.logger.show();
            main.text.show();
            screen.screen.render();
            main.text.readInput(function() {});
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
  screen.screen.render();
});

passwordPrompt.key('C-c', function() {
  process.exit(0);
});

module.exports.login = '';
