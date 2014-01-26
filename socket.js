exports.setupSocket = function(server) {

  var io = require('socket.io').listen(server);
  //set log level to warn
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {
    socket.on('player:pause', function(data) {
        socket.broadcast.emit('player:pause', data);
    });

    socket.on('player:play', function(data) {
        socket.broadcast.emit('player:play', data);
    });

    socket.on('player:timeupdate', function(data) {
        // Implement this for slow internet connection buffers
    });

    socket.on('disconnect', function() {
        //clean up
    });
    
  });
}