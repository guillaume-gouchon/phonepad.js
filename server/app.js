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

  // new game
  socket.on('newGame', function (data) {
    // pick a unique game id
    var gameId;
    do {
      gameId = randomWords.pick();
    } while (games[gameId] != null);

    socket.gameId = gameId;
    games[gameId] = socket;
    socket.emit('gameId', gameId);
  });

  // new player is connected
  socket.on('pId', function (data) {
    var gameSocket = games[data.gameId];
    if (gameSocket != null) {
      socket.playerId = data.pId;
      socket.gameId = data.gameId;
      gameSocket.emit('pId', data.pId);
      socket.emit('connected');
    } else {
      socket.emit('error');
    }
  });

  // commands to dispatch !
  socket.on('comm', function (data) {
     var gameSocket = games[socket.gameId];
    if (gameSocket != null) {
      gameSocket.emit('comm', data);
    }
  });

  // handles disconnections
  socket.on('disconnect', function () {
    var gameSocket = games[socket.gameId];
    if (gameSocket != null) {
      if (socket.playerId != null) {
        // a player has been disconnected
        gameSocket.emit('disconnect', socket.playerId);
      } else  {
        // the game has been disconnected
        delete games[socket.gameId];
      }
    }
  });

});

console.info("Server is running on port " + PORT + " !");
