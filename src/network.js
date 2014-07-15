'use strict';

/**
*   Connection Wrapper used for WebRTC and websockets connections.
*/
function Network() {

  var WEBRTC_SERVER_HOST = 'warnode.com';
  var WEBRTC_SERVER_PORT = 7071;
  var WEBRTC_SERVER_PATH = '/phonepad';
  var WS_SERVER_URL = 'http://warnode.com:7070';

  var connectWS = function (callbacks) {
    // connect websockets for non-webRTC clients
    var socket = io.connect(WS_SERVER_URL);
    socket.emit('newGame');
    socket.on('gameId', function (gameId) {
      console.log('Received gameId', gameId);
      connectWebRTC(gameId, callbacks);
      callbacks.onConnected(gameId);
    });

    socket.on('pId', function (pId) {
      console.log('Receiving player id from websockets...');
      callbacks.onPlayerConnected(pId, Phonepad.PAD_TYPES.phonepad);
    });

    socket.on('comm', function (commands) {
      console.log('Receiving commands from websockets...');
      callbacks.onCommandsReceived(commands);
    });

    socket.on('disconnect', function (pId) {
      console.log('A player has been disconnected', pId);
      // takes too much time to be fired...
      // callbacks.onPlayerDisconnected(pId);
    });
  };

  var connectWebRTC = function (gameId, callbacks) {
    // initalize webRTC connection
    try {
      var peer = new Peer(gameId, {host: WEBRTC_SERVER_HOST, port: WEBRTC_SERVER_PORT, path: WEBRTC_SERVER_PATH});
      peer.on('connection', function (conn) {

        // register message receiver
        conn.on('data', function (data) {
          switch(data.type) {
            case 'pId':
              console.log('Receiving player id from webRTC...');
              var playerId = JSON.parse(data.content);
              conn.pId = playerId;
              callbacks.onPlayerConnected(playerId, Phonepad.PAD_TYPES.phonepad);
              break;
            case 'comm':
              console.log('Receiving commands from webRTC...');
              var commands = JSON.parse(data.content);
              callbacks.onCommandsReceived(commands);
              break;
          }
        });

        // remove disconnected players
        conn.on('close', function () {
          console.log('A player has been disconnected', conn.pId);
          // takes too much time to be fired...
          // callbacks.onPlayerDisconnected(conn.pId);
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  this.connect = function (callbacks) {
    connectWS(callbacks);
  };

}
