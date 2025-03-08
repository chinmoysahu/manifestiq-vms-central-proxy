class superUserAPI {
    constructor(peerConnectKey, superApiKey) {
        this.peerConnectKey = peerConnectKey;
        this.superApiKey = superApiKey;
        this.origin = `${shinobiServerHost}`
        this.websocketPath = `/s/${peerConnectKey}/super/socket.io`
        this.apiBaseUrl = `${shinobiServerHost}/s/${peerConnectKey}`
    }

    buildApiPrefix(endpoint) {
        return `${this.apiBaseUrl}/super/${this.superApiKey}/${endpoint}`
    }

    createWebsocket(){
        const websocket = io(this.origin, { path: this.websocketPath, transports: ['websocket'] })
        websocket.on('connect', function(){
            websocket.emit('super', { f:'init', auth: this.superApiKey })
        });
        this.websocket = websocket;
        return websocket
    }

    destroyWebsocket(){
        this.websocket.disconnect()
        this.websocket = undefined;
    }

    setupSuperAPIs() {
        var _this = this;
        this.mountManager = new superUserMountManager(_this.peerConnectKey, _this.superApiKey);
    }

    getLogs(start, end, limit) {
        return new Promise((resolve) => {
            const url = `${this.buildApiPrefix('logs')}?start=${start}&end=${end}${limit ? `&limit=${limit}` : ''}`;
            $.getJSON(url, function(response){
                resolve(response.logs)
            });
        });
    }

    buildLogTableRow(item){
        var html = `<tr class="search-row">
            <td>
                ${item.time}
            </td>
            <td>
                ${item.info.type}
            </td>
            <td>
                <div class="pre-inline text-white mb-0">${jsonToHtmlBlock(safeJsonParse(item.info.msg))}</div>
            </td>
        </tr>`;
        return html;
    }

    deleteLogs() {
        return new Promise((resolve) => {
            $.getJSON(this.buildApiPrefix('logs/delete'), resolve);
        });
    }

    updateSystem() {
        return new Promise((resolve) => {
            $.getJSON(this.buildApiPrefix('system/update'), resolve);
        });
    }

    restartSystem(script) {
        return new Promise((resolve) => {
            $.getJSON(this.buildApiPrefix(`system/restart/${script}`), resolve);
        });
    }

    getSystemConfig() {
        return new Promise((resolve) => {
            $.getJSON(this.buildApiPrefix('system/configure'), resolve);
        });
    }

    modifySystemConfig(configData) {
        var _this = this;
        return new Promise((resolve) => {
            $.ajax({
                url: _this.buildApiPrefix('system/configure'),
                type: 'POST',
                data: JSON.stringify(configData),
                contentType: 'application/json',
                success: resolve
            });
        });
    }

    activateKey(subscriptionId) {
        var _this = this;
        return new Promise((resolve) => {
            $.ajax({
                url: _this.buildApiPrefix('system/activate'),
                type: 'POST',
                data: JSON.stringify({ subscriptionId }),
                contentType: 'application/json',
                success: resolve
            });
        });
    }

    getAccountsList(type) {
        return new Promise((resolve) => {
            const url = this.buildApiPrefix(`accounts/list${type ? '/' + type : ''}`);
            $.getJSON(url, resolve);
        });
    }

    exportSystem() {
        return new Promise((resolve) => {
            $.getJSON(this.buildApiPrefix(`export/system`), resolve);
        });
    }

    importSystem(database) {
        var _this = this;
        return new Promise((resolve) => {
            $.ajax({
                url: _this.buildApiPrefix('import/system'),
                type: 'POST',
                data: JSON.stringify({ database }),
                contentType: 'application/json',
                success: resolve
            });
        });
    }

    getSystemInfo() {
        return new Promise((resolve) => {
            $.getJSON(this.buildApiPrefix(`system/info`), resolve);
        });
    }
}
