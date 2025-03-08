module.exports = function(s, io, app, config, lang, pageUtils){
    const {
        resetUserSession,
        getRequestSession,
        createUserSession,
        setPathAuthentication,
        destroyUserSession,
        destroyLastLoginCache,
        renderPage,
    } = pageUtils;
    // const { shinobiAPI, shinobiAction } = require('./shinobiUtils.js')(s, io, app, config, lang);

    app.get('/api/servers', setPathAuthentication, async function (req, res) {
        const user = req.user
        const response = { ok: false, servers: [] }
        if(user){
            response.ok = true;
            response.servers = s.connectedServers;
            const sessionId = user.sessionId
            await resetUserSession(sessionId, res)
        }
        res.json(response)
    });

};
