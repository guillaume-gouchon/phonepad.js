/*! phonepad.js build: 0.1.3. MIT Licensed. Copyright(c) 2014 Guillaume Gouchon <guillaume.gouchon@gmail.com> */
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
        if (rawGamepad != null && i >= 0) {
          for (var j in prevGamepadTypes) {
            if (rawGamepad.id === prevGamepadTypes[j]) {
              continue loopGamepads;
            }
          }
          prevGamepadTypes.push(rawGamepad.id);
          addPlayer(rawGamepad);
        }
      }

      gamepads = [];
      for (var l in rawGamepads) {
        var rawGamepad = rawGamepads[l];
        if (rawGamepad != null && l >= 0) {
          rawGamepad.pId = rawGamepad.id;
          gamepads.push(rawGamepad);
          callbacks.onCommandsReceived(rawGamepad);
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
    callbacks.onPlayerDisconnected(gamepad.id);
  };

}

'use strict';

/**
*   Connection Wrapper used for WebRTC and websockets connections.
*/
function Network() {

  var WEBRTC_SERVER_HOST = 'pad.gouchon.com';
  var WEBRTC_SERVER_PORT = 6060;
  var WEBRTC_SERVER_PATH = '';
  var WS_SERVER_URL = 'https://pad.gouchon.com';

  var webRTCPeer = null, webRTCConnection = null;

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
      
      // takes too much time to be fired...
      // callbacks.onPlayerDisconnected(pId);
    });
  };

  var connectWebRTC = function (gameId, callbacks) {
    // initalize webRTC connection
    try {
      webRTCPeer = new Peer(gameId, {host: WEBRTC_SERVER_HOST, port: WEBRTC_SERVER_PORT, path: WEBRTC_SERVER_PATH});
      webRTCPeer.on('connection', function (conn) {

        webRTCConnection = conn;

        // register message receiver
        webRTCConnection.on('data', function (data) {
          switch(data.type) {
            case 'pId':
              
              var playerId = JSON.parse(data.content);
              webRTCConnection.pId = playerId;
              callbacks.onPlayerConnected(playerId, Phonepad.PAD_TYPES.phonepad);
              break;
            case 'comm':
              
              var commands = JSON.parse(data.content);
              callbacks.onCommandsReceived(commands);
              break;
          }
        });

        // remove disconnected players
        webRTCConnection.on('close', function () {
          
          // takes too much time to be fired...
          // callbacks.onPlayerDisconnected(conn.pId);
        });
      });

      // automatic reconnection to the server
      webRTCPeer.on('disconnected', function () {
        
        connectWebRTC(gameId, callbacks);
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
    if (callbacks.padNotSupported != null) {
      callbacks.padNotSupported(padType);
    }
  };

  this.onConnected = function (gameId) {
    if (callbacks.connected != null) {
      callbacks.connected(gameId);
    }
  };

  this.onPlayerConnected = function (playerId, padType) {
    if (callbacks.playerConnected != null) {
      callbacks.playerConnected(playerId, padType);
    }
  };

  this.onPlayerDisconnected = function (playerId) {
    if (callbacks.playerDisconnected != null) {
      callbacks.playerDisconnected(playerId);
    }
  };

  this.onCommandsReceived = function (commands) {
    if (callbacks.commandsReceived != null) {
      callbacks.commandsReceived(commands);
    }
  };

  this.setListener = function (type, callback) {
    if (type in callbacks) {
      callbacks[type] = callback;
    }
  };

}
