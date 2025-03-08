var monitorLogStreamElement = $(`#tab-monitorSettings .logs`);
var logWriterIconIndicator = $('#side-menu-link-logViewer i')
var logWriterIconIndicatorShaking = false
var logWriterIconIndicatorTimeout = null
function shakeLogWriterIcon(){
    if(logWriterIconIndicatorShaking)return;
    logWriterIconIndicatorShaking = true;
    logWriterIconIndicator.addClass('animate-shake')
    logWriterIconIndicatorTimeout = setTimeout(function(){
        logWriterIconIndicatorShaking = false;
        logWriterIconIndicator.removeClass('animate-shake')
    },3000)
}
$(document).ready(function(e){
    var theWindow = $('#tab-logs')
    var peerConnectKeysList = theWindow.find('.peerConnectKeys_list')
    var logTypeSelector = $('#log_monitors')
    var monitorsList = logTypeSelector.find('optgroup');
    var dateSelector = $('#logs_daterange')
    var savedLogRows = $('#saved-logs-rows')
    var globalLogStream = $('#global-log-stream')
    var theForm = theWindow.find('form')
    //log viewer
    function getSelectedPeerConnectKey(){
        const peerConnectKey = peerConnectKeysList.val()
        const shinobiServer = loadedShinobiAPI[peerConnectKey]
        const loadedMonitors = shinobiServer.loadedMonitors
        const superUser = loadedSuperUsers[peerConnectKey]
        return { peerConnectKey, shinobiServer, loadedMonitors, superUser }
    }
    function getApiPrefix(target){
        const { shinobiServer } = getSelectedPeerConnectKey()
        return shinobiServer.buildApiPrefix(target)
    }
    function setLogStreamElements(monitorId, peerConnectKey){
        const shinobiServer = loadedShinobiAPI[peerConnectKey]
        shinobiServer.logStreams[monitorId] = $(`.logViewerStream[data-mid="${monitorId}"][data-peerconnectkey="${peerConnectKey}"],.monitor_item[data-mid="${monitorId}"][data-peerconnectkey="${peerConnectKey}"] .logs:visible`)
        shinobiServer.logStreamWiggler[monitorId] = $(`#logViewerStreamContainer_${monitorId}_${peerConnectKey} .fa-exclamation-triangle`)
        shinobiServer.logStreamLastTimeEl[monitorId] = $(`#logViewerStreamContainer_${monitorId}_${peerConnectKey} .lastlogtime`)
    }
    function drawMonitorContainer(monitor, peerConnectKey){
        const groupKey = monitor.ke
        const monitorId = monitor.mid
        const notExist = $(`#logViewerStreamContainer_${monitorId}_${peerConnectKey}`).length === 0;
        const savedIdentifier = loadedIdentifiers[peerConnectKey];
        if(notExist){
            var dataTarget = `.logViewerStream[data-mid='${monitorId}'][data-peerconnectkey='${peerConnectKey}']`
            var classToggle = (dashboardOptions().class_toggle || {})[dataTarget] || []
            var html = `<div id="logViewerStreamContainer_${monitorId}_${peerConnectKey}" class="card border-1 border-warning mb-3 search-row">
                <div id="logViewerStreamHeader_${monitorId}_${peerConnectKey}" class_toggle="d-none" data-target="${dataTarget}" class="card-header cursor-pointer d-flex">
                    <div class="col">
                        <i class="fa fa-exclamation-triangle"></i> &nbsp; ${monitor.name} <small>(${savedIdentifier.name || peerConnectKey}, ${monitor.mid})</small>
                    </div>
                    <div class="lastlogtime col text-end"></div>
                </div>
                <div data-mid="${monitorId}" data-ke="${groupKey}" data-peerconnectkey="${peerConnectKey}" class="logViewerStream card-body pb-0 ${classToggle[1] === 1 ? 'd-none' : ''}"></div>
            </div>`
            globalLogStream.append(html);
            setLogStreamElements(monitorId, peerConnectKey)
        }
    }
    function drawMonitorContainers(){
        $.each(loadedShinobiAPI,function(peerConnectKey,server){
            drawMonitorContainer({ mid: '_USER', ke: server.groupKey, name: lang['User Logs'] }, peerConnectKey)
            $.each(server.loadedMonitors,function(n,monitor){
                drawMonitorContainer(monitor, peerConnectKey)
            })
        })
    }
    function drawLogRows(){
        var html = ''
        const { shinobiServer, superUser } = getSelectedPeerConnectKey()
        var selectedLogType = logTypeSelector.val()
        selectedLogType = selectedLogType === 'all' ? '' : selectedLogType;
        var isSystemLogs = selectedLogType === 'system';
        const { startDate, endDate } = shinobiServer.getSelectedTime(dateSelector)
        const getter = isSystemLogs ? superUser : shinobiServer;
        getter.getLogs(
            formattedTimeForFilename(startDate),
            formattedTimeForFilename(endDate),
            isSystemLogs ? undefined : selectedLogType
        ).then((rows) => {
            if(rows.length === 0){
                html = '<tr class="text-center"><td>'+lang.NoLogsFoundForDateRange+'</td></tr>'
            }else{
                $.each(rows,function(n,v){
                    html += getter.buildLogTableRow(v)
                })
            }
            savedLogRows.html(html)
        })
    }

    logTypeSelector.change(drawLogRows)
    theForm.submit(function(e){
        e.preventDefault()
        drawLogRows()
        return false
    })
    theWindow.find('.submit').click(function(){
        drawLogRows()
    })
    loadDateRangePicker(dateSelector,{
        onChange: function(start, end, label) {
            drawLogRows()
        }
    })
    addOnTabOpen('logs', function () {
        drawMonitorContainers()
        const firstServer = drawPeerConnectKeysToSelector(peerConnectKeysList,null,null)
        drawMonitorListToSelector(monitorsList,null,null,false,firstServer)
        drawLogRows()
    })
    addOnTabReopen('logs', function () {
        var theSelectedServer = peerConnectKeysList.val()
        var theSelected = monitorsList.val()
        theSelectedServer = drawPeerConnectKeysToSelector(peerConnectKeysList,!theSelectedServer,null,theSelectedServer)
        peerConnectKeysList.val(theSelectedServer)
        setSelectedPeerConnectKey()
        theSelected = drawMonitorListToSelector(monitorsList,!theSelected,null,false,theSelectedServer)
        monitorsList.val(theSelected)
    })
    onShinobiWebSocketEvent(function (d, peerConnectKey){
        switch(d.f){
            case'log':
                loadedShinobiAPI[peerConnectKey].logWriterDraw(d.mid, d)
            break;
            case'monitor_edit':
                drawMonitorContainer(d.mon, peerConnectKey)
            break;
            case'monitor_watch_on':
                setLogStreamElements(d.id || d.mid, peerConnectKey)
            break;
            case'monitor_watch_off':case'monitor_stopping':
                setLogStreamElements(d.id || d.mid, peerConnectKey)
            break;
        }
    })
})
