const {
    getRequestSession,
    setPathAuthentication,
} = require('./utils.js');
const {
    list,
    overwrite,
    add,
    get,
    remove,
} = require('../peer/savedIdentifiers.js');
module.exports = (s,config,app,io,lang) => {
    app.get('/serverCredentials/list', setPathAuthentication, async function (req, res) {
        let response = { ok: false, list: [] }
        const user = getRequestSession(req)
        if(user){
            response = await list();
        }
        res.json(response);
    });

    app.post('/serverCredentials/add', setPathAuthentication, async function (req, res) {
        let response = { ok: false }
        const user = getRequestSession(req)
        if(user){
            const serverInfo = req.body;
            const peerConnectKey = serverInfo.peerConnectKey;
            if(peerConnectKey){
                response = await add(serverInfo);
            }else{
                response.error = 'No Peer Connect Key'
            }
        }
        res.json(response);
    });

    app.post('/serverCredentials/remove', setPathAuthentication, async function (req, res) {
        let response = { ok: false }
        const user = getRequestSession(req)
        if(user){
            const { peerConnectKey } = req.body;
            response = await remove(peerConnectKey);
        }
        res.json(response);
    });

    app.get('/serverCredentials/get/:peerConnectKey', setPathAuthentication, async function (req, res) {
        let response = { ok: false }
        const user = getRequestSession(req)
        if(user){
            const { peerConnectKey } = req.params;
            response = await get(peerConnectKey);
        }
        res.json(response);
    });
}
