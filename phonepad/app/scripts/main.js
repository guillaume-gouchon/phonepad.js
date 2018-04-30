// load socket.io only if webRTC is not supported
if(!isWebRTCCapable()) {
  document.write('<script src="https://pad.gouchon.com/socket.io/socket.io.js"></script>');
}

$(function() {
	Phonepad.getInstance();
});

/**
* FULLSCREEN
*/
var isFullscreen = false;
function requestFullscreen () {
  if (isFullscreen) return;

  var element = document.body;

  var fullscreenchange = function (event) {
    if (!(document.fullscreenElement === element || document.mozFullscreenElement === element ||
      document.mozFullScreenElement === element || document.webkitFullscreenElement === element ||
      document.webkitfullscreenElement === element)) {
      // exiting fullscreen mode
      isFullscreen = false;
    } else {
      isFullscreen = true;
      screen.orientation.lock("landscape-primary");
    }
  }

  document.addEventListener('fullscreenchange', fullscreenchange, false);
  document.addEventListener('mozfullscreenchange', fullscreenchange, false);
  document.addEventListener('webkitfullscreenchange', fullscreenchange, false);

  // Ask the browser for fullscreen mode
  if (element.requestFullscreen) {
    // W3C standard
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    // Firefox 10+, Firefox for Android
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    // IE 11+
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
      // Safari 6+
      element.webkitRequestFullscreen();
    } else {
      // Chrome 20+, Opera 15+, Chrome for Android, Opera Mobile 16+
      element.webkitRequestFullscreen(element.ALLOW_KEYBOARD_INPUT);
    }
  } else if (element.webkitRequestFullScreen) {
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
      // Safari 5.1+
      element.webkitRequestFullScreen();
    } else {
      // Chrome 15+
      element.webkitRequestFullScreen(element.ALLOW_KEYBOARD_INPUT);
    }
  }
}
