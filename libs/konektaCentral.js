module.exports = (s,config,app,io) => {
    // From Konekta Central
    // app.get('/servers', async (req, res) => {
    //     const sessionId = req.cookies.loggedInSession;
    //     const user = getSession(sessionId)
    //     if(user){
    //         closeJsonResponse(res,serversConnected)
    //     }else{
    //         closeJsonResponse(res,{})
    //     }
    // });
    //
    // app.get('/servers/:serverId/:action', async (req, res) => {
    //     const response = {ok: false}
    //     const serverId = req.params.serverId
    //     const action = req.params.action
    //     const serverObject = serversConnected[serverId]
    //     const sessionId = req.cookies.loggedInSession;
    //     const user = getSession(sessionId)
    //     if(serverObject && user){
    //         const callbackId = generateId(10)
    //         const actionData = {}
    //         switch(action){
    //             case'update':
    //                 response.ok = true
    //                 actionData.action = 'update'
    //             break;
    //             case'restart':
    //                 response.ok = true
    //                 actionData.action = 'restart'
    //             break;
    //         }
    //         actionData.rid = callbackId
    //         io.to(serverObject.cnid).emit('action',actionData)
    //     }
    //     closeJsonResponse(res,response)
    // });
    //
    // app.post('/servers/:serverId/update/config', async (req, res) => {
    //     const response = {ok: false}
    //     const serverId = req.params.serverId
    //     const serverObject = serversConnected[serverId]
    //     const sessionId = req.cookies.loggedInSession;
    //     const user = getSession(sessionId)
    //     if(user){
    //         response.ok = true
    //         const actionData = {}
    //         const callbackId = generateId(10)
    //         const jsonData = JSON.parse(req.query.config)
    //         actionData.newConfig = jsonData
    //         actionData.rid = callbackId
    //         setCallback(callbackId,(err,data) => {
    //             console.log('Configuration Updated!',serverId)
    //             response.ok = !err
    //             closeJsonResponse(res,response)
    //         })
    //         io.to(serverObject.cnid).emit('updateConfig',actionData)
    //     }
    // });

    io.on('connection', (socket) => {
        const clientIpAddress = getIpAddress(socket.request)
        const subscriptionId = socket.handshake.query.subscriptionId
        const serverConfig = JSON.parse(socket.handshake.query.config || '{}')
        const timeConnected = new Date()
        if(subscriptionId){
            console.log(`Konekta Server Connected!`,timeConnected,clientIpAddress,subscriptionId)
            const serverId = `${clientIpAddress}${subscriptionId}`
            if(!serversConnected[serverId])serversConnected[serverId] = {};
            const serverObject = serversConnected[serverId];
            serverObject.connected = true
            serverObject.id = subscriptionId
            serverObject.cnid = socket.id
            serverObject.ip = clientIpAddress
            serverObject.timeConnected = timeConnected
            serverObject.serverConfig = serverConfig
            serverObject.stats = {}
            socket.on('charts',(data) => {
                // const { time, cpu, ram, network, servers, users, statViewers } = data;
                serverObject.stats = Object.assign({},data)
                io.to('admin').emit('stats',{
                    serverId: serverId,
                    stats: data,
                })
            })
            socket.on('callback',(callbackData) => {
                executeCallback(callbackData)
            })
            socket.on('disconnect',(data) => {
                console.log(`Konekta Server Disconnected!`,new Date(),clientIpAddress,subscriptionId)
                delete(serversConnected[subscriptionId])
                io.to('admin').emit('serverChange',serverObject)
            })
        }else{
            console.log(`No subscriptionId`,clientIpAddress)
            setTimeout(() => {
                socket.disconnect()
            },1000 * 60 * 10)
        }
    });
}
