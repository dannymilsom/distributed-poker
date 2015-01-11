define(['backbone'], function(Backbone) {
  var User = Backbone.Model.extend({
    defaults: {
      username: '',
      email: '',
      hash: '',
      vote: '?',
      role: 'player'
    },
    validate: function(attrs, options) {
      if (attrs.role != 'player') {
        return "Must select a player role.";
      }
    }
  });
  return User;
});