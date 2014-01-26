exports.setupSocket = function(server) {

  var io = require('socket.io').listen(server);
  //set log level to warn
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {
    socket.on('player:pause', function(data) {
        // console.log('sending pause');
        socket.broadcast.emit('player:pause', data);
    });

    socket.on('player:play', function(data) {
        // console.log('sending play');
        socket.broadcast.emit('player:play', data);
    });

    socket.on('player:timeupdate', function(data) {

    });

    socket.on('disconnect', function() {
        //clean up
    });
    
  });
}