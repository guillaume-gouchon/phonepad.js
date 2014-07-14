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
