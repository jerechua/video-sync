function initialize() {
  var webrtc = new SimpleWebRTC({
    localVideoEl: 'my-webcam',
    remoteVideosEl: 'friends-webcams',
    autoRequestMedia: true
  });

  return webrtc;
}

$(function() {
  var webrtc = initialize();

  webrtc.on('readyToCall', function() {
    webrtc.joinRoom(roomName);
  });
});