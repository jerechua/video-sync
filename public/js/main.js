function changeName(newName) {
    var payload = {
        'name': newName
    };
    socket.emit('user:update:name', payload);
}

function getPayload(video) {
    var video = video[0];
    return {
        'src': video.currentSrc,
        'time': video.currentTime
    };
};

function _buildVideoElem(sourceUrl) {
    return "<video id='main_video' controls>" +
        "<source src=" + sourceUrl + " type='video/mp4'>" +
        "</video>";
};

function changeSource(sourceUrl) {
    videoArea.html(_buildVideoElem(sourceUrl));
    video = $('#main_video');
    bindVideoEvents();
};

function bindVideoEvents() {
    video.on('pause', function() {  
        socket.emit("player:pause", getPayload(video));
    });

    video.on('play', function() {
        socket.emit("player:play", getPayload(video));
    });

    video.on('seeked', function(data) {
        video[0].pause();
        socket.emit("player:seek", getPayload(video));  
    });
    
    video.on('canplay', function() {
        socket.emit('player:ready', getPayload(video));
    });

    changeVideoUrl.click(function() {
        var newUrl = videoUrl.val();
        changeSource(newUrl);
        socket.emit('player:change_src', {'src': newUrl});
    });
};


$(function() {
    $('.prevent-default').click(function(evt) {
        evt.preventDefault();
    });
    changeNameButton.click(function() {
        changeName($('#name').val());
    });
    bindVideoEvents();
});