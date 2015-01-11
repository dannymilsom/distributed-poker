define([
  'jquery',
  'underscore',
  'backbone',
  'socketio',
  'text!templates/feed.html'
  ], function($, _, Backbone, Socket, tmp) {

  var Feed = Backbone.View.extend({
    el: "#feed",
    template: _.template(tmp),
    initialize: function(options) {
      this.io = Socket();
      this.render('joined', options['user']);
      this.io.on('new user', _.bind(this.render, this, 'joined'));
      this.io.on('user left', _.bind(this.render, this, 'left'));
    },
    render: function(action, user) {
      this.$el.append(this.template({
        time: this.getTime(),
        username: user['username'],
        message: action
      }));
    },
    getTime: function() {
      var d = new Date();
      var hours = ('0' + d.getHours()).slice(-2);
      var minutes = ('0' + d.getMinutes()).slice(-2);
      return hours + ":" + minutes;
    }
  });

  return Feed;
});