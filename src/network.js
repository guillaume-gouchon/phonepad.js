/**
*		Connection Wrapper used for WebRTC and websockets connections.
*/
function Network() {

	var PEER_API_KEY = '609xv5np9cu15rk9';
	var WS_SERVER_URL = 'http://warnode.com:7070';

	var connectWS = function (callbacks) {
		// connect websockets for non-webRTC clients
		socket = io.connect(WS_SERVER_URL);
		socket.on('gameId', function (gameId) {
			console.log('Received gameId', gameId);
			connectWebRTC(gameId, callbacks);
			callbacks.onConnected(gameId);
		});

		socket.on('pId', function (pId) {
			console.log('Receiving player id from websockets...');
			callbacks.onPlayerConnected(pId, Phonepad.PAD_TYPES.phonepad);
		});

		socket.on('comm', function (commands) {
			console.log('Receiving commands from websockets...');
			callbacks.onCommandsReceived(commands);
		});
	};

	var connectWebRTC = function (gameId, callbacks) {
		// initalize webRTC connection
		try {
			var peer = new Peer(gameId, { key: PEER_API_KEY });
			peer.on('connection', function (conn) {

				// register message receiver
				conn.on('data', function (data) {
					switch(data.type) {
						case 'pId':
							console.log('Receiving player id from webRTC...');
							callbacks.onPlayerConnected(JSON.parse(data.content), Phonepad.PAD_TYPES.phonepad);
							break;
						case 'comm':
							console.log('Receiving commands from webRTC...');
							var commands = JSON.parse(data.content);
							callbacks.onCommandsReceived(commands);
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
	};

	this.connect = function (callbacks) {
		connectWS(callbacks);
	};

}
