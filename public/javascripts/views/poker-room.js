define([
  'jquery',
  'underscore',
  'backbone',
  'views/cards',
  'views/action-options',
  'views/players',
  'views/feed',
  'views/observers',
  'text!templates/poker-room.html'
  ], function($, _, Backbone, Cards, ActionOptions, Players, Feed, Observers, tmp) {

  var PokerRoom = Backbone.View.extend({
    el: "#poker-room",
    template: _.template(tmp),
    initialize: function(options) {
      this.render();
      this.feed = new Feed(options);
      this.players = new Players(options);
      this.observers = new Observers(options);
      this.optionsView = new ActionOptions();
      this.cards = new Cards(options);
    },
    render: function() {
      this.$el.html(this.template());
    },
  });

  return PokerRoom;
});