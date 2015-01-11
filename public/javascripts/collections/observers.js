define(['backbone', 'models/observer'], function(Backbone, Observer) {

  var Obs = Backbone.Collection.extend({
    model: Observer
  });

  return Obs;
});