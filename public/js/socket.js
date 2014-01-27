// User stuffz
var changeNameButton = $('#update_name');

// Video stuffz
var video = $('#main_video');
var videoUrl = $('#video_url');
var changeVideoUrl = $('#change_url');
var videoArea = $('#video_area');


var socket = io.connect(document.location.origin);

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
}
socket.on('startup:current_video', function(data) {
    changeSource(data['src']);
});

socket.on('startup:name', function(data) {
    $('#name').val(data.name);
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
    var htmlString = "<ul>";
    for (var i = 0; i < data.length; i++) {
        htmlString += "<li>";
        htmlString += "<span>" + data[i].name + "--</span><span>";
        if (data[i].ready) {
            htmlString += "Ready";
        } else {
            htmlString += "Not ready"
        }
        htmlString += "</span></li>";
    }
    htmlString += "</ul>";
    $('#connected_clients').html(htmlString);
    
});