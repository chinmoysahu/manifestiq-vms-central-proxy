const pageUtils = require('./utils.js')
const {
    resetUserSession,
    getRequestSession,
    createUserSession,
    setPathAuthentication,
    destroyUserSession,
    destroyLastLoginCache,
    renderPage,
} = pageUtils;
const { login } = require('../auth.js');
const {
    listPermissions,
    getPermissionSet,
    createPermissionSet,
    deletePermissionSet,
} = require('../userPermissions.js');
module.exports = function(s, io, app, config, lang){

    app.get('/', setPathAuthentication, function (req, res) {
        const user = req.user;
        if(!user){
            renderPage(res, `pages/login`);
        }else{
            const permissions = getPermissionSet(user.permissionSet);
            renderPage(res, `pages/index`, { user, permissions, customAutoLoad: s.customAutoLoad });
        }
    });

    app.post('/', async function (req, res) {
        const user = getRequestSession(req)
        const code = req.body.code
        const choiceId = req.body.choiceId
        async function successfulLogin(foundUser){
            await createUserSession(foundUser, res)
            await resetUserSession(foundUser.sessionId, res)
            const permissions = getPermissionSet(foundUser.permissionSet);
            renderPage(res, `pages/index`, { user: foundUser, permissions, customAutoLoad: s.customAutoLoad });
        }
        if(user){
            await resetUserSession(user.sessionId, res)
            const permissions = getPermissionSet(user.permissionSet);
            renderPage(res, `pages/index`, { user, permissions, customAutoLoad: s.customAutoLoad });
        }else{
            const username = req.body.name
            const password = req.body.pass
            if(username && password){
                const loginResponse = await login(username, password)
                if(loginResponse.ok){
                    if(loginResponse.user){
                        await successfulLogin(loginResponse.user)
                    }else{
                        renderPage(res, `pages/login`);
                    }
                }else{
                    renderPage(res, `pages/login`);
                }
            }else{
                renderPage(res, `pages/login`);
            }
        }
    });

    app.get('/logout', setPathAuthentication, async function (req, res) {
        const user = getRequestSession(req)
        if(user){
            const sessionId = user.sessionId
            destroyUserSession(sessionId)
            destroyLastLoginCache(sessionId)
        }
        renderPage(res, `pages/login`);
    });

    require('../peer/webPaths.js')(s, io, app, config, lang, pageUtils)
    require('./userAccounts.js')(s, io, app, config, lang, pageUtils)
    require('./userPermissions.js')(s, io, app, config, lang, pageUtils)

};
