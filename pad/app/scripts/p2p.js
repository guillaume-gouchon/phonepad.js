var PEER_API_KEY = '609xv5np9cu15rk9';
var SERVER_URL = 'http://warnode.com:9090';
var peer = null;
var conn = null;
var socket = null;

var MESSAGE_TYPES = {
	playerId: 'pId',
	commands: 'comm'
};

function connectToGame(gameId, playerId, onConnected) {
	console.log('Joining game...');

	if (playerId == null) {
		console.log('Generating unique player id...');
		playerId = generateUUID();
	}
	console.log('Player id is', playerId);

	if(/iP(hone|od)/.test(window.navigator.userAgent)) {
		socket = io.connect(SERVER_URL);

	  // send player id to game
		socket.emit('pId', { gameId: gameId, pId: playerId });

		onConnected(playerId);
	} else {
		peer = new Peer(null, {key: PEER_API_KEY});

		// connect to game
		conn = peer.connect(gameId);

		conn.on('open', function () {
		  // send player id to game
		  var message = buildMessage(MESSAGE_TYPES.playerId, playerId);
		  conn.send(message);

		  onConnected(playerId);
		});
	}
}

function sendCommands(commands) {
	if (conn != null) {
		console.log('Sending commands through webRTC...')
		var message = buildMessage(MESSAGE_TYPES.commands, JSON.stringify(commands));
	  conn.send(message);
	} else if (socket != null) {
		console.log('Sending commands through websockets...')
		socket.emit('comm', { gameId: gameId, comm: commands });
	}
}

function buildMessage(type, content) {
	return {
		type: type,
		content: content
	}
}
