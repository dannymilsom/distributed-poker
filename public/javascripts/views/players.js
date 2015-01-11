define([
  'jquery',
  'underscore',
  'backbone',
  'socketio',
  'views/player-view',
  'collections/players',
  'text!templates/consensus.html',
  'text!templates/no-consensus.html'
  ], function($, _, Backbone, Socket, PlayerView, PlayerCollection,
              ConsensusTmp, NoConsensusTmp) {

  var Players = Backbone.View.extend({
    el: "#players",
    consencousTemplate: _.template(ConsensusTmp),
    noConsensusTemplate: _.template(NoConsensusTmp),
    initialize: function(options) {
      this.io = new Socket();
      this.io.on('vote', _.bind(this.updateVote, this));
      this.io.on('reveal', _.bind(this.reveal, this));
      this.io.on('clear', _.bind(this.clear, this));
      this.io.on('new user', _.bind(this.addUser, this));
      this.io.on('user left', _.bind(this.removeUser, this));
      this.collection = new PlayerCollection();
      this.initCollection(options['users']);
      this.render();
    },
    render: function() {
      this.collection.each(this.renderAnotherPlayer, this);
      return this;
    },
    renderAnotherPlayer: function(player){
      var playerView = new PlayerView({ model: player, id: player.get('username')});
      this.$el.append(playerView.render().el);
    },
    initCollection: function(users) {
      _.each(users, _.bind(function(user) {
        this.collection.add(user);
      }, this));
    },
    updateVote: function(details) {
      var user = _.first(this.collection.where({username: details['username']}));
      user.set("vote", details['points']);
      this.$("#" + user.get('username') + " .card").addClass("blurry-text");
    },
    clear: function() {
      this.$el.fadeOut(_.bind(function(){
        this.collection.each(function(model){
          model.set('vote', '?');
        });
        this.$('.card').removeClass("blurry-text");
        this.$('.agreement, .disagreement').remove();
        this.$el.fadeIn();
      }, this));
    },
    reveal: function() {
      this.$el.fadeOut(_.bind(function(){
        this.collection.sort();
        this.$el.empty();
        this.showResult();
        this.render();
        this.$el.fadeIn();
      }, this));
    },
    getUser: function(username) {
      return _.first(this.collection.where({username: username}));
    },
    addUser: function(user) {
      this.collection.add(user, { validate: true });
      if (this.getUser(user['username'])) {
        this.renderAnotherPlayer(this.getUser(user['username']));
      }
    },
    removeUser: function(user) {
      this.collection.remove(this.getUser(user['username']));
    },
    showResult: function() {
      var votes = [];
      this.collection.each(function(user){
        votes.push(user.get('vote'));
      });

      if (_.every(votes, function(i){ return i == votes[0]; })) {
        this.$el.append(this.consencousTemplate());
      }
      else {
        var counter = 0,
            validVotes = this.collection.length;

        _.each(votes, function(vote) {
          var points = parseInt(vote, 10);
          if (isNaN(points)) {
            // parseInt returned NaN probably from '?'
            validVotes -= 1;
          } else {
            counter += points;
          }
        });

        // calculate average - rounding to two decimal places if required
        var average = counter / validVotes;
        if (average !== Math.round(average)) { average = average.toFixed(2); }

        this.$el.append(this.noConsensusTemplate({ average: average }));
      }
    }
  });

  return Players;
});