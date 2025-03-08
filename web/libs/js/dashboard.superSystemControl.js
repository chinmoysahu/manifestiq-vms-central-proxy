$(document).ready(function(){
    var theEnclosure = $('#tab-superSystemControl')
    var logContainer = $('#logs-list')
    const peerConnectKeysList = theEnclosure.find('.peerConnectKeys_list')
    let superUser = null;
    async function drawSystemLogs(){
        logContainer.empty()
        const response = await superUser.getLogs()
        if(response.ok){
            $.each(response.logs.reverse(),function(n, item){
                drawLogRow(item)
            })
        }
    }
    async function drawSystemInfo(){
        const response = await superUser.getSystemInfo()
        if(response.ok){
            $('.super-system-info').html(jsonToHtmlBlock(response.info))
        }
    }
    function drawLogRow(item){
        if(!item.time)item.time = moment(d).format('YYYY-MM-DD HH:mm:ss')
        var html = `<div class="card bg-dark search-row mb-3">
            <div class="card-body d-flex flex-row flex-padding">
                <div>
                    <span title="${item.time}" class="livestamp"></span><br>
                    <small>${item.time}</small><br>
                    <small class="badge badge-primary">${item.mid}</small>
                </div>
                <div class="flex-grow-1">
                    <div class="pre-inline text-white mb-0">${jsonToHtmlBlock(item.info)}</div>
                </div>
            </div>
        </div>`
        logContainer.prepend(html)
    }
    async function unloadEnclosure(){
        if(superUser){
            superUser.destroyWebsocket();
        }
    }
    async function loadEnclosure(peerConnectKey){
        superUser = loadedSuperUsers[peerConnectKey];
        await drawSystemInfo();
        await drawSystemLogs();
        const websocket = superUser.createWebsocket();
        websocket.on('f',function(d){
            switch(d.f){
                case'log':
                    drawLogRow(d)
                break;
            }
        })
    }
    theEnclosure.find('[system]').click(function(e){
        switch($(this).attr('system')){
            case'deleteLogs':
                var html = 'Do you want to delete these logs? User logs will <b>not</b> be deleted.'
                $.confirm.create({
                    title: `${lang['Delete Logs']}`,
                    body: html,
                    clickOptions: {
                        class: 'btn-danger',
                        title: lang.Delete,
                    },
                    clickCallback: function(){
                        superUser.deleteLogs()
                        logContainer.empty()
                    }
                })
            break;
            case'update':
                var html = lang.updateNotice1
                $.confirm.create({
                    title: `${lang.Update} Shinobi?`,
                    body: html,
                    clickOptions: {
                        class: 'btn-danger',
                        title: lang.Update,
                    },
                    clickCallback: function(){
                        superUser.updateSystem()
                    }
                })
            break;
        }
    })
    theEnclosure.find('[restart]').click(function(e){
        var html = ''
        var target = $(this).attr('restart')
        switch(target){
            case'system':
                html += '<p>Do you want to restart the core (camera.js)? plugins will not be restarted. They will reconnect when Shinobi is back online.</p>'
            break;
            case'logs':
                html += '<p>Flush PM2 console logs? The logs saved in the database will <b>not</b> be deleted.</p>'
            break;
        }
        $.confirm.create({
            title: `${lang.Restart}?`,
            body: html,
            clickOptions: {
                class: 'btn-danger',
                title: lang.Restart,
            },
            clickCallback: function(){
                superUser.restartSystem(target)
            }
        })
    })
    peerConnectKeysList.change(function(){
        const peerConnectKey = $(this).val();
        loadEnclosure(peerConnectKey)
    })
    addOnTabOpen('superSystemControl', function () {
        const firstServer = drawPeerConnectKeysToSelector(peerConnectKeysList,null,null)
        loadEnclosure(firstServer)
    })
    addOnTabReopen('superSystemControl', function () {
        var theSelectedServer = `${peerConnectKeysList.val()}`
        drawPeerConnectKeysToSelector(peerConnectKeysList,null,null)
        peerConnectKeysList.val(theSelectedServer)
        loadEnclosure(theSelectedServer)
    })
    addOnTabAway('superSystemControl', async function(){
        await unloadEnclosure();
    })
})
