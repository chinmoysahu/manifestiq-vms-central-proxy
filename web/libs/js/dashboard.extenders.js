window.dashboardEventHandlerActions = {}
function createEventHandler(eventName){
    window.dashboardEventHandlerActions[eventName] = []
    return window.dashboardEventHandlerActions[eventName];
}
function executeEventHandlers(eventName, args = []){
    // console.log('executeEventHandlers',eventName, dashboardEventHandlerActions[eventName].length, new Error())
    for(theAction of window.dashboardEventHandlerActions[eventName]){
        try{
            theAction(...args)
        }catch(err){
            console.log(err)
        }
    }
}
function addToEventHandler(eventName, theAction){
    if(!window.dashboardEventHandlerActions[eventName])createEventHandler(eventName);
    window.dashboardEventHandlerActions[eventName].push(theAction);
}
createEventHandler('onDashboardReady')
createEventHandler('onWebSocketEventFromShinobi')
// Shinobi Servers
createEventHandler('accountSettingsOnLoadFields')
createEventHandler('accountSettingsOnSaveFields')
createEventHandler('onServerConnect')
createEventHandler('onServerDisconnect')
