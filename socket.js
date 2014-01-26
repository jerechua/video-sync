exports.setupSocket = function(server) {

    var currentVideo = "";
    
    var io = require('socket.io').listen(server);
    //set log level to warn
    io.set('log level', 1);

    io.sockets.on('connection', function (socket) {
        if (currentVideo != "") {
            socket.emit('startup:current_video', {'src': currentVideo});
        }
        socket.on('player:pause', function(data) {
            socket.broadcast.emit('player:pause', data);
        });

        socket.on('player:play', function(data) {
            socket.broadcast.emit('player:play', data);
        });

        socket.on('player:timeupdate', function(data) {
            // Implement this for slow internet connection buffers
        });

        socket.on('player:change_src', function(data) {
            currentVideo = data['src'];
            socket.broadcast.emit('player:change_src', data);
        });

        socket.on('disconnect', function() {
            //clean up
        });

    });
}