
function PhonePad () {

	var PHONEPAD_ACCELEROMETER_THRESHOLD = 10.0;// angle in degrees
	var COOKIE_PLAYER_ID = 'my_machines_player_id';
	var COOKIE_GAME_ID = 'my_machines_game_id';
	var COOKIE_EXPIRATION = 30;// in minutes

	this.myCommand = new Command();
	this.isWheel = false;
	this.baseAngle = null;
	this.acceleratePosition = null;
	this.brakePosition = null;
	this.turnLeftPosition = null;
	this.turnRightPosition = null;

	var _this = this;

	/**
	*		Callbacks
	*/
	var onConnected = function (playerId) {
		console.log('Connected to game with playerId', playerId);

		$('#joinGameDialog').addClass('hide');
		$('#pad .header div').removeClass('player' + _this.myCommand.id).addClass('player' + playerId % 4);
		_this.myCommand = new Command(playerId);

		// set cookies
		setCookie(COOKIE_GAME_ID, gameId, COOKIE_EXPIRATION);
		setCookie(COOKIE_PLAYER_ID, playerId, COOKIE_EXPIRATION);

		_this.isWheel = $('#wheel input').is(':checked');
		_this.bindEvents();
		_this.acceleratePosition = $('#accelerateBtn').position();
		_this.brakePosition = $('#brakeBtn').position();
		_this.turnLeftPosition = $('#turnLeftBtn').position();
		_this.turnRightPosition = $('#turnRightBtn').position();
	};

	var switchPad = function (isWheel) {
		if (isWheel) {
			$('.noWheel').addClass('hide');
			$('.withWheel').removeClass('hide');
		} else {
			$('.noWheel').removeClass('hide');
			$('.withWheel').addClass('hide');
		}
	};

	this.init = function () {

		// check if any cookie
		gameId = getCookie(COOKIE_GAME_ID);
		if (gameId != null) {
			$('#rejoinBtn').removeClass('hide');

			$('#rejoinBtn').bind('touchstart', function () {
				connectToGame(gameId, getCookie(COOKIE_PLAYER_ID), onConnected);
				_this.press('#rejoinBtn');
			});
			$('#rejoinBtn').bind('touchend', function () {
				_this.release('#rejoinBtn');
			});
		}

		// check if accelerometer is enabled
		if ('deviceorientation' in window || window.DeviceMotionEvent || 'MozOrientation' in window) {
			$('#wheel').removeClass('hide');
		}

		// update bounce animation
		$('#inputName').on('focus', function () {
			$(this).removeClass('bounce');
			$('#joinGameBtn').addClass('bounce');
		});

		// switch pad view
		$('#wheel input').click(function () {
			switchPad($(this).is(':checked'));
		});
		
		// join game
		$('#inputName').keydown(function (event) {
			if (event.keyCode == 13) {
				joinGame();
			}
		});

		$('#joinGameBtn').bind('touchstart', function () {
			joinGame();
			_this.press('#joinGameBtn');
		});
		$('#joinGameBtn').bind('touchend', function () {
			_this.release('#joinGameBtn');
		});
	};

	var isConnecting = false;

	var joinGame = function () {
		if (!isConnecting) {
			gameId = $('#inputName').val().toLowerCase();
			if (gameId.length > 0) {
				connectToGame(gameId, getCookie(COOKIE_PLAYER_ID), onConnected);
				isConnecting = true;
				setTimeout(function () {
					isConnecting = false;
				}, 2000);
			}
		}
	}

	this.dispatchEvent = function (event) {
		event.preventDefault();
		var targetId = event.target.id;
		if (event.type == 'touchmove') {
			var x = event.originalEvent.touches[0].clientX;
			if (event.originalEvent.touches.length > 1) {
				x = Math.min(event.originalEvent.touches[0].clientX, event.originalEvent.touches[1].clientX);
			}
			if (x < _this.acceleratePosition.left 
				&& x > _this.turnRightPosition.left) {
				_this.turnRight();
				return;
			} else if (x < _this.turnRightPosition.left 
				&& x > _this.turnLeftPosition.left) {
				_this.turnLeft();
				return;
			}
		} else if (event.target.tagName == 'IMG') {
			targetId = event.target.parentElement.parentElement.id;
		} else if (event.target.tagName == 'DIV') {
			targetId = event.target.parentElement.id;
		}
		switch(targetId) {
			case 'accelerateBtn':
				_this.accelerate();
				break;
			case 'brakeBtn':
				_this.brake();
				break;
			case 'turnRightBtn':
				_this.turnRight();
				break;
			case 'turnLeftBtn':
				_this.turnLeft();
				break;
		}
	};

	this.dispatchRelease = function (event) {
		var targetId = event.target.id;
		if (event.target.tagName == 'IMG') {
			targetId = event.target.parentElement.parentElement.id;
		} else if (event.target.tagName == 'DIV') {
			targetId = event.target.parentElement.id;
		}
		switch(targetId) {
			case 'accelerateBtn':
				_this.myCommand.accelerate = false;
				_this.release('#' + targetId);
				_this.sendCommands();
				return;
			case 'brakeBtn':
				_this.myCommand.brake = false;
				_this.release('#' + targetId);
				_this.sendCommands();
				return;
			case 'turnRightBtn':
				_this.releaseDirections();
				return;
			case 'turnLeftBtn':
				_this.releaseDirections();
				return;
		}
	};

	this.bindEvents = function () {
		if (this.isWheel) {
			// add accelerometer events
			if (window.DeviceOrientationEvent) {
			    window.addEventListener('deviceorientation', function () {
			        _this.acceleroTurn(event.alpha);
			    }, true);
			} else if (window.DeviceMotionEvent) {
			    window.addEventListener('devicemotion', function () {
			        _this.acceleroTurn(event.acceleration.z * 2);
			    }, true);
			} else {
			    window.addEventListener('MozOrientation', function () {
			        _this.acceleroTurn(orientation.z * 50);
			    }, true);
			}
			$('#vroom').bind('touchstart', this.accelerate);
			$('#vroom').bind('touchend', function () {
					_this.release('#vroom');
					_this.myCommand.accelerate = false;
					_this.sendCommands();
			});
		} else {
			var el = $('.controls');
			el.bind("touchstart", this.dispatchEvent);
			el.bind("touchend", this.dispatchRelease);
			el.bind("touchcancel", this.dispatchRelease);
			el.bind("touchleave", this.dispatchRelease);
			el.bind("touchmove", this.dispatchEvent);
		}
	};

	this.acceleroTurn = function (angle) {
		if (angle) {
			if (this.baseAngle == null) {
				this.baseAngle = angle;
			}
			angle -= this.baseAngle;
			console.log(angle)
			if (this.myCommand.turnRight == false && angle > PHONEPAD_ACCELEROMETER_THRESHOLD && angle < 180) {
				console.log('right')
				this.turnRight();
			} else if (this.myCommand.turnLeft == false && (angle < 360 - PHONEPAD_ACCELEROMETER_THRESHOLD && angle > 180 || angle < - PHONEPAD_ACCELEROMETER_THRESHOLD)) {
				console.log('left')
				this.turnLeft();
			} else if (angle < PHONEPAD_ACCELEROMETER_THRESHOLD || angle > 360 - PHONEPAD_ACCELEROMETER_THRESHOLD) {
				console.log('release')
				this.releaseDirections();
			}
		}
	};

	this.turnLeft = function () {
		this.myCommand.turnLeft = true;
		this.myCommand.turnRight = false;
		this.sendCommands();

		if (!this.isWheel) {
			this.press('#turnLeftBtn');
			this.release('#turnRightBtn');
		}
	};

	this.turnRight = function () {
		this.myCommand.turnLeft = false;
		this.myCommand.turnRight = true;
		this.sendCommands();

		if (!this.isWheel) {
			this.press('#turnRightBtn');
			this.release('#turnLeftBtn');
		}
	};

	this.releaseDirections = function () {
		this.myCommand.turnRight = false;
		this.myCommand.turnLeft = false;
		this.sendCommands();

		if (!this.isWheel) {
			this.release('#turnLeftBtn');
			this.release('#turnRightBtn');
		}
	};

	this.accelerate = function () {
		if (!_this.isWheel) {
			_this.press('#accelerateBtn');
			_this.release('#brakeBtn');
		} else {
			_this.press('#vroom');
		}		
		_this.myCommand.accelerate = true;
		_this.myCommand.brake = false;
		_this.sendCommands();
	};

	this.brake = function () {
		this.myCommand.accelerate = false;
		this.myCommand.brake = true;
		this.sendCommands();

		if (!this.isWheel) {
			this.press('#brakeBtn');
			this.release('#accelerateBtn');
		}
	};

	this.press = function (buttonId) {
		$(buttonId).addClass('active');
	};

	this.release = function (buttonId) {
		$(buttonId).removeClass('active');
	};

	this.sendCommands = function () {
		console.log('PHONEPAD', 'sending commands...');
		sendCommands(this.myCommand);
	};

}
