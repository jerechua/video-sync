var _ = require('underscore');

exports.setupSocket = function(server) {

  var currentVideo = "";
  var roomVideos = {};

  var PAUSE = "Paused";
  var PLAY = "Playing";
  var NOT_READY = "Not Ready";
  var READY = "Ready";


  var clientNumber = 0;
  var clients = {};

  var io = require('socket.io').listen(server);
  //set log level to warn
  io.set('log level', 1);

  function setUp(socket) {
    // Startup stuff
    var name = 'Guest' + clientNumber++;
    clients[socket.id] = {};
    clients[socket.id]['name'] = name;
    clients[socket.id]['status'] = NOT_READY;

    socket.emit('startup:name', {'name': name});
  }

  function _getClientList(room) {
    var roomClients = io.sockets.clients(room);

    var clientList = [];
    _.each(roomClients, function(client) {
      if(clients[client.id]) {
        var data = {
          'name': clients[client.id].name,
          'status': clients[client.id].status
        };
        clientList.push(data);
      }
    });
    return clientList;
  }

  function emitClientList(socket) {
    socket.get('room', function(err, room) {
      var clientList = _getClientList(room);
      socket.emit('user:update:clientlist', clientList);
      socket.broadcast.to(room).emit('user:update:clientlist', clientList);
    });
  }

  io.sockets.on('connection', function (socket) {
    // Startup stuff
    setUp(socket);

    socket.on('subscribe', function(data) {
      // When the client is ready, it will issue a subscribe event
      socket.get('room', function(err, roomName) {
        if (roomName) {
          socket.leave(roomName);
        }
        socket.set('room', data.room);
        socket.join(data.room);
        emitClientList(socket);

        if (roomVideos[data.room] == null) {
          roomVideos[data.room] = {
            src: ""
          };
        }

        if (roomVideos[data.room].src != "") {
          socket.emit('startup:current_video', {'src': roomVideos[data.room]});
        }
      });
    });

    // Video player
    socket.on('player:pause', function(data) {
      socket.get('room', function(err, room) {
        socket.broadcast.to(room).emit('player:pause', data);
        clients[socket.id].status = PAUSE;
        emitClientList(socket);
      });
    });

    socket.on('player:play', function(data) {
      socket.get('room', function(err, room) {
        socket.broadcast.to(room).emit('player:play', data);
        clients[socket.id].status = PLAY;
        emitClientList(socket);
      });
    });

    socket.on('player:seek', function(data) {
      socket.get('room', function(err, room) {
        socket.broadcast.to(room).emit('player:seek', data);
      });
    });

    socket.on('player:change_src', function(data) {
      socket.get('room', function(err, room) {
        roomVideos[room] = data.src;
        var roomClients = io.sockets.clients(room);
        _.each(roomClients, function(client) {
          clients[client.id].status = NOT_READY;
        });
        emitClientList(socket);
        socket.broadcast.to(room).emit('player:change_src', data);
      });
    });

    socket.on('player:ready', function(data) {
      clients[socket.id].status = READY;
      emitClientList(socket);
    });

    // User
    socket.on('user:update:name', function(data) {
      clients[socket.id].name = data.name;
      emitClientList(socket);
    });

    socket.on('disconnect', function() {
      //clean up
      delete clients[socket.id];
      emitClientList(socket);
      socket.get('room', function(err, room) {
        if (io.sockets.clients(room).length - 1 < 1) {
          delete roomVideos[room];
        }
      });
    });

  });
}