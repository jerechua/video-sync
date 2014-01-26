exports.setupSocket = function(server) {

  var io = require('socket.io').listen(server);
  //set log level to warn
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {

    
  });
}