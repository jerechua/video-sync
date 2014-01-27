var _ = require('underscore');

exports.setupSocket = function(server) {

    var currentVideo = "";

    var PAUSE = "Paused";
    var PLAY = "Playing";

    var NOT_READY = "Not Ready";
    var READY = "Ready";

    var videoState = PAUSE;

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
        if (currentVideo != "") {
            socket.emit('startup:current_video', {'src': currentVideo});
        }
        emitClientList(socket);
    }

    function _getClientList() {
        var clientList = [];
        _.each(clients, function(client) {
            var data = {
                'name': client.name,
                'status': client.status
            };
            clientList.push(data);
        });
        return clientList;
    }

    function emitClientList(socket) {
        var clientList = _getClientList();
        socket.emit('user:update:clientlist', clientList);
        socket.broadcast.emit('user:update:clientlist', clientList);
    }

    io.sockets.on('connection', function (socket) {
        // Startup stuff
        setUp(socket);

        // Video player
        socket.on('player:pause', function(data) {
            videoState = PAUSE;
            socket.broadcast.emit('player:pause', data);
            clients[socket.id].status = PAUSE;
            emitClientList(socket);
        });

        socket.on('player:play', function(data) {
            videoState = PLAY;
            socket.broadcast.emit('player:play', data);
            clients[socket.id].status = PLAY;
            emitClientList(socket);
        });

        socket.on('player:seek', function(data) {
            socket.broadcast.emit('player:seek', data);
        });

        socket.on('player:change_src', function(data) {
            videoState = PAUSE;
            currentVideo = data['src'];
            _.each(clients, function(client) {
                client.status = NOT_READY;
            });
            emitClientList(socket);
            socket.broadcast.emit('player:change_src', data);
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
        });

    });
}