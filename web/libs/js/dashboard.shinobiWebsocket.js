class shinobiWebSocket {
    constructor({ peerConnectKey, $user, groupKey, websocketQuery = {} }) {
        this.$user = $user;
        this.$user.ke = groupKey;
        this.peerConnectKey = peerConnectKey;
        this.hostname = `${shinobiServerHost}`;
        this.websocketPath = `/s/${peerConnectKey}/socket.io`;
        this.websocketQuery = websocketQuery;
        this.onInitWebsocketFunctions = [];
        this.onWebSocketEventFunctions = [];
        this.queuedCallbacks = {};
        this.io = {};
    }

    checkCorrectPathEnding(path) {
        return path.endsWith('/') ? path : path + '/';
    }

    create() {
        const _this = this;
        this.io = io(this.hostname, {
            path: _this.websocketPath,
            query: _this.websocketQuery,
            transports: ['websocket']
        });

        this.io.f = (data, callback) => {
            if (!data.ke)data.ke = _this.$user.ke;
            if (!data.uid)data.uid = _this.$user.uid;

            if (callback) {
                const callbackId = generateId();
                data.callbackId = callbackId;
                _this.queuedCallbacks[callbackId] = callback;
            }

            console.log('Sending Data', data);
            return _this.io.emit('f', data);
        };

        _this.f = _this.io.f;

        this.io.on('ping', () => {
            _this.io.emit('pong', { beat: 1 });
        });

        this.io.on('connect', () => {
            console.log('Connected to Websocket!', _this.peerConnectKey);
            _this.io.f({
                f: 'init',
                ke: _this.$user.ke,
                auth: _this.$user.auth,
                uid: _this.$user.uid,
            });
        });

        this.io.on('f', (d) => {
            switch (d.f) {
                case 'init_success':
                    console.log('Authenticated to Websocket!', _this.peerConnectKey);
                    onShinobiInitWebsocketFunctions.forEach((action) => {
                        action(d, _this.peerConnectKey)
                    });
                    break;
                case 'callback':
                    console.log('Callback from Websocket Request', _this.peerConnectKey, d);
                    if (this.queuedCallbacks[d.callbackId]) {
                        this.queuedCallbacks[d.callbackId](...d.args);
                        delete this.queuedCallbacks[d.callbackId];
                    }
                    break;
            }

            onShinobiWebSocketEventFunctions.forEach((action) => {
                action(d, _this.peerConnectKey)
            });
        });

        return this.io;
    }

    destroy() {
        this.io.disconnect()
        this.io = {}
    }

    async configureMonitor(monitorConfig){
        const _this = this;
        return new Promise((resolve) => {
            const monitorId = monitorConfig.mid;
            _this.f({
                f: 'addOrEditMonitor',
                mid: monitorId,
                form: monitorConfig,
            },function(response){
                resolve(response)
            });
        })
    }

    getMonitors(monitorId = '') {
        return new Promise((resolve) => {
            const _this = this;
            _this.f({
                f: 'getMonitors',
                mid: monitorId,
            },function(...args){
                console.log(args)
                // monitors = loadedShinobiAPI[_this.peerConnectKey].applyPeerConnectKeyToRows(monitors)
                resolve(args)
            });
        });
    }
}

var onShinobiInitWebsocketFunctions = []
function onShinobiInitWebsocket(theAction){
    onShinobiInitWebsocketFunctions.push(theAction)
}
var onShinobiWebSocketEventFunctions = []
function onShinobiWebSocketEvent(theAction){
    onShinobiWebSocketEventFunctions.push(theAction)
}
