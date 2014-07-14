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
