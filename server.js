// Module dependencies
var express = require('express'),
    app = express(),
    request = require('request'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    md5 = require('blueimp-md5').md5,
    settings = require('./settings.js');

// Middleware
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');
// the view path already defaults to cwd + /views

// Routers
app.get('/', function (req, res) {
  res.render("index", {roles: settings.roles});
});

// Meta objects and util functions
var users = {};

var checkIfEmailAlreadyUsed = function(email) {
  var usedEmails = [];
  for (var user in users) {
    usedEmails.push(users[user]['email']);
  }
  if (usedEmails.indexOf(email) >= 0) {
    return true;
  } else { return false; }
};

// SocketIO
io.on('connection', function(client){

  // client joins
  client.on('join', function(userDetails){

    var errorMsg;
    if (checkIfEmailAlreadyUsed(userDetails['email'])) {
      errorMsg = "A user has already entered the room with the email address " +
                 userDetails['email'];
    }
    else if (settings.validEmails.length > 0 &&
             settings.validEmails.indexOf(userDetails['email']) === -1) {
      errorMsg = userDetails['email'] + " is not an approved email address";
    }

    if (typeof errorMsg == 'undefined') {
      // add a md5 hash for gravatar img
      userDetails['hash'] = md5(userDetails['email']);

      // add client to array of connected users
      users[client.id] = userDetails;

      // send response to new client only
      client.emit('render options', settings.points);
      client.emit("valid email", true);

      // emit events to all connected users
      io.emit("feed", userDetails['username'] + " joined.");
      io.emit("update users", users);
    }
    else {
      client.emit("invalid email", errorMsg, settings.adminEmail);
    }
  });

  client.on('vote', function(voteDetails){
    io.emit('vote', voteDetails);
  });

  client.on('reveal', function(){
    io.emit('reveal');
  });

  client.on('clear', function(){
    io.emit('clear');
  });

  client.on('disconnect', function(){
    if (client.id in users){
      var username = users[client.id]['username'];
      io.emit('feed', username + " left.");
      io.emit('user left', username);
      delete users[client.id];
    }
  });
});

// Listen for requests
var server = http.listen(process.env.PORT || 3000, function () {});
