var players = [];

$(function() {

	var phonepad = Phonepad.getInstance();

	phonepad.on('padNotSupported', function (padType) {
		console.log(padType, 'not supported');
	});

	phonepad.on('connected', function (gameId) {
		$('#gameId').html(gameId);
	});

	phonepad.on('playerConnected', function (pId, padType) {
		if (players.indexOf(pId) == -1) {
			players.push(pId);
			updatePlayersLayout();
		}
	});

	phonepad.on('playerDisconnected', function (pId) {
		var playerIndex = players.indexOf(pId);
		if (playerIndex >= 0) {
			players.splice(playerIndex, 1);
			updatePlayersLayout();
		}
	});

	phonepad.on('commandsReceived', function (commands) {
		updateController(commands);
	});

	phonepad.start();
	
});

function updatePlayersLayout() {
	$('.phonepad').removeClass('active');
	$('#pads > .phonepad:lt(' + players.length + ')').addClass('active');
}

function updateController(commands) {
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
