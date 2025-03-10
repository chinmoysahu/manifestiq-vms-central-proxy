module.exports = function(s, config, lang, app, io){
    s.onMasterSocketConnection(function(client){
        client.emit('s.tx', {
            f: 'changePageTitle',
            data: 'Shinobi Management by ManifestIQ'
        });
    });
};