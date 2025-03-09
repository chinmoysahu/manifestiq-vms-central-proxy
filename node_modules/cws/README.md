# cws

Cross-platform interface for websockets

## Install

```bash
npm install --save cws
```

## API

For node usage, look at the [ws package][ws] as that's what's returned.

[src/browser.js](src/browser.js) can either be loaded directly or you can
require the module through [browserify][browserify]. Creating a server is not
supported in the browser. Arguments to the constructor are passed directly to
[WebSocket][websocket] & this module wraps around it to provide a node-style
api.

## Browser

```js
const CWS = require('cws');
// or use window.CWS

// Connect to a server
const ws = CWS('ws://server/path', /* protocols, */ options);

// Checking the current state
console.log('readyState:', ws.readyState);

// Pass errors to the console
ws.on('error', e => {
  console.error(e);
});

// Notify console of closure
ws.on('close', e => {
  console.log('The websocket was closed');
});

// Listen for messages & log them
ws.on('message', message => {
  if ('string' !== typeof message) throw Error("Message could not be decoded");
  const received = JSON.parse(message);
  console.log('Message received:', received);
});

// Wait for the socket to open
ws.on('open', () => {

  // Say hi
  ws.send(JSON.stringify({
    type: 'Greeting',
    data: 'Hello World',
  });

  // Close the socket after 5 seconds
  setTimeout(() => {
    ws.close();
  }, 5000);
});
```

[browserify]: https://npmjs.com/package/browserify
[ws]: https://npmjs.com/package/ws
[websocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
