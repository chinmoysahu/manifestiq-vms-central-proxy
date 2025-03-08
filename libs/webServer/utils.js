let userSessions = {}
const userSessionsTimeouts = {}
const fs = require('fs').promises
const { config } = require('../config.js')
const lang = require('../language.js')(config)
const pageLayouts = require('../pageLayouts.js')
const fieldBuild = require('./fieldBuild.js');
const { generateId } = require('../commonUtils.js')
const webSessionsPath = `${process.cwd()}/webSessions.json`
const lastLoginSessionIds = {}
process.on("SIGINT", function(code) {
    writeWebSessions()
    process.exit();
});
process.nextTick(() => {
    loadPreviousWebSessions()
});
function getIpAddress(req){
    return (req.ip || req.headers['cf-connecting-ip'] ||
        req.headers["CF-Connecting-IP"] ||
        req.headers["'x-forwarded-for"] ||
        req.connection.remoteAddress).replace('::ffff:','');
}
async function loadPreviousWebSessions(){
    try{
        userSessions = JSON.parse(await fs.readFile(webSessionsPath, 'utf8'))
        console.log(`Loading Web Sessions.`)
    }catch(err){
    }
}
async function writeWebSessions(){
    console.log(`Writing Web Sessions for next restart.`)
    await fs.writeFile(webSessionsPath, JSON.stringify(userSessions))
}
function parseCookies(req){
    const cookieHeader = req.headers.cookie;
    const cookies = {}
    if (cookieHeader) {
        cookieHeader.split(';').forEach(item => {
            const parts = item.trim().split('=');
            cookies[parts[0]] = parts[1]
        });
    }
    return cookies
}
async function setPathAuthentication(req, res, next){
    const user = getRequestSession(req)
    if(user){
        req.user = user
        await resetUserSession(user.sessionId, res)
        return refreshSessionByRequest(req, res, next)
    }else{
        return renderPage(res, `pages/login`);
    }
}
function getRequestSession(req){
    if(!req.query && !req.cookies)return null;
    const sessionId = req.cookies.shinobiMgmtSession || req.query.sessionId;
    const user = userSessions[sessionId] || lastLoginSessionIds[sessionId];
    return user;
}
function refreshSessionByRequest(req, res, next){
    const sessionId = req.cookies.shinobiMgmtSession || req.query.sessionId;
    const user = userSessions[sessionId]
    if(user){
        resetUserSession(sessionId, res)
    }
    next()
}
function resetUserSession(sessionId, res){
    if(res)res.cookie('shinobiMgmtSession',sessionId, { maxAge: 900000, httpOnly: true });
    clearTimeout(userSessionsTimeouts[sessionId])
    userSessionsTimeouts[sessionId] = setTimeout(function(){
        delete(userSessions[sessionId])
    }, 1000 * 60 * 60)
}
function destroyUserSession(sessionId){
    clearTimeout(userSessionsTimeouts[sessionId])
    delete(userSessions[sessionId])
}
function destroyLastLoginCache(sessionId){
    delete(lastLoginSessionIds[sessionId])
}
function createUserSession(user, res){
    if(!user.sessionId)user.sessionId = generateId(40)
    const sessionId = user.sessionId;
    userSessions[sessionId] = Object.assign(userSessions[sessionId] || {},user)
    if(res)res.cookie('shinobiMgmtSession',sessionId, { maxAge: 900000, httpOnly: true });
    lastLoginSessionIds[sessionId] = user;
    return sessionId
}
function renderPage(res, pageEjs, morePassed = {}){
    const alwaysPassed = {
        lang,
        config,
        pageLayouts,
        fieldBuild,
    }
    res.render(pageEjs, Object.assign(alwaysPassed, morePassed))
}
module.exports = {
    getIpAddress,
    getRequestSession,
    resetUserSession,
    createUserSession,
    destroyUserSession,
    setPathAuthentication,
    refreshSessionByRequest,
    destroyLastLoginCache,
    parseCookies,
    renderPage,
}
