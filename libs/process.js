module.exports = function(process,dirname){
    process.on("uncaughtException", function(error) {
        console.error(error)
    })
    return {
        isWindows: (process.platform === 'win32' || process.platform === 'win64'),
        prettyPrint: function(obj){return JSON.stringify(obj,null,3)},
        mainDirectory: dirname
    }
}
