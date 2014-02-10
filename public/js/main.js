function changeName($name) {
  $name.attr('placeholder', $name.val());
  var payload = {
    'name': $name.val()
  };
  socket.emit('user:update:name', payload);
  $name.val('');
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
  var THROTTLE_WAIT = 100;
  video.on('pause', _.throttle(function() {
    socket.emit("player:pause", getPayload(video));
  }, THROTTLE_WAIT));

  video.on('play', _.throttle(function() {
    socket.emit("player:play", getPayload(video));
  }, THROTTLE_WAIT));

  video.on('seeked', _.throttle(function(data) {
    video[0].pause();
    socket.emit("player:seek", getPayload(video));
  }, THROTTLE_WAIT));

  video.on('canplay', _.throttle(function() {
    socket.emit('player:ready', getPayload(video));
  }, THROTTLE_WAIT));

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
    changeName($('#name'));
  });
  bindVideoEvents();
});