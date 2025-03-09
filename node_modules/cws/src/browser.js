(() => {
  if ('object' !== typeof window) return; // Not running in a browser
  const WebSocket = window.WebSocket || false;
  if (!WebSocket) throw new Error('This browser does not support websockets');

  // Minimal event polyfill
  const EventEmitter = window.EventEmitter || function EventEmitter() {
    let listeners = {};
    this.emit = (event, data) => {
      (listeners[event]||[]).forEach(listener => listener(data));
    };
    this.on = (event, handler) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    };
  };

  // Our wrapper
  function CWS(address, protocols, options) {

    // protocols is optional
    if (('object'===typeof protocols)&&(!Array.isArray(protocols))) {
      options   = protocols;
      protocols = undefined;
    }

    // options = optional
    options = Object.assign({queue:true},options);

    // Initialize ws and response
    let ws     = new WebSocket(address, protocols);
    let out    = new EventEmitter();

    // readyState passthrough
    Object.defineProperty(out,'readyState',{
      configurable: false,
      enumerable  : true,
      get         : () => ws.readyState,
    });

    // Register event passthrough
    ws.onopen  = function (e) { out.emit('open' ,e); };
    ws.onclose = function (e) { out.emit('close',e); };
    ws.onerror = function (e) { out.emit('error',e); };

    // Message receiver
    ws.onmessage = async function (event) {
      let message = event.data;

      // Convert blob into string
      if (('function' === typeof Blob) && (message instanceof Blob)) {
        message = await message.text();
      }

      // Convert buffer into string
      if (('function' === typeof Buffer) && (message instanceof Buffer)) {
        message = message.toString();
      }

      out.emit('message', message);
    };

    // Message transmitter with queue
    out.queue = [];
    out.send  = function (chunk) {

      // Handle queue-less
      if (!options.queue) {
        ws.send(current);
        return out;
      }

      // Append message to queue
      out.queue.push(chunk);

      // Return if not ready
      if (ws.readyState !== 1) return;

      // Send while we have a queue
      let current = false;
      try {
        while (out.queue.length) {
          current = out.queue.shift();
          ws.send(current);
        }
      } catch (e) {
        if (current) out.queue.unshift(current);
      }
    };

    // Allow closing of the socket
    out.close = function() {

      // Closing or closed = done
      if (ws.readyState > 1) return;

      // Close the socket
      ws.close();
      return this;
    };

    return out;
  }

  // Browser export
  window.CWS = window.CWS || CWS;

  // Browserify/webpack
  if ('object' === typeof module) {
    module.exports = CWS;
  }

})();
