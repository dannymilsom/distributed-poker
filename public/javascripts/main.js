require(['/javascripts/config.js'], function() {
  require(['jquery',
          'underscore',
          'backbone',
          'socketio',
          'hotkeys',
          'views/welcome',
          ], function($, _, Backbone, Socket, Hotkeys, Welcome) {

    // render the welcome screen and login form
    var login = new Welcome();

    // keyboard shortcuts which also push events to the server
    var io = Socket();
    $(document).on('keyup', null, 'c', function(){
      io.emit('clear');
    });

    $(document).on('keyup', null, 'r', function(){
      io.emit('reveal');
    });

  });
});















