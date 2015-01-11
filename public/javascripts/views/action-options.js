define([
  'jquery',
  'underscore',
  'backbone',
  'socketio',
  'text!templates/action-options.html'
  ], function($, _, Backbone, Socket, tmp) {

  var ActionOptions = Backbone.View.extend({
    el: "#action-options",
    template: _.template(tmp),
    events: {
      "click #clear-points": "clearPoints",
      "click #reveal-points": "revealPoints"
    },
    initialize: function(options) {
      this.io = Socket();
      this.render();
    },
    render: function() {
      this.$el.html(this.template());
    },
    clearPoints: function() {
      this.io.emit("clear");
    },
    revealPoints: function() {
      this.io.emit("reveal");
    }
  });

  return ActionOptions;
});