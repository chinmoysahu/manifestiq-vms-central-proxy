var mainSocket = {}
var onInitWebsocketFunctions = []
function onInitWebsocket(theAction){
    onInitWebsocketFunctions.push(theAction)
}
var onWebSocketEventFunctions = []
function onWebSocketEvent(theAction){
    onWebSocketEventFunctions.push(theAction)
}
function sendToSocket(data){
    mainSocket.emit('f', data)
}
var queuedCallbacks = {}
function createWebsocket(){
    mainSocket = io({
        transports: ['websocket']
    });
    mainSocket.on('f',function (d){
        switch(d.f){
            case'connect_success':
                console.log('Authenticated to Websocket!')
                $.each(onInitWebsocketFunctions,function(n,theAction){
                    theAction(d)
                })
            break;
        }
        $.each(onWebSocketEventFunctions,function(n,theAction){
            theAction(d)
        })
    })
}
$(document).ready(function(){
    createWebsocket()
})
