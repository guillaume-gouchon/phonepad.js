function GamepadHelper () {

	var pinging = false;
	var prevRawGamepadTypes = [];
	var gamepads = [];

	var callbacks = null;

	this.init = function (phonepadCallbacks) {
		callbacks = phonepadCallbacks;
		if ('ongamepadconnected' in window || !!navigator.mozGamepads) {
			// Firefox events
			window.addEventListener('gamepadconnected', onGamepadConnect, false);
			window.addEventListener('gamepaddisconnected', onGamepadDisconnect, false);
		} else {
			var gamepadSupportAvailable = navigator.getGamepads || !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
			if (!gamepadSupportAvailable) {
				callbacks.onPadNotSupported(Phonepad.PAD_TYPES.gamepad);
			} else {
				startPolling();
			}
		}
	};

	var startPolling = function () {
    if (!pinging) {
    	pinging = true;
    	pingGamepads();
    }
	};

	var stopPolling = function () {
		var pinging = false;
	};
	  
	var pingGamepads = function () {
		pollGamepads();
		scheduleNextPing();
	};

	var scheduleNextPing = function () {
    if (pinging) {
    	if (window.requestAnimationFrame) {
    		window.requestAnimationFrame(pingGamepads);
    	} else if (window.mozRequestAnimationFrame) {
    		window.mozRequestAnimationFrame(pingGamepads);
    	} else if (window.webkitRequestAnimationFrame) {
    		window.webkitRequestAnimationFrame(pingGamepads);
    	}
  	}
	};

  var	pollGamepads = function () {
    var rawGamepads = (navigator.getGamepads && navigator.getGamepads()) ||
    	(navigator.webkitGetGamepads && navigator.webkitGetGamepads());

  	if (rawGamepads) {
			// remove the gamepads which left
			loopPrevPads: for (var i in prevRawGamepadTypes) {
				var prevRawGamepadType = prevRawGamepadTypes[i];
				for (var j in rawGamepads) {
					if (prevRawGamepadType == rawGamepads[j].id) {
						continue loopPrevPads;
					}
				}
				delete prevRawGamepadTypes[i];
				removePlayer(gamepads[i]);
			}

			gamepads = [];
  		var gamepadsChanged = false;

			for (var i = 0; i < rawGamepads.length; i++) {
				if (rawGamepads[i] != null && rawGamepads[i].id != prevRawGamepadTypes[i]) {
					gamepadsChanged = true;
					prevRawGamepadTypes[i] = rawGamepads[i].id;
				}

				if (rawGamepads[i]) {
					gamepads.push(rawGamepads[i]);
				}
			}

			if (gamepadsChanged) {
				// add new gamepads
				for (var i in gamepads) {
					addPlayer(gamepads[i]);
				}
			}

			callbacks.updateGamepads(gamepads);
		}
	};

	var onGamepadConnect = function (event) {
		addPlayer(event.gamepad);
		startPolling();
	};

	var onGamepadDisconnect = function (event) {
		for (var i in gamepads) {
			if (gamepads[i].index == event.gamepad.index) {
				console.log('GAMEPAD', 'Gamepad disconnected');
				removePlayer(event.gamepad);
				break;
			}
		}

		if (gamepads.length == 0) {
			stopPolling();
		}
	};

	var addPlayer = function (newGamepad) {
		gamepads.push(newGamepad);
		callbacks.onPlayerConnected(newGamepad.id, Phonepad.PAD_TYPES.gamepad);
	};

	var removePlayer = function (gamepad) {
		gamepads.splice(gamepad.index, 1);
	};

}
