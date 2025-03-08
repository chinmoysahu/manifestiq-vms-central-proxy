module.exports = (s, io, app, config, lang, pageUtils) => {
    const {
        resetUserSession,
        getRequestSession,
        createUserSession,
        setPathAuthentication,
        destroyUserSession,
        destroyLastLoginCache,
    } = pageUtils;
    const {
        listPermissions,
        getPermissionSet,
        createPermissionSet,
        deletePermissionSet,
    } = require('../userPermissions.js');

    app.get('/api/permissions', setPathAuthentication, async function (req, res) {
        const user = req.user
        const response = { ok: true, permissions: [] }
        if(user){
            const sessionId = user.sessionId
            await resetUserSession(sessionId, res)
            response.permissions = await listPermissions()
        }
        res.json(response)
    });

    app.get('/api/permissions/get/:name', setPathAuthentication, async function (req, res) {
        const user = req.user
        let response = { ok: false }
        if(user){
            const name = req.params.name
            const sessionId = user.sessionId
            await resetUserSession(sessionId, res)
            response.permission = await getPermissionSet(name);
        }
        res.json(response)
    });

    app.post('/api/permissions/add', setPathAuthentication, async function (req, res) {
        const user = req.user
        let response = { ok: false }
        if(user){
            const permission = req.body
            const sessionId = user.sessionId
            await resetUserSession(sessionId, res)
            response = await createPermissionSet(permission);
        }
        res.json(response)
    });

    app.post('/api/permissions/delete', setPathAuthentication, async function (req, res) {
        const user = req.user
        let response = { ok: false }
        if(user){
            const name = req.body.name
            const sessionId = user.sessionId
            await resetUserSession(sessionId, res)
            response = await deletePermissionSet(name);
        }
        res.json(response)
    });
}
