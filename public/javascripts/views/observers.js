define([
  'jquery',
  'underscore',
  'backbone',
  'socketio',
  'views/observer-view',
  'collections/observers',
  ], function($, _, Backbone, Socket, ObserverView, ObserverCollection) {

  var Observers = Backbone.View.extend({
    el: "#observers",
    initialize: function(options) {
      this.io = new Socket();
      this.io.on('new user', _.bind(this.addObserver, this));
      this.io.on('user left', _.bind(this.removeObserver, this));
      this.collection = new ObserverCollection();
      this.initCollection(options['observers']);
      this.render();
    },
    render: function() {
      this.collection.each(this.renderAnotherObserver, this);
      return this;
    },
    renderAnotherObserver: function(observer){
      var observerView = new ObserverView({ model: observer, id: observer.get('username')});
      this.$el.append(observerView.render().el);
    },
    initCollection: function(observers) {
      _.each(observers, _.bind(function(observer) {
        this.collection.add(observer);
      }, this));
    },
    getObserver: function(username) {
      return _.first(this.collection.where({username: username}));
    },
    addObserver: function(observer) {
      this.collection.add(observer, { validate: true });
      if (this.getObserver(observer['username'])) {
        this.renderAnotherObserver(this.getObserver(observer['username']));
      }
    },
    removeObserver: function(observer) {
      this.collection.remove(this.getObserver(observer['username']));
    },
  });

  return Observers;
});