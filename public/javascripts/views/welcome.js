define([
  'jquery',
  'underscore',
  'backbone',
  'socketio',
  'views/poker-room',
  'text!templates/welcome.html',
  'text!templates/error-message.html'
  ], function($, _, Backbone, Socket, PokerRoom, tmp, errorTmp) {

  var Welcome = Backbone.View.extend({
    el: "#welcome",
    template: _.template(tmp),
    errorTemplate: _.template(errorTmp),
    events: {
      "submit": "submitForm",
    },
    initialize: function(options) {
      this.io = Socket();
      this.io.on('enter room', _.bind(this.hide, this));
      this.io.on('invalid email', _.bind(this.invalidEmail, this));
      this.render();
    },
    render: function() {
      this.$el.html(this.template());
    },
    hide: function(options) {
      this.options = options;
      this.$el.fadeOut(_.bind(function(){
        var parent = new PokerRoom(this.options);
      }, this));
    },
    submitForm: function(event) {
      event.preventDefault();
      $(".warning").remove();
      this.io.emit("join", {
        email: this.$("input[name=email]").val(),
        role: this.$("select[name=role]").find(":selected").val()
      });
    },
    invalidEmail: function(message) {
      this.$("#login").append(this.errorTemplate(message));
    }
  });

  return Welcome;
});