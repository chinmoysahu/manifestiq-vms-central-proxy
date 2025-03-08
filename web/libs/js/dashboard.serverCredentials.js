$(document).ready(function(){
    var theWindow = $('#tab-serverCredentials')
    var drawContainer = $('#tab-serverCredentials-list')
    function convertMonitorsToTree(peerConnectKey){
        const shinobiServer = loadedShinobiAPI[peerConnectKey];
        const monitors = shinobiServer.loadedMonitors;
        const tags = getListOfTagsFromMonitors(monitors)
        const tree = { [lang['All Monitors']]: {} };
        function addMonitor(monitorId, monitor, tag){
            if(!monitorId || !monitor){
                console.log('monitorId',monitorId)
                return
            }
            const currentStatus = pageLayouts['Monitor Status Codes'][monitor.code];
            const canEdit = !isSubAccount || isSubAccount && (permissions.pages || []).indexOf('monitorSettings') > 1;
            const monitorOptions = {
                _liClass: 'search-row',
                [lang.Watch]: function(){
                    openLiveGridPage(monitorId, peerConnectKey)
                }
            }
            if(canEdit){
                monitorOptions[lang.Edit] = function(){
                    openMonitorEditorPage(monitorId, peerConnectKey)
                }
            }
            tree[tag][`<span data-mid="${monitorId}" data-ke="${monitor.ke}" data-peerconnectkey="${peerConnectKey}"><span class="monitor_status_icon" style="color:${monitorStatusCodes[`c${monitor.code}`]}"><i class="fa fa-${monitorStatusCodes[`i${monitor.code}`]}"></i></span> <span>${monitor.name} (${monitor.host})</span> <span class="monitor_status">${monitorStatusCodes[monitor.code]}</span></span>`] = monitorOptions;
        }
        $.each(monitors, function(monitorId, monitor){
            addMonitor(monitorId, monitor, lang['All Monitors'])
        });
        $.each(tags,function(tag, monitorsOfTag){
            if(!tree[tag])tree[tag] = {};
            $.each(monitorsOfTag, function(n, { monitorId }){
                addMonitor(monitorId, monitors[monitorId], tag)
            });
        });
        return tree;
    }
    async function drawServer(server){
        const peerConnectKey = server.peerConnectKey
        const existingElement = drawContainer.find(`[drawn-id="${peerConnectKey}"]`)
        if(existingElement.length === 0){
            const peerConnectionKeys = server.config.peerConnectionKeys || []
            const credentials = server.connectDetails;
            const shinobiServer = loadedShinobiAPI[peerConnectKey];
            const superUser = loadedSuperUsers[peerConnectKey];
            const { superApiKey, apiKey, groupKey } = loadedShinobiCredentials[peerConnectKey];
            const systemInfo = (await superUser.getSystemInfo()).info;
            const monitors = shinobiServer.loadedMonitors;
            const savedIdentifier = loadedIdentifiers[peerConnectKey];
            var html = `<div drawn-id="${peerConnectKey}" class="search-row">
                <div class="d-flex flex-row">
                    <div class="server-tree flex-grow-1"></div>
                    <div class="d-flex">
                        <div class="flex-grow-1"><input class="form-control form-control-sm mb-3 set-name" value="${savedIdentifier.name || ''}"></div>
                        <div class="pl-1"><a href="${shinobiServer.apiBaseUrl}/" target="_blank" class="btn d-block btn-sm btn-primary"><i class="fa fa-arrow-right"></i></a></div>
                        <div class="pl-1"><a class="btn d-block btn-sm btn-primary show-server-info show-server-pane"><i class="fa fa-server"></i></a></div>
                        <div class="pl-1"><a class="btn d-block btn-sm btn-danger disconnect-server"><i class="fa fa-trash-o"></i></a></div>
                    </div>
                </div>
            </div>`
            drawContainer.append(html)
            const treeName = `<span class="treeName">${savedIdentifier.name || peerConnectKey}</span>`;
            const theTreeData = {
                [treeName]: {
                    [lang.Monitors]: convertMonitorsToTree(peerConnectKey),
                    ...systemInfo,
                    [lang['Server Credentials']]: {
                        [`Connected at ${server.timeConnected}`]: null,
                        [lang['Group Key']]: groupKey,
                        [lang['API Key']]: apiKey,
                        [lang['Super API Key']]: superApiKey,
                    }
                }
            }
            Tree.generate(`[drawn-id="${peerConnectKey}"] .server-tree`, theTreeData, {
                openNodes: {
                    // [treeName]: {}
                }
            });
        }else{
            drawContainer.find('.timeConnected').text(server.timeConnected)
            // drawContainer.find('.server-tree').empty()
        }
    }
    function unloadServer({ peerConnectKey }){
        var existingElement = drawContainer.find(`[drawn-id="${peerConnectKey}"]`)
        existingElement.remove()
    }
    async function drawServerList(){
        for(serverKey in loadedServers){
            var server = loadedServers[serverKey]
            drawServer(server)
        }
    }
    theWindow.on('click','.restartUnitConnection',function(){
        var el = $(this);
        var parent = el.parents('[drawn-id]');
        var peerConnectKey = parent.attr('drawn-id')
        restartUnitConnection(peerConnectKey)
    })
    .on('click','.refresh-servers',function(){
        var el = $(this);
        drawContainer.empty();
        drawServerList();
    })
    drawContainer
    .on('change','.set-name', async function(){
        var el = $(this);
        var parent = el.parents('[drawn-id]');
        var peerConnectKey = parent.attr('drawn-id')
        const serverInfo = loadedIdentifiers[peerConnectKey];
        const newName = el.val();
        serverInfo.name = newName;
        const response = await setSavedIdentifier(serverInfo);
        console.log(response)
        if(response.ok === true){
            parent.find('.treeName').text(newName)
            $(`#indicator-bars-${peerConnectKey} .server-name`).text(newName)
        }
    })
    .on('click','.show-server-info', async function(){
        var el = $(this);
        var parent = el.parents('[drawn-id]');
        var peerConnectKey = parent.attr('drawn-id')
        showOnlyServerIndicatorBars(peerConnectKey)
    })
    .on('click','.disconnect-server', async function(){
        var el = $(this);
        var parent = el.parents('[drawn-id]');
        var peerConnectKey = parent.attr('drawn-id')
        const shinobiServer = loadedSuperUsers[peerConnectKey];
        const apiBaseUrl = shinobiServer.buildApiPrefix('mgmt/disconnect');
        $.confirm.create({
            title: lang["Remove Server"],
            body: lang.RemoveServerText,
            clickOptions: {
                title: '<i class="fa fa-trash-o"></i> ' + lang.Disconnect,
                class: 'btn-danger btn-sm'
            },
            clickCallback: function(){
                removeShinobiServer(apiBaseUrl, peerConnectKey)
            }
        });
    })
    addOnTabOpen('serverCredentials',function(){
        drawServerList()
    })
    // addOnTabReopen('serverCredentials',function(){
    //     drawServerList()
    // })
    addToEventHandler('onDashboardReady', function(){
        drawServerList()
    })
    addToEventHandler('onServerConnect', function(server){
        console.log('CONNECTED',server)
        drawServer(server)
    })
    addToEventHandler('onServerDisconnect', function(server){
        unloadServer(server)
    })
})
