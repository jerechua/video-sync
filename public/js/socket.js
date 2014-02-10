// User stuffz
var changeNameButton = $('#update_name');

// Video stuffz
var video = $('#main_video');
var videoUrl = $('#video_url');
var changeVideoUrl = $('#change_url');
var videoArea = $('#video_area');


var socket = io.connect(document.location.origin);
socket.emit('subscribe', {'room': roomName});

function sync(data) {
  var videoStats = getPayload(video);
  if (data.src != videoStats.src) {
    changeSource(data.src);
  }
  // Might need to be refactored, this will be hit
  // n client times for each user if someone seeks
  if (Math.abs(data.time - videoStats.time) > 1) {
    video[0].currentTime = data['time'];
  }

  $('#current_video').html(data.src);
}

socket.on('startup:current_video', function(data) {
  changeSource(data['src']);
});

socket.on('startup:name', function(data) {
  $('#name').attr('placeholder', data.name);
});

socket.on('player:pause', function(data) {
  video[0].pause();
  sync(data);
});

socket.on('player:play', function(data) {
  sync(data);
  video[0].play();
});

socket.on('player:seek', function(data) {
  video[0].pause();
  sync(data);
});

socket.on('player:change_src', function(data) {
  changeSource(data['src']);
});

socket.on('user:update:clientlist', function(data) {
  var htmlString = "<table class='table'>";
  htmlString +=  "<thead><tr><th>Name</th><th>Status</th></tr></thead>";
  htmlString += "<tbody>";
  for (var i = 0; i < data.length; i++) {
    htmlString += "<tr>";
    htmlString += "<td>" + data[i].name + "</td><td>";
    htmlString += "<span class='label ";
    switch(data[i].status) {
      case "Ready":
        htmlString += "label-success"; break;
      case "Not Ready":
        htmlString += "label-danger"; break;
      case "Playing":
        htmlString += "label-primary"; break;
      case "Paused":
        htmlString += "label-warning"; break;
    }
    htmlString += "'>" + data[i].status + "</span>";
    htmlString += "</td></tr>";
  }
  htmlString += "</tbody></table>";
  $('#connected_clients').html(htmlString);
});