'use strict';

function GamepadHelper () {

  var pinging = false;
  var prevGamepadTypes = [];
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

  var pollGamepads = function () {
    var rawGamepads = (navigator.getGamepads && navigator.getGamepads()) ||
      (navigator.webkitGetGamepads && navigator.webkitGetGamepads());

    if (rawGamepads) {
      // remove disconnected gamepads
      loopPrevPads:
      for (var i in prevGamepadTypes) {
        var prevGamepadType = prevGamepadTypes[i];
        for (var j in rawGamepads) {
          if (prevGamepadType === rawGamepads[j].id) {
            continue loopPrevPads;
          }
        }
        prevGamepadTypes.splice(i, 1);
        removePlayer(gamepads[i]);
      }

      // add new gamepads
      loopGamepads:
      for (var i in rawGamepads) {
        var rawGamepad = rawGamepads[i];
        for (var j in prevGamepadTypes) {
          if (rawGamepad.id === prevGamepadTypes[j]) {
            continue loopGamepads;
          }
        }
        prevGamepadTypes.push(rawGamepad.id);
        addPlayer(rawGamepad);
      }

      gamepads = rawGamepads;
      for (var l in gamepads) {
        callbacks.onCommandsReceived(gamepads[l]);
      }
    }
  };

  var onGamepadConnect = function (event) {
    addPlayer(event.gamepad);
    startPolling();
  };

  var onGamepadDisconnect = function (event) {
    for (var i in gamepads) {
      if (gamepads[i].index === event.gamepad.index) {
        console.log('GAMEPAD', 'Gamepad disconnected');
        removePlayer(event.gamepad);
        break;
      }
    }

    if (gamepads.length === 0) {
      stopPolling();
    }
  };

  var addPlayer = function (newGamepad) {
    gamepads.push(newGamepad);
    callbacks.onPlayerConnected(newGamepad.id, Phonepad.PAD_TYPES.gamepad);
  };

  var removePlayer = function (gamepad) {
    gamepads.splice(gamepad.index, 1);
    callbacks.onPlayerDisconnected(newGamepad.id);
  };

}
