module.exports = (s,io,app,config) => {
    function initiateServer(initData){}
    function initiateUser(initData){}
    io.on('connection', (cn) => {
        const req = cn.request;
        const query = req._query;
        const isServer = query.serverConnect == '1'
        const initiate = isServer ? initiateServer : initiateUser;
        if(isServer){
            cn.on('execute-stderr', function(data){
                io.to('admin').emit('execute-stderr', data)
            })
            cn.on('execute-stdout', function(data){
                io.to('admin').emit('execute-stdout', data)
            })
            cn.on('execute-response', function(data){
                io.to('admin').emit('execute-response', data)
            })
        }else{
            const user = getRequestSession(req)
            const isSuperUser = !!user.superUser;
            console.log('isSuperUser',isSuperUser)
            if(isSuperUser){
                cn.join('admin')
            }
            // cn.on('f', (data) => {
            //     switch(data.f){
            //         case'':
            //         break;
            //     }
            // })
        }
    })
}
