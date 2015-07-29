'use strict';

/**
*   Connection Wrapper used for WebRTC and websockets connections.
*/
function Network() {

  var WEBRTC_SERVER_HOST = 'pad.gcorp.io';
  var WEBRTC_SERVER_PORT = 6060;
  var WEBRTC_SERVER_PATH = '';
  var WS_SERVER_URL = 'http://pad.gcorp.io';

  var webRTCPeer = null, webRTCConnection = null;

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
      webRTCPeer = new Peer(gameId, {host: WEBRTC_SERVER_HOST, port: WEBRTC_SERVER_PORT, path: WEBRTC_SERVER_PATH});
      webRTCPeer.on('connection', function (conn) {

        webRTCConnection = conn;

        // register message receiver
        webRTCConnection.on('data', function (data) {
          switch(data.type) {
            case 'pId':
              console.log('Receiving player id from webRTC...');
              var playerId = JSON.parse(data.content);
              webRTCConnection.pId = playerId;
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
        webRTCConnection.on('close', function () {
          console.log('A player has been disconnected', webRTCConnection.pId);
          // takes too much time to be fired...
          // callbacks.onPlayerDisconnected(conn.pId);
        });
      });

      // automatic reconnection to the server
      webRTCPeer.on('disconnected', function () {
        console.log('Reconnecting to WebRTC server...');
        connectWebRTC(gameId, callbacks);
      });
    } catch (e) {
      console.error(e);
    }
  };

  this.connect = function (callbacks) {
    connectWS(callbacks);
  };

}
