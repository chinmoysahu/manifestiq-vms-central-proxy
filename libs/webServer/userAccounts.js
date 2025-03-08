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
        list,
        createNewUser,
        deleteUser
    } = require('../auth.js');

    app.get('/api/users', setPathAuthentication, async function (req, res) {
        const user = req.user
        const response = { ok: true, users: [] }
        if(user && !user.sub){
            const sessionId = user.sessionId
            await resetUserSession(sessionId, res)
            response.users = (await list()).filter(item => item.username !== user.username)
            response.users.forEach((aUser) => {
                delete(aUser.password)
            })
        }
        res.json(response)
    });

    app.post('/api/users/add', setPathAuthentication, async function (req, res) {
        const user = req.user
        let response = { ok: false }
        if(user && !user.sub){
            const username = req.body.username
            const password = req.body.password
            const permissionSet = req.body.permissionSet
            const params = req.body.params || {
                sub: !!permissionSet,
                permissionSet,
            };
            const sessionId = user.sessionId
            await resetUserSession(sessionId, res)
            response = await createNewUser(username, password, params);
        }
        res.json(response)
    });

    app.post('/api/users/delete', setPathAuthentication, async function (req, res) {
        const user = req.user
        let response = { ok: false }
        if(user && !user.sub){
            const username = req.body.username
            const sessionId = user.sessionId
            await resetUserSession(sessionId, res)
            response = await deleteUser(username);
        }
        res.json(response)
    });
}
