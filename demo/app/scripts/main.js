// current connected players
var players = [];

$(function() {

	// get phone pad singleton instance
	var phonepad = Phonepad.getInstance();

	// gamepads may be not supported
	phonepad.on('padNotSupported', function (padType) {
		console.log(padType, 'not supported');
	});

	// when connected, display the gameId so that the phonepad players can connect to the game
	phonepad.on('connected', function (gameId) {
		$('#gameIds span').html(gameId);
	});

	// add new player
	phonepad.on('playerConnected', function (pId, padType) {
		if (players.indexOf(pId) == -1) {
			players.push(pId);
			updatePlayersLayout();
		}
	});

	// remove player when disconnected
	phonepad.on('playerDisconnected', function (pId) {
		var playerIndex = players.indexOf(pId);
		if (playerIndex >= 0) {
			players.splice(playerIndex, 1);
			updatePlayersLayout();
		}
	});

	// update controller when new commands are received
	phonepad.on('commandsReceived', function (commands) {
		updateController(commands);
	});

	// GO !
	phonepad.start();

});


/**
*		Show / hide controllers depending on the number of players connected
*/
function updatePlayersLayout() {
	$('.phonepad').removeClass('active');
	$('#pads > .phonepad:lt(' + players.length + ')').addClass('active');
}


/**
*		Update controllers as we receive updated commands
*/
function updateController(commands) {
	// get player's controller
	var controller = $('.phonepad:nth-child(' + (players.indexOf(commands.pId) + 1) + ')');

	$('div', controller).removeClass('active');

	if (commands.axes[0] == 1) {
		$('.axisS', controller).addClass('active');
	} else if (commands.axes[0] == -1) {
		$('.axisN', controller).addClass('active');
	}

	if (commands.axes[1] == 1) {
		$('.axisE', controller).addClass('active');
	} else if (commands.axes[1] == -1) {
		$('.axisW', controller).addClass('active');
	}

	if (commands.buttons[0].pressed) {
		$('.btnA', controller).addClass('active');
	} 

	if (commands.buttons[1].pressed) {
		$('.btnB', controller).addClass('active');
	}

	if (commands.buttons[2].pressed) {
		$('.btnX', controller).addClass('active');
	}

	if (commands.buttons[3].pressed) {
		$('.btnY', controller).addClass('active');
	} 
}
