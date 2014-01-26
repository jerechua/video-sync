var _ = require('underscore');

exports.setupSocket = function(server) {

    var currentVideo = "";

    var PAUSE = 0;
    var PLAY = 1;

    var NOT_READY = 0;
    var READY = 1;

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
                'ready': client.status
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
        });

        socket.on('player:play', function(data) {
            videoState = PLAY;
            socket.broadcast.emit('player:play', data);
        });

        socket.on('player:timeupdate', function(data) {
            // Implement this for slow internet connection buffers
        });

        socket.on('player:change_src', function(data) {
            videoState = PAUSE;
            currentVideo = data['src'];
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