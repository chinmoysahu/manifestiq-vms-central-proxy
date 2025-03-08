let config = {}
try{
    config = require(process.cwd() + '/conf.json')
}catch(err){
    if(err && err.toString().indexOf('Cannot find module') === -1){
        console.log(err.toString())
        console.log('Your conf.json syntax may be broken.')
    }
    console.log('Default configuration will be used.')
    config = {}
}
var defaultConfig = {
    webPanelPort: 8005,
    webPortForPeers: 8774,
    peerPort: 8663,
    timeZones: require('./timeZones.js'),
}
Object.keys(defaultConfig).forEach(function(configKey){
    if(config[configKey] === undefined)config[configKey] = defaultConfig[configKey]
})
module.exports = {
    config
}
