// load socket.io only if webRTC is not supported
if(!isWebRTCCapable()) {
  document.write('<script src="http://warnode.com:7070/socket.io/socket.io.js"></script>');
}

$(function() {
	Phonepad.getInstance();
});