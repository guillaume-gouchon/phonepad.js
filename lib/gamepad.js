function GamepadHelper () {

	this.callbacks = new GamepadCallbacks();

	this.gamepads = [];

	this.pinging = false;
	this.prevRawGamepadTypes = [];

	var _this = this;

	this.init = function () {
		if ('ongamepadconnected' in window || !!navigator.mozGamepads) {
			// add Firefox events
			window.addEventListener('gamepadconnected', this.onGamepadConnect, false);
			window.addEventListener('gamepaddisconnected', this.onGamepadDisconnect, false);
		} else {
			var gamepadSupportAvailable = navigator.getGamepads || !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
			if (!gamepadSupportAvailable) {
				this.callbacks.showNotSupported();
			} else {
				// start polling (Google Chrome)
				this.startPolling();
			}
		}
	};

	this.startPolling = function () {
	    if (!this.pinging) {
	    	console.log('GAMEPAD', 'startPolling');
	    	this.pinging = true;
	    	this.pingGamepads();
	    }
	};

	this.stopPolling = function () {
		console.log('GAMEPAD', 'stopPolling');
		this.pinging = false;
	};
	  
	this.pingGamepads = function () {
		_this.pollGamepads();
		_this.scheduleNextPing();
	};

	this.scheduleNextPing = function () {
	    if (this.pinging) {
	    	if (window.requestAnimationFrame) {
	    		window.requestAnimationFrame(this.pingGamepads);
	    	} else if (window.mozRequestAnimationFrame) {
	    		window.mozRequestAnimationFrame(this.pingGamepads);
	    	} else if (window.webkitRequestAnimationFrame) {
	    		window.webkitRequestAnimationFrame(this.pingGamepads);
	    	}
	  	}
	};

  	this.pollGamepads = function () {
	    var rawGamepads = (navigator.getGamepads && navigator.getGamepads()) ||
	    	(navigator.webkitGetGamepads && navigator.webkitGetGamepads());

    	if (rawGamepads) {
				// remove the gamepads that left
				loopPlayer: for (var i in players) {
					var player = players[i];
					if (player.type == GAMEPAD_PLAYER) {
						for (var j in rawGamepads) {
							if (player.extra == rawGamepads[j].id) {
								break loopPlayer;
							}
						}
						delete this.prevRawGamepadTypes[i];
						this.removePlayer(this.gamepads[i]);
					}
				}

				this.gamepads = [];
    		var gamepadsChanged = false;

				for (var i = 0; i < rawGamepads.length; i++) {
					if (rawGamepads[i] != null && rawGamepads[i].id != this.prevRawGamepadTypes[i]) {
						gamepadsChanged = true;
						this.prevRawGamepadTypes[i] = rawGamepads[i].id;
					}

					if (rawGamepads[i]) {
						this.gamepads.push(rawGamepads[i]);
					}
				}

				if (gamepadsChanged) {
					// add new gamepads
					for (var i in this.gamepads) {
						this.addPlayer(this.gamepads[i]);
					}
				}

				this.callbacks.updateGamepads(this.gamepads);
			}
		};

	this.onGamepadConnect = function (event) {
		console.log('GAMEPAD', 'Gamepad connected');

		this.addPlayer(event.gamepad);
		
		this.startPolling();
	};

	this.onGamepadDisconnect = function (event) {
		for (var i in this.gamepads) {
			if (this.gamepads[i].index == event.gamepad.index) {
				console.log('GAMEPAD', 'Gamepad disconnected');
				this.removePlayer(event.gamepad);
				break;
			}
		}

		if (this.gamepads.length == 0) {
			this.stopPolling();
		}
	};

	this.addPlayer = function (newGamepad) {
		newGamepad.playerId = generateUUID();		
		addPlayer(GAMEPAD_PLAYER, newGamepad.id);
		this.gamepads.push(newGamepad);
	};

	this.removePlayer = function (gamepad) {
		removePlayer(getPlayerIndex(gamepad.playerId));
		this.gamepads.splice(gamepad.index, 1);
	};

};


function GamepadCallbacks () {

	this.showNotSupported = function () {
		$('#tutorials .col-4:nth(0)').css('opacity', 0.2);
	};

 	this.updateGamepads = function (gamepads) {
 		if (gamepads) {
   		for (var i in gamepads) {
 				var gamepad = gamepads[i];
	   		if (game == null) {
	   			// animations before game
	   			if (gamepad.buttons[0] instanceof Object && (gamepad.buttons[0].pressed || gamepad.buttons[1].pressed || gamepad.buttons[2].pressed || gamepad.buttons[3].pressed)
	   				|| gamepad.buttons[0] == 1 || gamepad.buttons[1] == 1 || gamepad.buttons[2] == 1 || gamepad.buttons[3] == 1
	   				|| gamepad.axes[0] > 0.2 || gamepad.axes[0] < -0.2) {
	   				// bounce !
	   				$('#playersList div:nth(' + playerIndex + ')').addClass('bounce');
	   			} else if ($('#playersList div:nth(' + playerIndex + ')').hasClass('bounce')) {
	   				// stop bouncing
	   				$('#playersList div:nth(' + playerIndex + ')').removeClass('bounce');
	   			}
	   		} else {
	   			// commands updates during game
	   			var commands = players[getPlayerIndex(gamepad.playerId)].commands;
	   			if (commands != null) {
	   				if (gamepad.buttons[0] instanceof Object) {
	   					// for analogic buttons gamepads
			        commands.brake = gamepad.buttons[0].pressed;
			        commands.accelerate = gamepad.buttons[1].pressed;
		      	} else {
	 			     	// for non-analogic (binary) buttons gamepads
		      		commands.brake = gamepad.buttons[0];
			        commands.accelerate = gamepad.buttons[1];
		      	}
		        commands.turnLeft = gamepad.axes[0] < -0.2;
		        commands.turnRight = gamepad.axes[0] > 0.2;
		      }
				}
			}
		}
	};

}
