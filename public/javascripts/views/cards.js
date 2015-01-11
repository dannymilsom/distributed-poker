define([
  'jquery',
  'underscore',
  'backbone',
  'socketio',
  'collections/cards',
  'views/card-view',
  ], function($, _, Backbone, Socket, CardCollection, Card) {

  var CardView = Backbone.View.extend({
    el: "#vote-options",
    events: {
      "click .points": "vote"
    },
    initialize: function(options) {
      this.currentUser = options.user;
      this.cardValues = options.points;
      this.disable = (this.currentUser.role == 'player') ? '' : 'disabled';
      this.collection = new CardCollection();
      this.initCollection();
      this.render();
    },
    render: function() {
      this.collection.each(this.renderAnotherCard, this);
      return this;
    },
    renderAnotherCard: function(card) {
      var cardView = new Card({ model: card});
      this.$el.append(cardView.render().el);
    },
    initCollection: function() {
      _.each(this.cardValues, _.bind(function(value){
        this.collection.add({value: value, disabled: this.disable});
      }, this));
    },
    vote: function(event) {
      if ($(event.currentTarget).not('disabled')){
        Socket().emit('vote', {
          email: this.currentUser['email'],
          username: this.currentUser['username'],
          points: event.currentTarget.innerText.trim()
        });
      }
    }
  });

  return CardView;
});