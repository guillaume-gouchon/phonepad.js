// load socket.io only if webRTC is not supported
if(!isWebRTCCapable()) {
  document.write('<script src="http://pad.gcorp.io/socket.io/socket.io.js"></script>');
}

$(function() {
	Phonepad.getInstance();
});
