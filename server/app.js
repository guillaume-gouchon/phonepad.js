var WS_PORT = 7070;
var WEB_RTC_PORT = 6060;

var randomWords = require('./randomWords');

var app = require('http').createServer(handler);
var io = require('socket.io')(app);
app.listen(WS_PORT);

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
    console.log(Object.keys(games).length, 'games running at the moment');
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
        // gameSocket.emit('disconnect', socket.playerId);
      } else  {
        // the game has been disconnected
        delete games[socket.gameId];
      }
    }
  });

});

console.info("Websockets Server is running on port " + WS_PORT + " !");

var PeerServer = require('peer').PeerServer;
var server = new PeerServer({port: WEB_RTC_PORT, path: ''});
server.on('connection', function (id) { 
  console.log('Connected', id);
});
server.on('disconnect', function (id) {
  console.log('Disconnected', id);
});

console.info("WebRTC Server is running on port " + WEB_RTC_PORT + " !");
