var express = require('express'),
  http = require('http'),
  app = express();

app.locals.pretty = true;

/** config */
app.configure(function() {
    app.set('port', process.argv[2] || process.env.PORT || 1337);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    app.use('/public', express.static(__dirname + '/public'));
    app.use(express.bodyParser());
});

app.get('/', function(req, res) {
    res.render('index.jade');
    // res.sendfile("./index.html");
});

app.get('/:room', function(req, res) {
    var roomName = req.param('room');
    res.render('room.jade', {'roomName': roomName});
});

/** Start server */

var server = http.createServer(app);
var socket = require('./socket.js').setupSocket(server);

server.listen(app.get('port'), function(){
    console.log("Server started on: " + app.get('port'));
});