$(document).ready(function(){
    var selectedApiKey = null;
    var theBlock = $('#tab-monitorsList')
    var theList = $('#monitorsListRows tbody')
    var apiKeySelector = $('#multi_mon_api_key_selector')
    var multiMonitorSelect = $('#multimon_select_all')
    var renewListTimeout = {};
    function drawRowToList(row){
        const monitorId = row.mid;
        const peerConnectKey = row.peerConnectKey;
        const shinobiServer = loadedShinobiAPI[peerConnectKey];
        const iconPath = shinobiServer.getMonitorIconPath(monitorId);
        theList.append(`
            <tr data-mid="${row.mid}" data-ke="${row.ke}" data-peerconnectkey="${peerConnectKey}" class="search-row">
                <td><input class="monitor-list-select form-check-input no-abs m-0" type="checkbox" value="${row.mid}" name="${row.peerConnectKey}__${row.ke}__${row.mid}"></td>
                <td><div class="video-thumbnail cursor-pointer launch-live-grid-monitor"><img src="${iconPath}"></div></td>
                <td>
                    <div>${row.name}</div>
                    <div><small>${row.mid}</small></div>
                    <div><b>${getServerName(peerConnectKey)}</b></div>
                </td>
                <td style="display:none">
                    <div>${peerConnectKey}</div>
                    <div>${row.mode}</div>
                    <div>${row.details.auto_host}</div>
                    <div>${row.details.stream_type}</div>
                </td>
                <td>
                    <span class="monitor_status_icon" style="color:${monitorStatusCodes[`c${row.code}`]}"><i class="fa fa-${monitorStatusCodes[`i${row.code}`]}"></i></span>
                    <span class="monitor_status">${monitorStatusCodes[row.code]}</span>
                </td>
                <td>
                    ${(row.tags || '').split(',').map(item => `<span class="badge badge-success">${item}</span>`).join(' ')}
                </td>
                <td class="text-end">
                    <a class="btn btn-sm btn-primary open-monitor-settings" title="${lang['Edit']}"><i class="fa fa-wrench"></i></a>
                    <a class="btn btn-sm btn-primary copy-stream-url" title="${lang['Copy Stream URL']}"><i class="fa fa-copy"></i></a>
                    <a class="btn btn-sm btn-info export" title="${lang.Export}"><i class="fa fa-download"></i></a>
                    <a class="btn btn-sm btn-danger delete" title="${lang.Delete}"><i class="fa fa-trash-o"></i></a>
                </td>
            </tr>
        `);
        var peerConnectKeysList = theList.find('tr:last .monitor-list-set-server')
        drawPeerConnectKeysToSelector(peerConnectKeysList,null,null,peerConnectKey)
    }
    function loadMonitorsFromMemory(onlyThisPeerConnectKey){
        if(onlyThisPeerConnectKey){
            theList.find(`[data-peerconnectkey="${onlyThisPeerConnectKey}"]`).remove();
        }else{
            theList.empty();
        }
        $.each(getLoadedMonitorsAlphabetically(onlyThisPeerConnectKey),function(n,row){
            drawRowToList(row)
        })
    }
    function getSelectedMonitors(rawMonitors){
        var monitorsSelected = [];
        theList.find('.monitor-list-select').each(function(n,v){
            var el = $(v)
            if(el.is(':checked')){
                const [ peerConnectKey, groupKey, monitorId ] = el.attr('name').split('__')
                const monitor = loadedShinobiAPI[peerConnectKey].loadedMonitors[monitorId]
                monitorsSelected.push(rawMonitors ? monitor : getDbColumnsForMonitor(monitor))
            }
        })
        return monitorsSelected;
    }
    function toggleMonitorListSelectAll(isChecked){
        var nameField = theList.find('input[type=checkbox][name]')
        if(isChecked === true){
            nameField.prop('checked',true)
        }else{
            nameField.prop('checked',false)
        }
    }

    async function drawMonitorsListApiKeyList(){
        const keysByServer = await getAllApiKeys(true)
        var html = ''
        console.log(keysByServer)
        $.each(keysByServer,function(peerConnectKey, serverKeys){
            const theServer = loadedShinobiAPI[peerConnectKey]
            html += `<optgroup label="${getServerName(peerConnectKey)}">`
                // html += `<option value="${theServer.$user.auth}">${lang['Session Key']}</option>`
                $.each(serverKeys || [],function(n, key){
                    html += createOptionHtml({
                        value: key.code,
                        label: key.code,
                    })
                })
            html += `</optgroup>`
        });
        apiKeySelector.html(html)
        console.log(html)
    }

    function correctDropdownPosition(dropdownElement){
        var p = dropdownElement.offset();
        if (p.top < 0){
            dropdownElement[0].style = `transform:translate(0px, ${-p.top + 20}px)!important;`
        }
    }

    function launchMoveMonitorWindow(){
        var monitorsToMove = getSelectedMonitors(true);
        var html = `${lang.MoveMonitorConfigurationText}
        <div style="margin-top: 15px;">
            <div class="form-group">
                <select class="form-control form-control-sm import-to-peer"></select>
            </div>
            <div>
                <ul>
                    ${monitorsToMove.map((monitor) => {
                        var peerConnectKey = monitor.peerConnectKey;
                        return `<li>${monitor.name} (${getServerName(peerConnectKey)})</li>`
                    }).join('\n')}
                </ul>
            </div>
        </div>`
        $.confirm.create({
            title: lang['Move Monitor Configuration'],
            body: html,
            clickOptions: [
                {
                    title: lang['Move'],
                    class: 'btn-primary',
                    callback: async function(){
                        var targetServerPeerConnectKey = $.confirm.e.find('.import-to-peer').val();
                        var shinobiServer = loadedShinobiAPI[targetServerPeerConnectKey];
                        var monitorsToDelete = monitorsToMove.filter(monitor => monitor.peerConnectKey !== targetServerPeerConnectKey);
                        var monitorsToMoveForDb = monitorsToDelete.map(monitor => getDbColumnsForMonitor(monitor));
                        await shinobiServer.importMonitor(monitorsToMoveForDb)
                        for(monitor of monitorsToDelete){
                            var sourcePeerConnectKey = monitor.peerConnectKey;
                            var sourceServer = loadedShinobiAPI[sourcePeerConnectKey];
                            await sourceServer.deleteMonitor(monitor.mid, true)
                        }
                        loadMonitorsFromMemory()
                    }
                },
            ],
        });
        var peerConnectKeysList = $.confirm.e.find('.import-to-peer');
        drawPeerConnectKeysToSelector(peerConnectKeysList,null,null);
    }
    function launchModeChangeMonitorWindow(){
        var monitorsToChange = getSelectedMonitors(true);
        var possibleModes = pageLayouts['Monitor Settings'].blocks.Identity.info[0].possible
        var html = `${lang.ChangeMonitorConfigurationText}
        <div style="margin-top: 15px;">
            <div class="form-group">
                <select class="form-control form-control-sm mode-change-value">
                    ${possibleModes.map(item => createOptionHtml(item))}
                </select>
            </div>
            <div>
                <ul>
                    ${monitorsToChange.map((monitor) => {
                        var peerConnectKey = monitor.peerConnectKey;
                        return `<li>${monitor.name} (${getServerName(peerConnectKey)})</li>`
                    }).join('\n')}
                </ul>
            </div>
        </div>`
        $.confirm.create({
            title: lang['Edit Mode'],
            body: html,
            clickOptions: [
                {
                    title: lang['Save'],
                    class: 'btn-success',
                    callback: async function(){
                        var targetMode = $.confirm.e.find('.mode-change-value').val();
                        for(monitor of monitorsToChange){
                            var peerConnectKey = monitor.peerConnectKey;
                            var shinobiServer = loadedShinobiAPI[peerConnectKey];
                            await shinobiServer.setMode(monitor.mid, targetMode)
                        }
                    }
                },
            ],
        });
    }
    function setModesForSelected(monitors){
        shinobiServer.setMode(monitorId, mode);
    }

    var monitorListMenuDropdownOpen = null
    var monitorListScrollTimeout = null
    theBlock.on('mouseup','[data-bs-toggle="dropdown"]',function(){
        var dropdownElement = $(this).next()
        monitorListMenuDropdownOpen = dropdownElement
        setTimeout(function(){
            correctDropdownPosition(dropdownElement)
        },500)
    })
    $('body')
    .on('click','[set-mode]',function(){
        var thisEl = $(this)
        var el = thisEl.parents('[data-mid]')
        var monitorId = el.attr('data-mid')
        var peerConnectKey = el.attr('data-peerconnectkey')
        var mode = thisEl.attr('set-mode')
        var shinobiServer = loadedShinobiAPI[peerConnectKey]
        shinobiServer.setMode(monitorId, mode);
    });
    theBlock
    .find('.export-selected-monitor-settings').click(function(){
        var monitorsSelected = getSelectedMonitors()
        if(monitorsSelected.length === 0){
            new PNotify({
                title: lang['No Monitors Selected'],
                type: 'error'
            });
            return
        }
        downloadMonitorConfigurationsToDisk(monitorsSelected)
    });
    theBlock
    .find('.delete-selected-monitor-settings').click(function(){
        var monitorsSelected = getSelectedMonitors(true)
        if(monitorsSelected.length === 0){
            new PNotify({
                title: lang['No Monitors Selected'],
                text: lang['Select atleast one monitor to delete'],
                type: 'error'
            });
            return
        }
        deleteSelectedMonitors(monitorsSelected)
    })
    theList
    .on('click','.copy-stream-url',function(e){
        e.preventDefault()
        const { monitorId, peerConnectKey } = getRowsMonitorId(this)
        const shinobiServer = loadedShinobiAPI[peerConnectKey];
        const href = shinobiServer.buildStreamUrl(monitorId);
        copyToClipboard(href);
        new PNotify({
            title: lang['Copied'],
            text: lang['Copied to Clipboard'],
            type: 'success'
        });
        return false
    })
    .on('click','.export',function(){
        const { monitorId, peerConnectKey } = getRowsMonitorId(this)
        const monitor = loadedShinobiAPI[peerConnectKey].loadedMonitors[monitorId];
        downloadMonitorConfigurationsToDisk([
            monitor
        ]);
    })
    .on('click','.delete',function(){
        const { monitorId, peerConnectKey, el } = getRowsMonitorId(this)
        const shinobiServer = loadedShinobiAPI[peerConnectKey];
        shinobiServer.deleteMonitorWithConfirm(monitorId, () => {
            el.remove();
        })
    });
    multiMonitorSelect.change(function(){
        var el = $(this);
        var isChecked = el.prop('checked')
        toggleMonitorListSelectAll(isChecked)
    })
    apiKeySelector.change(function(){
        var value = $(this).val()
        selectedApiKey = `${value}`
        loadMonitorsFromMemory()
        multiMonitorSelect.prop('checked',false)
    })
    theBlock.find('.import-monitor-settings').click(function(){
        launchImportMonitorWindow()
    });
    theBlock.find('.move-monitor-settings').click(function(){
        launchMoveMonitorWindow()
    });
    theBlock.find('.changeMode-monitor-settings').click(function(){
        launchModeChangeMonitorWindow()
    })
    addOnTabOpen('monitorsList', function () {
        loadMonitorsFromMemory()
        drawMonitorsListApiKeyList()
    })
    addOnTabReopen('monitorsList', function () {
        loadMonitorsFromMemory()
        drawMonitorsListApiKeyList()
    })
    onShinobiWebSocketEvent((data, peerConnectKey) => {
        switch(data.f){
            case'monitor_edit':
                clearTimeout(renewListTimeout[peerConnectKey])
                renewListTimeout[peerConnectKey] = setTimeout(() => {
                    if(tabTree.name === 'monitorsList'){
                        loadMonitorsFromMemory(peerConnectKey)
                    }
                },5000)
            break;
        }
    })
})
