/**
*		Connection Wrapper used for WebRTC and websockets connections.
*/
function Network() {

	var WEBRTC_SERVER_HOST = 'pad.gouchon.com';
	var WS_SERVER_URL = 'https://pad.gouchon.com';

	var webRTCConnector = null;
	var socket = null;

	this.connect = function (gameId, playerId, onConnected, onError) {
		if(!isWebRTCCapable()) {
			console.log('Connecting through websockets...');
			socket = io.connect(WS_SERVER_URL);

			// send player id to game
		  this.sendMessage(Network.MESSAGE_TYPES.playerId, {
		  	gameId: gameId,
		  	pId: playerId
		  });

			socket.on('connected', function () {
				onConnected();
			});

		  socket.on('error', function () {
		  	onError();
		  });
		} else {
			console.log('Connecting through webRTC...');
			var peer = new Peer(null, { host: WEBRTC_SERVER_HOST });
			webRTCConnector = peer.connect(gameId);
			var _this = this;
			webRTCConnector.on('open', function () {

			  // send player id to game
			  _this.sendMessage(Network.MESSAGE_TYPES.playerId, playerId);

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
