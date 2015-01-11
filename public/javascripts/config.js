require.config({
  baseUrl: '/javascripts',
  paths: {
    templates: '../templates',
    text: 'libs/text',
    jquery: 'libs/jquery',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    socketio: 'libs/socket.io',
    hotkeys: 'libs/jquery.hotkeys'
  },
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: "Backbone"
    }
  }
});