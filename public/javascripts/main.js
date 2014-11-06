$(function() {

  // we will use this method to see if the group reached a concencous
  Array.prototype.AllValuesSame = function(){
    if(this.length > 0) {
      for(var i = 1; i < this.length; i++)
        {
          if(this[i] !== this[0])
            return false;
        }
    }
    return true;
  };

  Array.prototype.min = function(){
    return Math.min.apply(Math, this);
  };

  Array.prototype.max = function(){
    return Math.max.apply(Math, this);
  };

  var username;
  var socket = io(),
      gravatar = 'http://www.gravatar.com/avatar/';

  // events pushed FROM server

  socket.on('render options', function(pointValues){
    var pointsLength = pointValues.length;
    var $options = $("#vote-options");
    if ($options.children().length === 0){
      for (var i=0; i < pointsLength; i++){
        var classes = "small-2 medium-1 columns inner-padding";
        if (i == pointsLength - 1) {
          classes = classes + " end";
        }
        $options.append($("<div/>").addClass(classes)
                                   .append($("<div/>").addClass("button points")
                                   .append($("<span/>")
                                   .text(pointValues[i]))));
      }
    }
  });

  socket.on('valid email', function() {
    $("#welcome").fadeOut("slow", function() {
      if (role == 'observer') {
        $(".button").addClass("disabled");
      }
      $("#poker-room").fadeIn("slow", function() {
        $("#poker-room").removeClass("hidden");
      });
    });
  });

  socket.on('invalid email', function(msg) {
    $("#login").append(msg);
  });

  socket.on('vote', function(voteDetails){
    $("#players").find("#" + voteDetails['username'] + " .card")
               .addClass("blurry-text")
               .text(voteDetails['points']);
  });

  socket.on('clear', function(){
    $("#players, #results").fadeOut(function() {
      $('#players').find(".card").text("?");
      $(".card").removeClass("blurry-text");
      $('#results').html("");
    });
    $("#players, #results").fadeIn();
  });

  socket.on('reveal', function(){

    $("#results").fadeOut(function(){
      $(this).html("");
    });

    $("#players").fadeOut(function() {

      var votes = [],
          counter = 0,
          $results = $("#results"),
          $cards = $(".card"),
          $users = $("#players ul").children();

      $cards.removeClass("blurry-text");

      // count the votes and show an appropriate message
      $.each($cards, function(key, value) {
        votes.push($(value).text());
      });

      if (votes.AllValuesSame()) {
        $results.html($("<span/>").attr("id", "agreement")
                                  .text("Group consensus!"));
      }
      else {
        validVotes = $users.length;
        $users.each(function(){
          var pointsVoted = parseInt($(this).text(), 10);
          if (isNaN(pointsVoted)) {
            // parseInt returned NaN probably from '?'
            validVotes -= 1;
          } else {
            counter += pointsVoted;
          }
        });

        var average = counter / validVotes;
        // round to two decimal places if required
        if (average !== Math.round(average)) {
          average = average.toFixed(2);
        }
        $results.html($("<span/>").attr("id", "disagreement")
                                  .text("No consensus - average points " + average));
      }

      // re-order the user list according to the points scored
      $users.sort(function(a, b) {
        var an = parseInt($(a).text(), 10) || 0,
            bn = parseInt($(b).text(), 10) || 0;
        if(an > bn) {
          return 1;
        }
        if(an < bn) {
          return -1;
        }
        return 0;
      });

      // modify the DOM to reflect point scores
      $("#players").html($("<ul/>"));
      $users.each(function(){
        $("#players ul").append(this);
      });
      $("#players, #results").fadeIn();
    });

  });

  socket.on('feed', function(msg){
    var d = new Date();
    var hours = ('0' + d.getHours()).slice(-2);
    var minutes = ('0' + d.getMinutes()).slice(-2);
    $('#feed').append($('<li/>').text(hours + ":" + minutes + " " + msg));
  });

  socket.on('update users', function(users){
    var playerList = $("<ul/>"),
        observerList = $("<ul/>");

    $.each(users, function(key, value) {

      var $img = $("<img/>").attr({
        src: gravatar + value['hash'],
        title: value['username'] + " : " + value['role']
      });

      if (value['role'] == 'player') {
        var $card = $("<div/>").addClass("card").text("?");
        playerList.append($("<li/>").attr('id', value['username'])
                                  .addClass("small-12 colums")
                                  .append($img)
                                  .append($card));
      } else {
        observerList.append($("<li/>").attr('id', value['username'])
                                      .append($img));
      }
    });
    $('#players').html(playerList);
    $("#observers").html(observerList);
  });

  socket.on('user left', function(username) {
    $("#" + username).fadeOut(function() {
      $(this).remove();
    });
  });

  // events pushed TO server
  $("#login").submit(function(e) {
    e.preventDefault();
    $(".warning").remove();
    email = $('input[name=email]').val();
    username = email.split("@")[0].replace(".", "");
    role = $('select[name=role]').find(':selected').val();
    socket.emit('join', {
      username: username,
      email: email,
      role: role
    });
  });

  $("#vote-options").on("click", ".points:not(.disabled)", function() {
    socket.emit('vote', {
      email: email,
      username: username,
      points: $(this).find("span").text()
    });
  });

  $("#clear-points").on("click", function() {
    socket.emit('clear');
  });

  $("#reveal-points").on("click", function() {
    socket.emit('reveal');
  });

  // keyboard shortcuts which also push events to the server
  $(document).on('keyup', null, 'c', function(){
    socket.emit('clear');
  });

  $(document).on('keyup', null, 'r', function(){
    socket.emit('reveal');
  });

  // TODO - Voting on cards

});