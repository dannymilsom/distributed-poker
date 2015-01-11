define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/observer.html'
  ], function($, _, Backbone, tmp) {

  var ObserverView = Backbone.View.extend({
    tagName: 'li',
    className: 'small-12 columns',
    template: _.template(tmp),
    initialize: function() {
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

  return ObserverView;
});