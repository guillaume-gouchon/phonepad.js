# Add Gamepads and Phonepads support to your HTML5 games !

## Demo

Test it here : ***[Awesome Demo](http://phonepad.gouchon.com)***  
Games which are using it : ***[Mychrome Machines](http://machines.gouchon.com)***  ***[Smash.js](http://smash.gouchon.com)***  

## Setup

Phonepad.js is a library which allows you to add Gamepads and Phonepads support to your HTML5 game in the easiest way ever :


1. install the lib via bower : `bower install --save phonepad.js`
2. add the scripts at the end of your index.html :  
`<script src="bower_components/peerjs/peer.js"></script>` // used for WebRTC connections  
`<script src="http://gcorp.io:7070/socket.io/socket.io.js"></script>` // used for websockets connections  
`<script src="bower_components/phonepad.js/dist/phonepad.js"></script>` // the library !  

3. initialize the lib and implement the callbacks :  
`var phonepad = Phonepad.getInstance();` // get instance of the Phonepad Singleton  
`phonepad.on('connected', function (gameId) { //TODO });` // lib is connected, display the gameId so that phonepad players can connect to the game !  
`phonepad.on('padNotSupported', function (gamepadType) { //TODO });` // some types of pads can be not supported
`phonepad.on('playerConnected', function (playerId, gamepadType) { //TODO });` // a player is connected  
`phonepad.on('playerDisconnected', function (playerId) { //TODO });` // a player is disconnected  
`phonepad.on('commandsReceived', function (commands) { //TODO });` // you just received some commands !  
`phonepad.start();` // GO !  
***(Done !)***

***

### Play with gamepads
Gamepads support is using HTML5 GamePads API. Just plug in/out some USB Gamepads or connect Bluetooth ones !

***

### Play with your phone
To use your phone as a Phonepad, go on ***[http://pad.gouchon.com](http://pad.gouchon.com)*** with your phone, and then join the game using the ***gameId*** displayed on the HTML5 game.  
Phonepads are being connected to the game using ***WebRTC*** if available, or ***websockets***.

## More

If you want to create your own implementation of phonepads or just dig out how it works, this repository also contains :

* the ***server source code***. It is used as a webRTC / websockets bridge between the phonepads and the HTML5 game, (it uses ***[the peer.js library](http://peerjs.com)***).
* the ***phonepad web-app***.
* the ***demo website*** which uses this library.



