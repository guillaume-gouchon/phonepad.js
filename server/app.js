var PORT = 7070;

var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var randomWords = require('./randomWords');

app.listen(PORT);

function handler (req, res) {
  res.writeHead(200);
  res.end('yoooo');
}

// list of current games
var games = {};

// init socket.io
io.sockets.on('connection', function (socket) {

  // pick a unique game id
  var gameId;
  do {
    gameId = randomWords.pick();
  } while (games[gameId] != null);

  games[gameId] = socket;
  socket.emit('gameId', gameId);

  // new player is connected
  socket.on('pId', function (data) {
    var gameSocket = games[data.gameId];
    if (gameSocket != null) {
      gameSocket.emit('pId', data.pId);
    }
  });

  // commands to dispatch !
  socket.on('comm', function (data) {
     var gameSocket = games[data.gameId];
    if (gameSocket != null) {
      gameSocket.emit('comm', data.comm);
    }
  });

  // a player or a game has been disconnected
  socket.on('disconnect', function () {
    var disconnectedSocket = games[socket.id];
    if (disconnectedSocket != null) {
      console.log('destroying game...');
      delete games[socket.id];
    }
  });

});

console.info("Server is running on port " + PORT + " !");
