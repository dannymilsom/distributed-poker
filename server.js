// Module dependencies
var express = require('express'),
    app = express(),
    request = require('request'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    md5 = require('blueimp-md5').md5,
    _ = require('underscore');
    settings = require('./settings.js');

// Middleware
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');
// the view path already defaults to cwd + /views

// Routers
app.get('/', function (req, res) {
  res.render("index", { roles: settings.roles });
});

// Meta objects and util functions
var users = {},
    adminEmail = settings.adminEmail,
    validEmails = settings.validEmails;

function usedEmail(email) {
      var emails = [];
      for (var user in users) {
        emails.push(users[user]['email']);
      }
      if (_.contains(emails, email)) {
        return true;
      } else { return false; }
}

// SocketIO
io.on('connection', function(client){

  client.on('join', function(userDetails){
    var errorMsg,
        email = userDetails['email'],
        role = userDetails['role'],
        username = email.split("@")[0].replace(".", "");

    if (usedEmail(email)) {
      errorMsg = "A user has already entered the room with the address " + email;
    }
    else if (validEmails.length > 0 && _.contains(validEmails, email)) {
      errorMsg = email + " is not an approved email address";
    }

    if (errorMsg) {
      client.emit("invalid email", {message: errorMsg, adminEmail: adminEmail});
    } else {
      // add a md5 hash for gravatar img and username to userDetails mapping
      userDetails['hash'] = md5(email);
      userDetails['username'] = username;
      // add client to array of connected users
      users[client.id] = userDetails;
      // send response to new client only
      client.emit("enter room", {
        user: userDetails,
        users: _.filter(users, function(user){
          return user.role == 'player';
        }),
        observers: _.filter(users, function(user) {
          return user.role == 'observer';
        }),
        points: settings.points,
      });
      // emit events to all connected users
      io.emit("new user", userDetails);
    }
  });

  client.on('vote', function(voteDetails){
    io.emit('vote', voteDetails);
  });

  client.on('reveal', function() {
    io.emit('reveal');
  });

  client.on('clear', function() {
    io.emit('clear');
  });

  client.on('disconnect', function(){
    if (client.id in users){
     // var username = users[client.id]['username'];
      io.emit('user left', users[client.id]);
      delete users[client.id];
    }
  });
});

// Listen for requests
var server = http.listen(process.env.PORT || 3000, function () {});
