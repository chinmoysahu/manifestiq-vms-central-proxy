const {
    mergeDeep,
} = require('./commonUtils.js')
const connectedUnits = {}
function getUnitConfiguration(peerConnectKey){
    return Object.assign({},connectedUnits[peerConnectKey].config)
}
function buildUnitConfiguration(peerConnectKey, configPartial){
    const currentConfig = getUnitConfiguration(peerConnectKey)
    const configToSet = mergeDeep(currentConfig, configPartial)
    return configToSet
}
function setUnitConfiguration(peerConnectKey, newConfig, worker){
    worker.postMessage({
        f: 'modifyConfiguration',
        peerConnectKey: peerConnectKey,
        data: {
            form: newConfig
        }
    })
}
function editUnitConfiguration(deviceConnectKey, newOptions, worker){
    delete(newOptions.peerConnectKey)
    delete(newOptions.shinobiHost)
    delete(newOptions.shinobiPeerPort)
    delete(newOptions.shinobiWebPort)
    const editedConfig = buildUnitConfiguration(deviceConnectKey, newOptions)
    setUnitConfiguration(deviceConnectKey, editedConfig, worker);
}
module.exports = {
    connectedUnits,
    editUnitConfiguration,
}
