define([
  'jquery',
  'underscore',
  'backbone',
  'socketio',
  'text!templates/card.html'
  ], function($, _, Backbone, Socket, tmp) {

  var CardView = Backbone.View.extend({
    tagName: 'div',
    className: 'small-2 medium-1 columns inner-padding',
    template: _.template(tmp),
    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    },
  });

  return CardView;

});