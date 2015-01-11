define(['backbone'], function(Backbone) {
  var Observer = Backbone.Model.extend({
    defaults: {
      username: '',
      email: '',
      hash: '',
      vote: '?',
      role: 'observer'
    },
    validate: function(attrs, options) {
      if (attrs.role != 'observer') {
        return "Must select a observer role.";
      }
    }
  });
  return Observer;
});