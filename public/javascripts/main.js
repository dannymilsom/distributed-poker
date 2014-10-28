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
    var $options = $("#options");
    if ($options.children().length === 0){
      for (var i=0; i < pointsLength; i++){
        $options.append($("<div/>").addClass("points-btn button")
                                   .append($("<span/>").text(pointValues[i])));
      }
    }
  });

  socket.on('valid email', function() {
    $("#login, .intro-text").fadeOut("slow", function() {
      $("#main").fadeIn("slow").removeClass("hidden");
    });
  });

  socket.on('invalid email', function(msg) {
    $("#login").append(msg);
  });

  socket.on('vote', function(voteDetails){
    $("#users").find("#" + voteDetails['username'] + " .card")
               .addClass("blurry-text")
               .text(voteDetails['points']);
  });

  socket.on('clear', function(){
    $("#users, #results").fadeOut(function() {
      $('#users').find(".card").text("?");
      $('#results').html("");
    });
    $("#users, #results").fadeIn();
  });

  socket.on('reveal', function(){

    $("#users, #results").fadeOut(function() {

      var votes = [],
          counter = 0,
          $results = $("#results"),
          $cards = $(".card"),
          $users = $("#users ul").children();

      $results.html("");
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
        $users.each(function(){
          counter += parseInt($(this).text()[0], 10);
        });

        var average = counter / $users.length;
        $results.html($("<span/>").attr("id", "disagreement")
                                  .text("No consensus - average points " + average));
      }

      // re-order the user list according to the points scored
      $users.sort(function(a, b) {
        var an = $(a).text()[0],
            bn = $(b).text()[0];
        if(an > bn) {
          return 1;
        }
        if(an < bn) {
          return -1;
        }
        return 0;
      });

      // modify the DOM to reflect point scores
      $("#users").html($("<ul/>"));
      $users.each(function(){
        $("#users ul").append(this);
      });
      $("#users, #results").fadeIn();
    });

  });

  socket.on('feed', function(msg){
    var d = new Date();
    var hours = ('0' + d.getHours()).slice(-2);
    var minutes = ('0' + d.getMinutes()).slice(-2);
    $('#feed').append($('<li/>').text(hours + ":" + minutes + " " + msg));
  });

  socket.on('update users', function(users){
    var userList = $("<ul/>");
    $.each(users, function(key, value) {
      //userList.append($("<li/>").text(value));
      var $img = $("<img/>").attr({
        src: gravatar + value['hash'],
        title: value['username']
      });
      var $card = $("<div/>").addClass("card").text("?");
      userList.append($("<li/>").attr('id', value['username'])
                                .append($img)
                                .append($card));
    });
    $('#users').html(userList);
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
    socket.emit('join', {
      username: username,
      email: email
    });
  });

  $("#options").on("click", ".points-btn", function() {
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