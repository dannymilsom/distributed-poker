define(['backbone', 'models/card'], function(Backbone, Card) {

  var Cards = Backbone.Collection.extend({
    model: Card
  });

  return Cards;

});