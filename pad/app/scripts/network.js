/**
*		Connection Wrapper used for WebRTC and websockets connections.
*/
function Network() {

	var PEER_API_KEY = '609xv5np9cu15rk9';
	var WS_SERVER_URL = 'http://warnode.com:7070';

	var webRTCConnector = null;
	var socket = null;

	this.connect = function (gameId, playerId, onConnected) {
		if(/iP(hone|od)/.test(window.navigator.userAgent)) {
			console.log('Connecting through websockets...');
			socket = io.connect(WS_SERVER_URL);

		  // send player id to game
		  this.sendMessage(Network.MESSAGE_TYPES.playerId, {
		  	gameId: gameId,
		  	pId: playerId
		  });

			onConnected();
		} else {
			console.log('Connecting through webRTC...');
			var peer = new Peer(null, {key: PEER_API_KEY});
			webRTCConnector = peer.connect(gameId);
			webRTCConnector.on('open', function () {

			  // send player id to game
			  this.sendMessage(Network.MESSAGE_TYPES.playerId, playerId);

			  onConnected();
			});
		}
	};

	this.sendMessage = function (messageType, message) {
		if (webRTCConnector != null) {
			console.log('Sending message through webRTC...');
		  webRTCConnector.send({
		  	type: messageType,
		  	content: JSON.stringify(message)
		  });
		} else if (socket != null) {
			console.log('Sending message through websockets...')
			socket.emit(messageType, message);
		}
	};

}

Network.MESSAGE_TYPES = {
	playerId: 'pId',
	commands: 'comm'
};
