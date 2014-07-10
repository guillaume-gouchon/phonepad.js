var PORT = 9090;

var app = require('http').createServer(handler);
var io = require('socket.io')(app);

app.listen(PORT);

function handler (req, res) {
  res.writeHead(200);
  res.end('yo');
}


// current games socket list
var games = {};

// init socket.io
io.sockets.on('connection', function (socket) {

  socket.on('newGame', function (data) {
    games[data] = socket;
  });

  socket.on('pId', function (data) {
    var gameSocket = games[data.gameId];
    if (gameSocket != null) {
      gameSocket.emit('pId', data.pId);
    }
  });

  socket.on('comm', function (data) {
     var gameSocket = games[data.gameId];
    if (gameSocket != null) {
      gameSocket.emit('comm', data.comm);
    }
  });

  socket.on('disconnect', function () {
    var disconnectedSocket = games[socket.id];
    if (disconnectedSocket != null) {
      console.log('destroying game...');
      delete games[socket.id];
    }
  });

});

console.info("Mychrome Machines server is running on port " + PORT + " !");
