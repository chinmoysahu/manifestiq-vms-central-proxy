module.exports = function(s, config, lang, app, io){
    s.onBeforeUiGet(function(data){
        if (data.html) {
            data.html = data.html.replace("Shinobi Management by Shinobi Systems", "Shinobi Management by ManifestIQ");
        }
    });
};