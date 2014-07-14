
/**
*		Generates a unique id (used for player id creation)
*/
function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-4xxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};


/**
*		Cookies generic accessors
*/
function setCookie(cookieName, cookieValue, expirationInMinutes) {
	var d = new Date();
	d.setTime(d.getTime() + expirationInMinutes * 60 * 1000);
	var expires = "expires=" + d.toGMTString();
	document.cookie = cookieName + "=" + cookieValue + "; " + expires;
}

function getCookie(cookieName) {
	var name = cookieName + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return null;
}


/**
*		Is WebRTC capable ?
*/
function isWebRTCCapable() {
	return !/iP(hone|od)/.test(window.navigator.userAgent);
}
