# phonepad.js : Add Gamepads and Phonepads support to your HTML5 game !

## Demo

Test it here : ***[Awesome Demo](http://phonepad.gouchon.com)***

## Setup

Phonepad.js is a library which allows you to add Gamepads and Phonepads suppport on your HTML5 game in the most easiest way ever :


1. install the lib via bower : `bower install --save phonepad.js`
2. add this to the end of your index.html :  
`<script src="bower_components/peerjs/peer.js"></script>` // used for WebRTC connections  
`<script src="bower_components/phonepad.js/dist/phonepad.min.js"></script>` // the library !  
`<script src="http://warnode.com:7070/socket.io/socket.io.js"></script>` // used for websockets connections  

3. initialize the lib and add some listeners :  
`var phonepad = Phonepad.getInstance();` // get instance of the Phonepad Singleton  
`phonepad.on('connected', function (gameId) { //TODO });` // lib is connected, display the gameId so that phonepad players can connect to the game !  
`phonepad.on('padNotSupported', function (padType) { //TODO });` // some types of pads can be not supported
`phonepad.on('playerConnected', function (playerId, padType) { //TODO });` // a player is connected  
`phonepad.on('playerDisconnected', function (playerId) { //TODO });` // a player is disconnected  
`phonepad.on('commandsReceived', function (commands) { //TODO });` // you just received some commands !  
`phonepad.start();`  // GO !  
***(Done !)***

***

### Use Gamepads
Gamepads support is using HTML5 GamePads API. Just plug in/out some USB Gamepads or connect Bluetooth ones !

***

### Use Phonepads
To use your phone as a Phonepad, go on ***[http://pad.gouchon.com](http://pad.gouchon.com)*** with your phone, and then join the game using the ***gameId*** displayed on the HTML5 game.  
Phonepad are connecting to the game using ***WebRTC*** if available (it uses ***[peer.js library](http://peerjs.com)***), or ***websockets*** if not.

## More

If you want to create your own implementation of phonepads or just dig out how it works, this repository also contains :

* the ***server source code***. It is used as a websockets bridge between the phonepads and the HTML5 game.
* the ***phonepad web-app***.
* the ***demo website*** which uses this library.



