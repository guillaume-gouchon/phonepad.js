
/**
*		Phonepad Singleton
*/
var Phonepad = (function () {

	// Instance stores a reference to the Singleton
  var instance;

	function init() {
  	
  	/**
  	*		PRIVATE
  	*/
		var COOKIE_PLAYER_ID = 'phonepad_player_id';
		var COOKIE_GAME_ID = 'phonepad_game_id';
		var COOKIE_EXPIRATION = 30;// in minutes

		var gameId = getCookie(COOKIE_GAME_ID);
		var playerId = getCookie(COOKIE_PLAYER_ID);
		var isConnecting = false;
		var networkClient = new Network();
		var controller = null;
		var connectionTimeout = null;

		generatePlayerId();
		controller = new Controller(playerId);
		setupUI();

		var screenWidth = $(window).width();
		var screenHeight = $(window).height();

		window.onresize = function () {
			screenWidth = $(window).width();
			screenHeight = $(window).height();
		}

		function generatePlayerId () {
			// generate player id the first time
			if (playerId == null) {
				playerId = generateUUID();
				setCookie(COOKIE_PLAYER_ID, playerId, COOKIE_EXPIRATION);
			}
		}
		
    function setupUI() {
    	// show reconnect button if needed
			if (gameId != null) {
				$('#rejoinBtn').removeClass('hide')
					.bind('touchstart', function () {
						press($(this));
					})
					.bind('touchend', function () {
						release($(this));
						connectToGame(gameId);
					});
			}

			// join game button
			var joinGameBtn = $('#joinGameBtn');
			joinGameBtn.bind('touchstart', function () {
				press($(this));
			})
			.bind('touchend', function () {
				release($(this));
				connectToGame(getGameIdInputValue());
			});

			// game id input
			$('#gameIdInput').on('focus', function () {
				// update bounce animation during UX
				$(this).removeClass('bounce');
				joinGameBtn.addClass('bounce');
			})
			.keydown(function (event) {
				if (event.keyCode == 13) {
					// join game when enter key is pressed
					connectToGame(getGameIdInputValue());
					$('#gameIdInput').blur();
				}
			});
    }

    function getGameIdInputValue() {
    	return $('#gameIdInput').val().toLowerCase();
    }

		function press(button) {
			button.addClass('active');
		};

		function release(button) {
			button.removeClass('active');
		};

    function connectToGame(chosenGameId) {
    	if (!isConnecting && chosenGameId.length > 0) {
  			$('#loading').removeClass('hide');
				gameId = chosenGameId;
				isConnecting = true;
				connectionTimeout = setTimeout(function () {
					onConnectionError();
				}, 3000);
				networkClient.connect(gameId, playerId, onConnected, onConnectionError);
			}
    }

		function onConnected() {
			console.log('Now connected to the game !');
			clearTimeout(connectionTimeout);
			$('#loading').addClass('hide');
			$('#joinGame').addClass('hide');

			// set cookies
			setCookie(COOKIE_GAME_ID, gameId, COOKIE_EXPIRATION);
			bindPadEvents();
		}

		function onConnectionError() {
			console.log('Cannot connect');
			isConnecting = false;
			$('#loading').addClass('hide');
			clearTimeout(connectionTimeout);
		}

		function bindPadEvents() {
			var phonePadZone = $('.phonepad');

			// press events
			phonePadZone.bind("touchstart", dispatchEvent);
			phonePadZone.bind("touchmove", dispatchEvent);

			// release events
			phonePadZone.bind("touchend", dispatchRelease);
		}

		function dispatchEvent(event) {
			event.preventDefault();

			if (event.originalEvent.touches.length == 0) return;

			for (var i in event.originalEvent.touches) {
				var touch = event.originalEvent.touches[i];
				if (!touch.clientX) continue;

				var ratioX = touch.pageX / screenWidth;
				var ratioY = touch.pageY / screenHeight;
				if (ratioX >= 0.6) {
					// buttons
					if (ratioX >= 0.732 && ratioX <= 0.864 && ratioY <= 0.33) {
						updateButtonState('btnY');
					} else if (ratioX >= 0.732 && ratioX <= 0.864 && ratioY >= 0.67) {
						updateButtonState('btnA');
					} else if (ratioX < 0.732 && ratioY > 0.33 && ratioY < 0.67) {
						updateButtonState('btnX');
					} else if (ratioX >= 0.732 && ratioX > 0.864 && ratioY > 0.33 && ratioY < 0.67) {
						updateButtonState('btnB');
					}
				} else if (ratioX <= 0.4) {
					// axes
					if (ratioX >= 0.132 && ratioX <= 0.264 && ratioY <= 0.33) {
						updateAxisState('axisN');
					} else if (ratioX >= 0.132 && ratioX <= 0.264 && ratioY >= 0.67) {
						updateAxisState('axisS');
					} else if (ratioX < 0.132 && ratioY > 0.33 && ratioY < 0.67) {
						updateAxisState('axisW');
					} else if (ratioX >= 0.132 && ratioX > 0.264 && ratioY > 0.33 && ratioY < 0.67) {
						updateAxisState('axisE');
					} else if (ratioX < 0.132 && ratioY <= 0.33) {
						updateAxisState('axisNW');
					} else if (ratioX > 0.264 && ratioY <= 0.33) {
						updateAxisState('axisNE');
					} else if (ratioX < 0.132 && ratioY >= 0.67) {
						updateAxisState('axisSW');
					} else if (ratioX > 0.264 && ratioY >= 0.67) {
						updateAxisState('axisSE');
					} else if (ratioX >= 0.132 && ratioX <= 0.264 && ratioY > 0.33 && ratioY < 0.67) {
						$('.axis div').removeClass('active');
						controller.releaseAllAxes();
					} 
				}
			}
		}

		function dispatchRelease(event) {
			event.preventDefault();

			for (var i in event.originalEvent.changedTouches) {
				var touch = event.originalEvent.changedTouches[i];

				if (!touch.clientX) continue;

				var ratioX = touch.pageX / screenWidth;
				var ratioY = touch.pageY / screenHeight;
				if (ratioX > 0.5) {
					$('.buttons div').removeClass('active');
					controller.releaseAllButtons();
				} else if (ratioX < 0.5) {
					$('.axis div').removeClass('active');
					controller.releaseAllAxes();
				}
			}

			// send commands
			networkClient.sendMessage(Network.MESSAGE_TYPES.commands, controller.toJSON());
		}

		function updateButtonState(buttonId) {
			// update UI
			$('.buttons div').removeClass('active');
			press($('.' + buttonId));
			
			// pick selected button
			var selectedButton;
			switch (buttonId) {
				case 'btnA':
					selectedButton = Controller.BUTTONS_MAP.A;
					break;
				case 'btnB':
					selectedButton = Controller.BUTTONS_MAP.B;
					break;
				case 'btnX':
					selectedButton = Controller.BUTTONS_MAP.X;
					break;
				case 'btnY':
					selectedButton = Controller.BUTTONS_MAP.Y;
					break;
			}

			// update controller
			var needsUpdate = controller.updateButtonState(selectedButton, true);

			// send commands
			if (needsUpdate) {
				networkClient.sendMessage(Network.MESSAGE_TYPES.commands, controller.toJSON());
			}
		}

		function updateAxisState(buttonId) {
			// update UI
			$('.axis div').removeClass('active');

			var needsUpdate = false;

			switch (buttonId) {
				case 'axisNW':
					press($('.axisN'));
					press($('.axisW'));
					needsUpdate = controller.updateAxisState(Controller.BUTTONS_MAP.axisVertical, -1.0) || controller.updateAxisState(Controller.BUTTONS_MAP.axisHorizontal, -1.0);
					break;
				case 'axisNE':
					press($('.axisN'));
					press($('.axisE'));
					needsUpdate = controller.updateAxisState(Controller.BUTTONS_MAP.axisVertical, -1.0) || controller.updateAxisState(Controller.BUTTONS_MAP.axisHorizontal, 1.0);
					break;
				case 'axisSW':
					press($('.axisS'));
					press($('.axisW'));
					needsUpdate = controller.updateAxisState(Controller.BUTTONS_MAP.axisVertical, 1.0) || controller.updateAxisState(Controller.BUTTONS_MAP.axisHorizontal, -1.0);
					break;
				case 'axisSE':
					press($('.axisS'));
					press($('.axisE'));
					needsUpdate = controller.updateAxisState(Controller.BUTTONS_MAP.axisVertical, 1.0) || controller.updateAxisState(Controller.BUTTONS_MAP.axisHorizontal, 1.0);
					break;
				case 'axisN':
					press($('.axisN'));
					needsUpdate = controller.updateAxisState(Controller.BUTTONS_MAP.axisVertical, -1.0) || controller.updateAxisState(Controller.BUTTONS_MAP.axisHorizontal, 0.0);
					break;
				case 'axisS':
					press($('.axisS'));
					needsUpdate = controller.updateAxisState(Controller.BUTTONS_MAP.axisVertical, 1.0) || controller.updateAxisState(Controller.BUTTONS_MAP.axisHorizontal, 0.0);
					break;
				case 'axisW':
					press($('.axisW'));
					needsUpdate = controller.updateAxisState(Controller.BUTTONS_MAP.axisVertical, 0.0) || controller.updateAxisState(Controller.BUTTONS_MAP.axisHorizontal, -1.0);
					break;
				case 'axisE':
					press($('.axisE'));
					needsUpdate = controller.updateAxisState(Controller.BUTTONS_MAP.axisVertical, 0.0) || controller.updateAxisState(Controller.BUTTONS_MAP.axisHorizontal, 1.0);
					break;
			}

			// send commands
			if (needsUpdate) {
				networkClient.sendMessage(Network.MESSAGE_TYPES.commands, controller.toJSON());
			}
		}

    return {
 
      /**
      *		PUBLIC
      */
 
    };
 
  };
 
  return {
 
    // Get the Singleton instance if one exists or create one if it doesn't
    getInstance: function () {
			if ( !instance ) {
				instance = init();
			}
      return instance;
    }
 
  };
 
})();
