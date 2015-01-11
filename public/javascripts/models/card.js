define(['backbone'], function(Backbone) {
  var Card = Backbone.Model.extend({
    defaults: {
      disabled: ''
    }
  });
  return Card;
});