module.exports = function(s,config,lang,app,io){
    const memoryCachedMonitorModes = {}
    s.onMonitorInit((initiator) => {
        console.log('onMonitorInit',initiator,'initiator')
    })
    s.onMonitorStart((monitorConfiguration) => {
        console.log('onMonitorStart',monitorConfiguration,'monitorConfiguration')
    })
    s.onMonitorPingFailed((monitorConfiguration) => {
        console.log('onMonitorPingFailed',monitorConfiguration,'monitorConfiguration')
    })
    s.onMonitorDied((monitorConfiguration) => {
        console.log('onMonitorDied',monitorConfiguration,'monitorConfiguration')
    })
    s.onMonitorSave((newMonitorConfiguration,formPosted,saveRequestResponse) => {
        // Let's make a simple cache to check if the monitor mode has been changed.
        const groupKey = newMonitorConfiguration.ke
        const monitorId = newMonitorConfiguration.mid
        const cachedMode = memoryCachedMonitorModes[groupKey + monitorId]
        if(cachedMode !== newMonitorConfiguration.mode){
            console.log(`Monitor Mode has Changed! Was ${cachedMode} and is now ${newMonitorConfiguration.mode}`)
        }
        memoryCachedMonitorModes[groupKey + monitorId] = newMonitorConfiguration.mode

        console.log('onMonitorSave',newMonitorConfiguration,'newMonitorConfiguration')
        console.log('onMonitorSave',formPosted,'formPosted')
        console.log('onMonitorSave',saveRequestResponse,'saveRequestResponse')
    })
    console.log('Loaded "customAutoLoad" Sample : onMonitorInit, onMonitorStart, onMonitorPingFailed, onMonitorDied, onMonitorSave')
}
