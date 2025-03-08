const express = require('express')
const http = require('http')
const app = express()
const io = new (require('socket.io').Server)()
const bodyParser = require('body-parser')
const exec = require('child_process').exec
const cors = require('cors');
const ejs = require('ejs');
const cookieParser = require('cookie-parser')
module.exports = function(s,config,lang){
    const webPanelPort = config.webPanelPort || 80
    // HTTP Config
    app.use(cookieParser())
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cors());
    app.set('views', process.cwd() + '/web');
    app.set('view engine','ejs');
    app.use('/libs', express.static(process.cwd() + '/web/libs'))
    const server = http.createServer(app)
    server.listen(webPanelPort,null,function(){
        console.log(`Shinobi Management CENTRAL running on port ${webPanelPort}!`)
    })
    io.attach(server,{
        transports: ['websocket']
    })
    s.sendToConnectedClients = function(type, data){
        io.emit(type, data)
    }
    require('./webServer/paths.js')(s,io,app,config,lang)
    require('./webServer/savedIdentifiers.js')(s,io,app,config,lang)
    return { io, app }
}
