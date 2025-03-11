module.exports = function(s, config, lang, app, io) {
    // Inject a new menu tab for "Servers"
    s.onBeforeUiGet(function(data){
        if (data.html) {
            data.html = data.html.replace(
                '<ul class="sidebar-menu">',
                `<ul class="sidebar-menu">
                 <li>
                     <a href="/servers">
                         <i class="fa fa-server"></i> <span>Servers</span>
                     </a>
                 </li>`
            );
        }
    });

    // Create a new route for "/servers"
    app.get('/servers', (req, res) => {
        res.send('<h1>Server Management</h1><p>Custom server management page.</p>');
    });
};
