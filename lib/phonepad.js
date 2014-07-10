var PEER_API_KEY = '609xv5np9cu15rk9';
var SERVER_URL = 'http://warnode.com:9090';
var peer = null;
var conn = null;
var socket = null;

var MESSAGE_TYPES = {
	playerId: 'pId',
	commands: 'comm'
};

function createReceiver() {
	// initalize webRTC connection
	try {
		peer = new Peer(gameId, { key: PEER_API_KEY });
		
		// listen for phonepads connections
		peer.on('connection', function (conn) {

			// register message receiver
			conn.on('data', function (data) {
				switch(data.type) {
					case MESSAGE_TYPES.playerId:
						console.log('Receiving player id from webRTC...');
						addPlayer(PHONEPAD_PLAYER, data.content);
						break;
					case MESSAGE_TYPES.commands:
						console.log('Receiving commands from webRTC...');
						var commands = JSON.parse(data.content);
						dispatchCommand(commands);
						break;
				}
			
		  });

		  // remove disconnected players
		  conn.on('close', function () {
		  	console.log('A player has been disconnected');
		  });

		});
	} catch (e) {
		console.error(e);
	}

	// connect websockets as well for non-webRTC clients
	socket = io.connect(SERVER_URL);

	console.log('Creating new game', gameId);
	socket.emit('newGame', gameId);

	socket.on('pId', function (pId) {
		console.log('Receiving player id from websockets...');
		addPlayer(PHONEPAD_PLAYER, pId);
	});

	socket.on('comm', function (commands) {
		console.log('Receiving commands from websockets...');
		dispatchCommand(commands);
	});

}

function dispatchCommand(commands) {
	if (game != null) {
  	players[getPlayerIndex(commands.id)].commands = commands;
	} else {
		if (commands.accelerate || commands.turnRight || commands.turnLeft || commands.brake) {
			$('#playersList div:nth(' + getPlayerIndex(commands.id) + ')').addClass('bounce');
		} else {
			$('#playersList div:nth(' + getPlayerIndex(commands.id) + ')').removeClass('bounce');
		}
	}
}

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
