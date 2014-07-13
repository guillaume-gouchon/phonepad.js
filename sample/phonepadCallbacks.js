function PhonepadCallbacks () {

	var callbacks = {
		onPadNotSupported: null,
		onConnected: null,
		onPlayerConnected: null,
		onPlayerDisconnected: null,
		onCommandsReceived: null
	};

	this.onPadNotSupported = function (padType) {
		if (callbacks.onPadNotSupported != null) {
			callbacks.onPadNotSupported(padType);
		}
	};

	this.onConnected = function (gameId) {
		if (callbacks.onConnected != null) {
			callbacks.onConnected(gameId);
		}
	};

	this.onPlayerConnected = function (playerId, padType) {
		if (callbacks.onPlayerConnected != null) {
			callbacks.onPlayerConnected(playerId, padType);
		}
	};

	this.onPlayerDisconnected = function () {
		if (callbacks.onPlayerDisconnected != null) {
			callbacks.onPlayerDisconnected();
		}
	};

	this.onCommandsReceived = function (commands) {
		if (callbacks.onCommandsReceived != null) {
			callbacks.onCommandsReceived(commands);
		}
	};

	this.setListener = function (type, callback) {
		if (type in callbacks) {
			callbacks[type] = callback;
		}
	};

}
