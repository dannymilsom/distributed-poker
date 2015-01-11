define(['backbone', 'models/user'], function(Backbone, User) {

  var Players = Backbone.Collection.extend({
    model: User,
    sort_key: 'vote',
    comparator: function(model) {
      return model.get(this.sort_key);
    }
  });

  return Players;

});