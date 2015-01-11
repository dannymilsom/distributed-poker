define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/player.html'
  ], function($, _, Backbone, tmp) {

  var PlayerView = Backbone.View.extend({
    tagName: 'li',
    className: 'small-12 columns',
    template: _.template(tmp),
    initialize: function() {
      this.model.on('change', _.bind(this.render, this));
      this.model.on('remove', _.bind(this.remove, this));
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    },
    remove: function() {
      this.$el.remove();
    }
  });

  return PlayerView;
});