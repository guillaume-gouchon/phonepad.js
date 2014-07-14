/*! phonepad.js build: 0.0.1. MIT Licensed. Copyright(c) 2014 Guillaume Gouchon <guillaume.gouchon@gmail.com> */
'use strict';

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

  var pollGamepads = function () {
    var rawGamepads = (navigator.getGamepads && navigator.getGamepads()) ||
      (navigator.webkitGetGamepads && navigator.webkitGetGamepads());

    if (rawGamepads) {
      // remove the gamepads which left
      loopPrevPads:
      for (var i in prevRawGamepadTypes) {
        var prevRawGamepadType = prevRawGamepadTypes[i];
        for (var j in rawGamepads) {
          if (prevRawGamepadType === rawGamepads[j].id) {
            continue loopPrevPads;
          }
        }
        delete prevRawGamepadTypes[i];
        removePlayer(gamepads[i]);
      }

      gamepads = [];
      var gamepadsChanged = false;

      for (var k = 0; k < rawGamepads.length; k++) {
        if (rawGamepads[k] !== null && rawGamepads[k].id !== prevRawGamepadTypes[k]) {
          gamepadsChanged = true;
          prevRawGamepadTypes[k] = rawGamepads[k].id;
        }

        if (rawGamepads[k]) {
          gamepads.push(rawGamepads[k]);
        }
      }

      if (gamepadsChanged) {
        // add new gamepads
        for (var l in gamepads) {
          callbacks.onCommandsReceived(gamepads[l]);
        }
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
  };

}

'use strict';

/**
*   Connection Wrapper used for WebRTC and websockets connections.
*/
function Network() {

  var PEER_API_KEY = '609xv5np9cu15rk9';
  var WS_SERVER_URL = 'http://warnode.com:7070';

  var connectWS = function (callbacks) {
    // connect websockets for non-webRTC clients
    var socket = io.connect(WS_SERVER_URL);
    socket.emit('newGame');
    socket.on('gameId', function (gameId) {
      
      connectWebRTC(gameId, callbacks);
      callbacks.onConnected(gameId);
    });

    socket.on('pId', function (pId) {
      
      callbacks.onPlayerConnected(pId, Phonepad.PAD_TYPES.phonepad);
    });

    socket.on('comm', function (commands) {
      
      callbacks.onCommandsReceived(commands);
    });

    socket.on('disconnect', function (pId) {
      
      callbacks.onPlayerDisconnected(pId);
    });
  };

  var connectWebRTC = function (gameId, callbacks) {
    // initalize webRTC connection
    try {
      var peer = new Peer(gameId, { key: PEER_API_KEY });
      peer.on('connection', function (conn) {

        // register message receiver
        conn.on('data', function (data) {
          switch(data.type) {
            case 'pId':
              
              var playerId = JSON.parse(data.content);
              conn.pId = playerId;
              callbacks.onPlayerConnected(playerId, Phonepad.PAD_TYPES.phonepad);
              break;
            case 'comm':
              
              var commands = JSON.parse(data.content);
              callbacks.onCommandsReceived(commands);
              break;
          }
        });

        // remove disconnected players
        conn.on('close', function () {
          
          callbacks.onPlayerDisconnected(conn.pId);
        });
      });
    } catch (e) {
      
    }
  };

  this.connect = function (callbacks) {
    connectWS(callbacks);
  };

}

'use strict';

/**
*   Phonepad Singleton
*/
var Phonepad = (function () {

  // Instance stores a reference to the Singleton
  var instance;

  function init(options) {
    
    /**
    *   PRIVATE
    */
    var phonepadCallbacks = new PhonepadCallbacks();
    var networkClient = new Network();
    var gamepadHelper = new GamepadHelper();

    return {
 
      /**
      *   PUBLIC
      */
      on: function (callbackType, callback) {
        phonepadCallbacks.setListener(callbackType, callback);
      },

      start: function () {
        networkClient.connect(phonepadCallbacks);
        gamepadHelper.init(phonepadCallbacks);
      }

    };
 
  }
 
  return {
 
    // Get the Singleton instance if one exists or create one if it doesn't
    getInstance: function (options) {
      if ( !instance ) {
        instance = init(options);
      }
      return instance;
    }
 
  };
 
})();

Phonepad.PAD_TYPES = {
  gamepad: 0,
  phonepad: 1
};

'use strict';

function PhonepadCallbacks() {

  var callbacks = {
    padNotSupported: null,
    connected: null,
    playerConnected: null,
    playerDisconnected: null,
    commandsReceived: null
  };

  this.onPadNotSupported = function (padType) {
    if (callbacks.padNotSupported !== null) {
      callbacks.padNotSupported(padType);
    }
  };

  this.onConnected = function (gameId) {
    if (callbacks.connected !== null) {
      callbacks.connected(gameId);
    }
  };

  this.onPlayerConnected = function (playerId, padType) {
    if (callbacks.playerConnected !== null) {
      callbacks.playerConnected(playerId, padType);
    }
  };

  this.onPlayerDisconnected = function (playerId) {
    if (callbacks.playerDisconnected !== null) {
      callbacks.playerDisconnected(playerId);
    }
  };

  this.onCommandsReceived = function (commands) {
    if (callbacks.commandsReceived !== null) {
      callbacks.commandsReceived(commands);
    }
  };

  this.setListener = function (type, callback) {
    if (type in callbacks) {
      callbacks[type] = callback;
    }
  };

}
