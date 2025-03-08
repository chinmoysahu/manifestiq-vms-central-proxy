(function(){
    var loadedLiveGrids = {}
    var monitorPops = {}
    var liveGridElements = {}
    var liveGridTab = $('#tab-liveGrid')
    var liveGrid = $('#monitors_live')
    var liveGridSideMenu = $('#side-menu-link-liveGrid')
    var liveGridOpenCountElements = $('.liveGridOpenCount')
    var liveGridOpenCount = 0
    var liveGridPauseScrollTimeout = null;
    var liveGridPlayingNow = {};
    var lastWindowWidth = liveGrid.width()
    var lastWindowHeight = liveGrid.height()
    //
    var onLiveStreamInitiateExtensions = []
    function onLiveStreamInitiate(callback){
        onLiveStreamInitiateExtensions.push(callback)
    }
    var onLiveStreamCloseExtensions = []
    function onLiveStreamClose(callback){
        onLiveStreamCloseExtensions.push(callback)
    }
    var onSignalCheckLiveStreamExtensions = []
    function onSignalCheckLiveStream(callback){
        onSignalCheckLiveStreamExtensions.push(callback)
    }
    var onBuildStreamElementExtensions = []
    function onBuildStreamElement(callback){
        onBuildStreamElementExtensions.push(callback)
    }
    //
    function setLiveGridOpenCount(addOrRemove){
        liveGridOpenCount += addOrRemove
        liveGridOpenCountElements.text(liveGridOpenCount)
    }
    function saveLiveGridBlockPositions() {
        var monitors = {}
        liveGrid.find(".monitor_item").each(function(n,v){
            var monitorItem = $(v)
            var position = monitorItem.position()
            var item = {}
            item.ke = monitorItem.attr('data-ke')
            item.mid = monitorItem.attr('data-mid')
            item.peerConnectKey = monitorItem.attr('data-peerconnectkey')
            item.x = position.left
            item.y = position.top
            item.height = monitorItem.height()
            item.width = monitorItem.width()
            monitors[`${item.peerConnectKey}${item.ke}${item.mid}`] = item
        })
        dashboardOptions('liveGridRememberedPositions', monitors)
        // $user.details.monitorOrder = monitors;
        // mainSocket.f({f:'monitorOrder',monitorOrder:monitors})
    }
    function buildStreamElementHtml(streamType){
        var html = ''
        if(window.jpegModeOn === true){
            html = '<img class="stream-element">';
        }else{
            switch(streamType){
                case'hls':case'flv':case'mp4':
                    html = `<video class="stream-element" playsinline autoplay muted></video>`;
                break;
                case'mjpeg':
                    html = '<iframe class="stream-element"></iframe>';
                break;
                default://base64//h265
                    html = '<canvas class="stream-element"></canvas>';
                break;
            }
            $.each(onBuildStreamElementExtensions,function(n,extender){
                var newHtml = extender(streamType)
                html = newHtml ? newHtml : html
            })
        }
        return html
    }
    function attachVideoElementErrorHandler(monitorId, peerConnectKey){
        try{
            var shinobiServer = loadedShinobiAPI[peerConnectKey]
            var monitor = shinobiServer.loadedMonitors[monitorId]
            var monitorDetails = safeJsonParse(monitor.details)
            var subStreamChannel = monitor.subStreamChannel
            var streamType = subStreamChannel ? monitorDetails.substream ? monitorDetails.substream.output.stream_type : 'hls' : monitorDetails.stream_type
            if(
                streamType === 'flv' ||
                streamType === 'hls'
            ){
                var streamBlock = liveGridElements[monitorId + peerConnectKey].streamElement
                streamBlock[0].onerror = function(){
                    // setTimeout(function(){
                    //     mainSocket.f({f:'monitor',ff:'watch_on',id:monitorId})
                    // },2000)
                }
            }
        }catch(err){
            console.error(`Failed to Set Error Handler for Video Element`,err)
        }
    }

    function resetMonitorCanvas(peerConnectKey,monitorId,initiateAfter,subStreamChannel){
        var shinobiServer = loadedShinobiAPI[peerConnectKey]
        var monitor = shinobiServer.loadedMonitors[monitorId]
        var details = monitor.details
        var streamType = subStreamChannel ? details.substream ? details.substream.output.stream_type : 'hls' : details.stream_type
        if(!liveGridElements[monitorId + peerConnectKey])return;
        var streamBlock = liveGridElements[monitorId + peerConnectKey].monitorItem.find('.stream-block')
        closeLiveGridPlayer(peerConnectKey,monitorId,false)
        streamBlock.find('.stream-element').remove()
        streamBlock.append(buildStreamElementHtml(streamType))
        attachVideoElementErrorHandler(monitorId,peerConnectKey)
        if(initiateAfter)initiateLiveGridPlayer(monitor,subStreamChannel)
        resetLiveGridDimensionsInMemory(peerConnectKey,monitorId)
    }
    function replaceMonitorInfoInHtml(htmlString,monitor){
        var monitorMutes = dashboardOptions().monitorMutes || {}
        return htmlString
            .replaceAll('$GROUP_KEY',monitor.ke)
            .replaceAll('$MONITOR_ID',monitor.mid)
            .replaceAll('$MONITOR_PEERCONNECTKEY',monitor.peerConnectKey)
            .replaceAll('$MONITOR_MODE',monitor.mode)
            .replaceAll('$MONITOR_NAME',monitor.name)
            .replaceAll('$MONITOR_MUTE_ICON',(monitorMutes[monitor.mid + monitor.peerConnectKey] !== 1 ? 'volume-up' : 'volume-off'));
    }
    function buildLiveGridBlock(monitor){
        if(monitor.mode === 'stop'){
            new PNotify({
                title: lang.sorryNo,
                text: lang[`Cannot watch a monitor that isn't running.`],
                type: 'danger'
            })
            return
        }
        var peerConnectKey = monitor.peerConnectKey
        var shinobiServer = loadedShinobiAPI[peerConnectKey]
        var monitorId = monitor.mid
        var monitorDetails = safeJsonParse(monitor.details)
        var monitorLiveId = `monitor_live_${monitor.mid}${peerConnectKey}`
        var subStreamChannel = monitor.subStreamChannel
        var streamType = subStreamChannel ? monitorDetails.substream ? monitorDetails.substream.output.stream_type : 'hls' : monitorDetails.stream_type
        var streamElement = buildStreamElementHtml(streamType)
        var streamBlockInfo = pageLayouts['Monitor Stream Window']
        var wasLiveGridLogStreamOpenBefore = isLiveGridLogStreamOpenBefore(monitorId)
        var liveGridBorderBetween = dashboardOptions().switches.liveGridBorderBetween === 1;
        if(!loadedLiveGrids[monitorId + peerConnectKey])loadedLiveGrids[monitorId + peerConnectKey] = { monitor }
        var quickLinkHtml = ''
        $.each(streamBlockInfo.quickLinks,function(n,button){
            if(button.eval && !eval(button.eval))return;
            quickLinkHtml += `<a title="${button.label}" class="btn btn-sm mr-1 badge btn-${button.class}"><i class="fa fa-${button.icon}"></i></a>`
        })
        var baseHtml = `<div
            id="${monitorLiveId}"
            data-ke="${monitor.ke}"
            data-mid="${monitor.mid}"
            data-peerconnectkey="${peerConnectKey}"
            data-mode="${monitor.mode}"
            class="monitor_item ${liveGridBorderBetween ? 'border-between' : ''} ${wasLiveGridLogStreamOpenBefore ? 'show_data' : ''} glM${monitor.mid}${peerConnectKey} ${streamBlockInfo.gridBlockClass || ''}"
        >
            <div style="height:100%" class="d-flex">
                <div class="stream-block no-padding mdl-card__media mdl-color-text--grey-50 ${wasLiveGridLogStreamOpenBefore ? 'col-md-6' : 'col-md-12'}">
                    ${streamBlockInfo.streamBlockPreHtml || ''}
                    <div class="stream-objects"></div>
                    <div class="stream-hud">
                        ${streamBlockInfo.streamBlockHudHtml || ''}
                        <div class="controls">
                            ${streamBlockInfo.streamBlockHudControlsHtml || ''}
                        </div>
                    </div>
                    ${streamElement}
                </div>
                <div class="mdl-data_window ${wasLiveGridLogStreamOpenBefore ? 'col-md-6' : 'col-md-12'}">
                    <div class="d-flex flex-row" style="height: 100%;">
                        <div class="data-menu col-md-6 p-2 videos-mini scrollable"></div>
                        <div class="data-menu col-md-6 p-2 logs scrollable"></div>
                    </div>
                </div>
            </div>
            ${(streamBlockInfo.gridBlockAfterContentHtml || '').replace(`$QUICKLINKS`,quickLinkHtml)}
            <div class="mdl-overlay-menu-backdrop hidden">
                <ul class="mdl-overlay-menu list-group">`
                var buttons = streamBlockInfo.links
                $.each(buttons,function(n,button){
                    if(button.eval && !eval(button.eval))return;
                    baseHtml += `<li class="list-item cursor-pointer ${button.class}" title="${button.label}" ${button.attr}><i class="fa fa-${button.icon}"></i> ${button.label}</li>`
                })
                baseHtml += `</ul>
            </div>
        </div>`
        return replaceMonitorInfoInHtml(baseHtml,monitor)
    }
    function drawPtzControlsOnLiveGridBlock(peerConnectKey, monitorId){
        var shinobiServer = loadedShinobiAPI[peerConnectKey]
        var monitorItem = $('#monitor_live_' + monitorId + peerConnectKey)
        var ptzControls = monitorItem.find('.PTZ_controls');
        var loadedMonitor = shinobiServer.loadedMonitors[monitorId]
        var stopCommandOnRelease = loadedMonitor.details.control_stop === '2'
        if(ptzControls.length>0){
            ptzControls.remove()
        }else{
            var html = `<div class="PTZ_controls">
                <div class="pad">
                    <div class="control top run-live-grid-monitor-ptz${stopCommandOnRelease ? `-move` : '' }" data-ptz-control="up"></div>
                    <div class="control left run-live-grid-monitor-ptz${stopCommandOnRelease ? `-move` : '' }" data-ptz-control="left"></div>
                    <div class="control right run-live-grid-monitor-ptz${stopCommandOnRelease ? `-move` : '' }" data-ptz-control="right"></div>
                    <div class="control bottom run-live-grid-monitor-ptz${stopCommandOnRelease ? `-move` : '' }" data-ptz-control="down"></div>
                    <div class="control middle run-live-grid-monitor-ptz" data-ptz-control="center"></div>
                </div>
                <div class="btn-group btn-group-sm btn-group-justified">
                    <a title="${lang['Zoom In']}" class="zoom_in btn btn-default run-live-grid-monitor-ptz" data-ptz-control="zoom_in"><i class="fa fa-search-plus"></i></a>
                    <a title="${lang['Zoom Out']}" class="zoom_out btn btn-default run-live-grid-monitor-ptz" data-ptz-control="zoom_out"><i class="fa fa-search-minus"></i></a>
                </div>
                <div class="btn-group btn-group-sm btn-group-justified">
                    <a title="${lang['Enable Nightvision']}" class="nv_enable btn btn-default run-live-grid-monitor-ptz" data-ptz-control="enable_nv"><i class="fa fa-moon-o"></i></a>
                    <a title="${lang['Disable Nightvision']}" class="nv_disable btn btn-default run-live-grid-monitor-ptz" data-ptz-control="disable_nv"><i class="fa fa-sun-o"></i></a>
                </div>
                ${safeJsonParse(shinobiServer.loadedMonitors[monitorId].details,{}).is_onvif === '1' ? `
                <div class="btn-group btn-group-sm btn-group-justified">
                    <a title="${lang['Set Home Position (ONVIF-only)']}" class="btn btn-default run-live-grid-monitor-ptz" data-ptz-control="setHome"><i class="fa fa-h-square"></i> ${lang['Set Home']}</a>
                </div>` : ``}
            </div>`
            monitorItem.append(html)
        }
    }
    function drawVideoCardToMiniList(peerConnectKey, monitorId,video,skipLimitCheck){
        var theVideoList = liveGridElements[monitorId + peerConnectKey].miniVideoList
        if(!skipLimitCheck){
            var rowsDrawn = theVideoList.find('.video-row')
            if(rowsDrawn.length > 10)rowsDrawn.last().remove()
        }
        theVideoList.prepend(createVideoRow(video,`col-12 mb-2`))
    }
    function loadVideoMiniList(peerConnectKey, monitorId){
        var shinobiServer = loadedShinobiAPI[peerConnectKey]
        shinobiServer.getVideos({
            monitorId: monitorId,
            limit: 10,
        },function(data){
            var videos = data.videos
            $.each(videos.reverse(),function(n,video){
                drawVideoCardToMiniList(peerConnectKey,monitorId,video,true)
            })
        })
    }
    function updateLiveGridElementHeightWidth(monitorLiveId){
        var liveGridElement = liveGridElements[monitorLiveId]
        liveGridElement.streamElement = liveGridElement.monitorItem.find('.stream-element')
        var streamElement = liveGridElement.streamElement
        liveGridElement.width = streamElement.width()
        liveGridElement.height = streamElement.height()
    }
    function updateAllLiveGridElementsHeightWidth(){
        $.each(liveGridElements,function(monitorLiveId){
            updateLiveGridElementHeightWidth(monitorLiveId)
        })
    }
    function setLiveGridLogStreamOpenStatus(peerConnectKey,monitorId,toggleOn){
        var liveGridLogStreams = dashboardOptions().liveGridLogStreams || {}
        liveGridLogStreams[monitorId + peerConnectKey] = toggleOn ? true : false
        dashboardOptions('liveGridLogStreams',liveGridLogStreams)
    }
    function isLiveGridLogStreamOpenBefore(peerConnectKey,monitorId){
        var liveGridLogStreams = dashboardOptions().liveGridLogStreams || {}
        return liveGridLogStreams[monitorId + peerConnectKey]
    }
    function drawLiveGridBlock(monitorConfig,subStreamChannel,forcedMonitorsPerRow,monitorHeight){
        var peerConnectKey = monitorConfig.peerConnectKey
        var groupKey = monitorConfig.ke
        var monitorId = monitorConfig.mid
        var monitorLiveId = monitorId + peerConnectKey
        var liveGridRememberedPositionId = `${peerConnectKey}${groupKey}${monitorId}`;
        var shinobiServer = loadedShinobiAPI[peerConnectKey]
        var monitorBlockExist = $('#monitor_live_' + monitorId + peerConnectKey).length === 0;
        if(monitorBlockExist){
            var x = null;
            var y = null;
            var oneThirdWidth = liveGrid.width() / 3.01
            var oneThirdHeight = liveGrid.height() / 3.01
            var width = oneThirdWidth;
            var height = oneThirdHeight;
            var isSmallMobile = isMobile || window.innerWidth <= 812;
            var html = buildLiveGridBlock(monitorConfig)
            var monitorOrderEngaged = dashboardOptions().switches.monitorOrder === 1;
            var liveGridRememberedPositions = dashboardOptions().liveGridRememberedPositions || {};
            var wasLiveGridLogStreamOpenBefore = isLiveGridLogStreamOpenBefore(monitorLiveId)
            if(monitorOrderEngaged && liveGridRememberedPositions[liveGridRememberedPositionId]){
                var saved = liveGridRememberedPositions[liveGridRememberedPositionId];
                x = saved.x;
                y = saved.y;
                width = saved.width;
                height = saved.height;
            }
            liveGrid.append(html)
                .find(`[data-mid="${monitorId}"][data-peerconnectkey="${peerConnectKey}"]`)
                .css({
                    left: x,
                    top: y,
                    width: isSmallMobile ? `100%` :  width,
                    height: isSmallMobile ? `300px` :  height,
                })
                .draggable({
                    grid: [40, 40],
                    snap: '#monitors_live',
                    containment: "window",
                    stop: function(){
                        checkCollisionAndReposition($(this));
                        saveLiveGridBlockPositions()
                    }
                })
                .resizable({
                    grid: [40, 40],
                    snap: '#monitors_live',
                    stop: function(){
                        checkCollisionAndReposition($(this));
                        setTimeout(() => {
                            resetAllLiveGridDimensionsInMemory()
                        },2000)
                        saveLiveGridBlockPositions()
                        updateAllLiveGridElementsHeightWidth()
                    }
                });
            var theBlock = $('#monitor_live_' + monitorId + peerConnectKey);
            var streamElement = theBlock.find('.stream-element')
            liveGridElements[monitorId + peerConnectKey] = {
                monitorItem: theBlock,
                streamElement: streamElement,
                eventObjects: theBlock.find('.stream-objects'),
                motionMeter: theBlock.find('.indifference .progress-bar'),
                motionMeterText: theBlock.find('.indifference .progress-bar span'),
                width: streamElement.width(),
                height: streamElement.height(),
                miniVideoList: theBlock.find('.videos-mini'),
            }
            try{
                if(safeJsonParse(monitorConfig.details).control === "1"){
                    theBlock.find('[monitor="control_toggle"]').show()
                }else{
                    theBlock.find('.pad').remove();
                    theBlock.find('[monitor="control_toggle"]').hide()
                }
            }catch(re){
                debugLog(re)
            }
            setCosmeticMonitorInfo(shinobiServer.loadedMonitors[monitorId],subStreamChannel)
            setLiveGridOpenCount(1)
            console.log('Drawn', theBlock, liveGridElements)
        }
        initiateLiveGridPlayer(shinobiServer.loadedMonitors[monitorId],subStreamChannel)
        attachVideoElementErrorHandler(monitorId, peerConnectKey)
        if(wasLiveGridLogStreamOpenBefore){
            loadVideoMiniList(peerConnectKey, monitorId[monitorId + peerConnectKey])
        }
    }
    function initiateLiveGridPlayer(monitor,subStreamChannel){
        var peerConnectKey = monitor.peerConnectKey
        var monitorId = monitor.mid
        var monitorLiveId = monitorId + peerConnectKey
        var shinobiServer = loadedShinobiAPI[peerConnectKey]
        var details = monitor.details
        var groupKey = monitor.ke
        var monitorId = monitor.mid
        var livePlayerBlocks = liveGridElements[monitorId + peerConnectKey]
        var monitorItem = livePlayerBlocks.monitorItem
        var loadedMonitor = shinobiServer.loadedMonitors[monitorId]
        var loadedPlayer = loadedLiveGrids[monitorId + peerConnectKey]
        var containerElement = $(`#monitor_live_${monitor.mid}${peerConnectKey}`)
        var streamType = subStreamChannel ? details.substream ? details.substream.output.stream_type : 'hls' : details.stream_type
        var isInView = true //isScrolledIntoView(monitorItem[0])
        var websocketQuery = shinobiServer.websocket.websocketQuery
        if(!isInView){
            return;
        }
        liveGridPlayingNow[monitorId + peerConnectKey] = true
        switch(streamType){
                case'b64':
                    if(loadedPlayer.Base64 && loadedPlayer.Base64.connected){
                        loadedPlayer.Base64.disconnect()
                    }
                    loadedPlayer.Base64 = io(shinobiServer.origin,{ path: shinobiServer.socketIoPath, query: websocketQuery, transports: ['websocket'], forceNew: false})
                    var ws = loadedPlayer.Base64
                    var buffer
                    ws.on('diconnect',function(){
                        console.log('Base64 Stream Disconnected')
                    })
                    ws.on('connect',function(){
                        ws.emit('Base64',{
                            auth: $user.auth_token,
                            uid: $user.uid,
                            ke: monitor.ke,
                            id: monitor.mid,
                            channel: subStreamChannel
                        })
                        if(!loadedPlayer.ctx || loadedPlayer.ctx.length === 0){
                            loadedPlayer.ctx = containerElement.find('canvas');
                        }
                        var ctx = loadedPlayer.ctx[0]
                        var ctx2d = ctx.getContext("2d")
                        loadedPlayer.image = new Image()
                        var image = loadedPlayer.image
                        image.onload = function() {
                            loadedPlayer.imageLoading = false
                            var x = 0
                            var y = 0
                            ctx.getContext("2d").drawImage(image,x,y,ctx.width,ctx.height)
                            URL.revokeObjectURL(loadedPlayer.imageUrl)
                        }
                        ws.on('data',function(imageData){
                            try{
                                if(loadedPlayer.imageLoading === true)return console.log('drop');
                                loadedPlayer.imageLoading = true
                                var arrayBufferView = new Uint8Array(imageData);
                                var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
                                loadedPlayer.imageUrl = URL.createObjectURL( blob );
                                loadedPlayer.image.src = loadedPlayer.imageUrl
                                loadedPlayer.last_frame = 'data:image/jpeg;base64,'+base64ArrayBuffer(imageData)
                            }catch(er){
                                debugLog('base64 frame')
                            }
                            // $.ccio.init('signal',d);
                        })
                    })
                break;
                case'mp4':
                    var stream = containerElement.find('.stream-element');
                    var onPoseidonError = function(){
                        // setTimeout(function(){
                        //     mainSocket.f({f:'monitor',ff:'watch_on',id:monitorId})
                        // },2000)
                    }
                    if(!loadedPlayer.PoseidonErrorCount)loadedPlayer.PoseidonErrorCount = 0
                    if(loadedPlayer.PoseidonErrorCount >= 5)return
                    if(subStreamChannel ? details.substream.output.stream_flv_type === 'ws' : monitor.details.stream_flv_type === 'ws'){
                        if(loadedPlayer.Poseidon){
                            loadedPlayer.Poseidon.stop()
                            revokeVideoPlayerUrl(peerConnectKey, monitorId)
                        }
                        try{
                            loadedPlayer.Poseidon = new Poseidon({
                                video: stream[0],
                                auth_token: shinobiServer.apiKey,
                                ke: monitor.ke,
                                uid: shinobiServer.$user.uid,
                                id: monitor.mid,
                                url: shinobiServer.origin,
                                path: shinobiServer.socketIoPath,
                                query: websocketQuery,
                                onError : onPoseidonError,
                                channel : subStreamChannel
                            })
                            loadedPlayer.Poseidon.start();
                        }catch(err){
                            // onPoseidonError()
                            console.log('onTryPoseidonError',err)
                        }
                    }else{
                        stream.attr('src',shinobiServer.buildApiPrefix(`mp4`)+'/'+monitor.mid + (subStreamChannel ? `/${subStreamChannel}` : '')+'/s.mp4?time=' + (new Date()).getTime())
                        stream[0].onerror = function(err){
                            console.error(err)
                        }
                    }
                break;
                case'hls':
                    function createSteamNow(){
                        clearTimeout(loadedPlayer.m3uCheck)
                        var url = shinobiServer.buildApiPrefix(`hls`) + '/' + monitor.mid + (subStreamChannel ? `/${subStreamChannel}` : '') + '/s.m3u8'
                        $.get(url,function(m3u){
                            if(m3u == 'File Not Found'){
                                loadedPlayer.m3uCheck = setTimeout(function(){
                                    createSteamNow()
                                },2000)
                            }else{
                                var video = containerElement.find('.stream-element')[0]
                                if (isAppleDevice) {
                                    video.src = url;
                                    video.addEventListener('loadedmetadata', function() {
                                      setTimeout(function(){
                                        video.play();
                                      },3000)
                                    }, false);
                                }else{
                                    var hlsOptions = safeJsonParse(dashboardOptions().hlsOptions) || {}
                                    if(hlsOptions instanceof String){
                                        hlsOptions = {}
                                        new PNotify({
                                            title: lang['Invalid JSON'],
                                            text: lang.hlsOptionsInvalid,
                                            type: `warning`,
                                        })
                                    }
                                    if(loadedPlayer.hls){
                                        loadedPlayer.hls.destroy()
                                        revokeVideoPlayerUrl(peerConnectKey, monitorId)
                                    }
                                    loadedPlayer.hls = new Hls(hlsOptions)
                                    loadedPlayer.hls.loadSource(url)
                                    loadedPlayer.hls.attachMedia(video)
                                    loadedPlayer.hls.on(Hls.Events.MANIFEST_PARSED,function() {
                                        if (video.paused) {
                                            video.play();
                                        }
                                    });
                                }
                            }
                        })
                    }
                    createSteamNow()
                break;
                case'mjpeg':
                    var liveStreamElement = containerElement.find('.stream-element')
                    var setSource = function(){
                        liveStreamElement.attr('src',shinobiServer.buildApiPrefix(`mjpeg`)+'/'+monitorId + (subStreamChannel ? `/${subStreamChannel}` : ''))
                        liveStreamElement.unbind('ready')
                        liveStreamElement.ready(function(){
                            setTimeout(function(){
                                liveStreamElement.contents().find("body").append('<style>img{width:100%;height:100%}</style>')
                            },1000)
                        })
                    }
                    setSource()
                    liveStreamElement.on('error',function(err){
                        setTimeout(function(){
                            setSource()
                        },4000)
                    })
                break;
            }
        $.each(onLiveStreamInitiateExtensions,function(n,extender){
            extender(streamType,monitor,loadedPlayer,subStreamChannel,peerConnectKey)
        })
        var monitorMutes = dashboardOptions().monitorMutes || {}
        if(dashboardOptions().switches.monitorMuteAudio === 1){
            containerElement.find('video').each(function(n,el){
                el.muted = "muted"
            })
        }else{
            var hasFocus = windowFocus && window.hadFocus
            $.each(getLoadedMonitors(),function(monitorLiveId,monitor){
                setTimeout(() => {
                    var monitorId = monitor.mid
                    var peerConnectKey = monitor.peerConnectKey
                    var muted = monitorMutes[monitorId + peerConnectKey]
                    try{
                        var vidEl = $(`.monitor_item[data-mid="${monitorId}"][data-peerconnectkey="${peerConnectKey}"] video`)[0]
                        if(vidEl.length === 0)return;
                        if(muted === 1){
                            vidEl.muted = true
                        }else{
                            if(hasFocus){
                                vidEl.muted = false
                            }else{
                                console.error('User must have window active to unmute.')
                            }
                        }
                    }catch(err){
                        // console.log(err)
                    }
                },2000)
            })
        }
        //initiate signal check
        if(streamType !== 'useSubstream'){
            var signalCheckInterval = (isNaN(loadedMonitor.details.signal_check) ? 10 : parseFloat(loadedMonitor.details.signal_check)) * 1000 * 60
            if(signalCheckInterval > 0){
                clearInterval(loadedPlayer.signal)
                loadedPlayer.signal = setInterval(function(){
                    signalCheckLiveStream({
                        peerConnectKey,
                        mid: monitorId,
                        checkSpeed: 3000,
                    })
                },signalCheckInterval);
            }
        }
    }
    function revokeVideoPlayerUrl(peerConnectKey, monitorId){
        try{
            URL.revokeObjectURL(liveGridElements[monitorId + peerConnectKey].streamElement[0].src)
        }catch(err){
            debugLog(err)
        }
    }
    function closeLiveGridPlayer(peerConnectKey, monitorId,killElement){
        try{
            var loadedPlayer = loadedLiveGrids[monitorId + peerConnectKey]
            if(loadedPlayer){
                if(loadedPlayer.hls){loadedPlayer.hls.destroy()}
                if(loadedPlayer.Poseidon){loadedPlayer.Poseidon.stop()}
                if(loadedPlayer.Base64){loadedPlayer.Base64.disconnect()}
                if(loadedPlayer.dash){loadedPlayer.dash.reset()}
                if(loadedPlayer.jpegInterval){
                    stopJpegStream(monitorId)
                }
                $.each(onLiveStreamCloseExtensions,function(n,extender){
                    extender(loadedPlayer, peerConnectKey)
                })
                clearInterval(loadedPlayer.signal)
            }
            if(liveGridElements[monitorId + peerConnectKey]){
                revokeVideoPlayerUrl(peerConnectKey, monitorId)
                if(killElement){
                    var livePlayerElement = liveGridElements[monitorId + peerConnectKey]
                    var theElement = livePlayerElement.monitorItem
                    theElement.remove()
                    setLiveGridOpenCount(-1)
                    delete(loadedLiveGrids[monitorId + peerConnectKey])
                    delete(liveGridElements[monitorId + peerConnectKey])
                }
            }
        }catch(err){
            console.log(err)
        }
    }
    function closeLiveGridPlayers(monitors, killElement){
        $.each(monitors,function(n,v){
            monitorWatchOnLiveGrid(v.peerConnectKey, v.mid, killElement)
        })
    }
    function monitorWatchOnLiveGrid(peerConnectKey, monitorId, watchOff){
        return mainSocket.f({f:'monitor',ff:watchOff ? 'watch_off' : 'watch_on',id: monitorId})
    }
    function callMonitorToLiveGrid(v, justTry){
        var watchedOn = dashboardOptions().watch_on || {}
        var peerConnectKey = v.peerConnectKey;
        var shinobiServer = loadedShinobiAPI[peerConnectKey]
        if(justTry || watchedOn[`${peerConnectKey}${v.mid}`] === 1 && shinobiServer.loadedMonitors[v.mid] && shinobiServer.loadedMonitors[v.mid].mode !== 'stop'){
            shinobiServer.websocket.f({f:'monitor',ff:'watch_on',id:v.mid})
            if(tabTree.name !== 'monitorSettings')openLiveGrid()
            console.log('loaded',v.name)
        }
    }
    function callMonitorsToLiveGrid(monitors, justTry){
        $.each(monitors,function(n,v){
            console.log('loading',v.name)
            callMonitorToLiveGrid(v, justTry)
        })
    }
    async function loadPreviouslyOpenedLiveGridBlocks(){
        $.each(getLoadedMonitors(),function(n,v){
            callMonitorToLiveGrid(v)
        })
        drawMonitorGroupList()
    }
    function closeAllLiveGridPlayers(rememberClose){
        $.each(loadedLiveGrids,function(monitorId,monitorItem){
            var monitor = monitorItem.monitor;
            var groupKey = monitor.ke;
            var monitorId = monitor.mid;
            var peerConnectKey = monitor.peerConnectKey;
            loadedShinobiAPI[peerConnectKey].websocket.f({
                f: 'monitor',
                ff: 'watch_off',
                id: monitorId
            })
            setTimeout(function(){
                saveLiveGridBlockOpenState(peerConnectKey, monitorId, groupKey,0)
            },1000)
        })
    }
    function saveLiveGridBlockOpenState(peerConnectKey, monitorId,groupKey,state){
        var openBlocks = dashboardOptions().watch_on || {}
        openBlocks[`${peerConnectKey}${monitorId}`] = state || 0
        dashboardOptions('watch_on',openBlocks)
    }
    function openLiveGrid(){
        if(tabTree.name !== 'liveGrid'){
            openTab('liveGrid',{})
        }
    }
    function popOutMonitor(peerConnectKey, monitorId){
        var monitorPop = monitorPops[monitorId + peerConnectKey] || {}
        if(monitorPop.isOpen){
            return
        }
        function finish(img){
            const shinobiServer = loadedShinobiAPI[peerConnectKey]
            monitorPops[monitorId + peerConnectKey] = window.open(shinobiServer.buildApiPrefix() + '/embed/' + $user.ke + '/' + monitorId + '/fullscreen|jquery|relative|gui' + `?host=${location.pathname}`,'pop_' + monitorId + $user.auth_token,'height='+img.height+',width='+img.width);
            monitorPop = monitorPops[monitorId + peerConnectKey]
            monitorPop.isOpen = true
            monitorPop.onload = function(){
                this.onbeforeunload = function(){
                    monitorPop.isOpen = false
                }
            }
        }
        if(loadedLiveGrids[monitorId + peerConnectKey]){
            getSnapshot(shinobiServer.loadedMonitors[monitorId],function(url){
                $('#temp').html('<img>')
                var img=$('#temp img')[0]
                img.onload = function(){
                    finish(img)
                }
                img.src = url
            })
        }else{
            var img = {
                height: 720,
                width: 1280
            }
            finish(img)
        }
    }
    function createWallViewWindow(windowName){
        var el = $(document)
        var width = el.width()
        var height = el.height()
        window.open(getApiPrefix() + '/wallview/' + $user.ke + (windowName ? 'window=' + windowName : ''), 'wallview_'+windowName, 'height='+height+',width='+width)
    }
    function fullScreenLiveGridStream(monitorItem){
        var videoElement = monitorItem.find('.stream-element')
        monitorItem.addClass('fullscreen')
        if(videoElement.is('canvas')){
            var theBody = $('body')
            videoElement.attr('height',theBody.height())
            videoElement.attr('width',theBody.width())
        }
        fullScreenInit(videoElement[0])
    }
    function canBackgroundStream(){
        return tabTree.name === 'liveGrid' && dashboardOptions().switches.backgroundStream === 1
    }
    function resetLiveGridDimensionsInMemory(peerConnectKey,monitorId){
        var theRef = liveGridElements[monitorId + peerConnectKey]
        theRef.width = theRef.streamElement.width()
        theRef.height = theRef.streamElement.height()
    }
    function resetAllLiveGridDimensionsInMemory(){
        $.each(loadedLiveGrids,function(monitorLiveId,data){
            var monitorId = data.monitor.mid
            var peerConnectKey = data.monitor.peerConnectKey
            resetLiveGridDimensionsInMemory(peerConnectKey,monitorId)
        })
    }
    function signalCheckLiveStream(options){
        try{
            var peerConnectKey = options.peerConnectKey
            var monitorId = options.mid
            var monitorConfig = shinobiServer.loadedMonitors[monitorId]
            var liveGridItem = liveGridElements[monitorId + peerConnectKey]
            var monitorItem = liveGridItem.monitorItem
            var monitorDetails = monitorConfig.details
            var checkCount = 0
            var base64Data = null;
            var base64Length = 0;
            var checkSpeed = options.checkSpeed || 1000
            var subStreamChannel = monitorConfig.subStreamChannel
            var streamType = subStreamChannel ? monitorDetails.substream ? monitorDetails.substream.output.stream_type : 'hls' : monitorDetails.stream_type
            function failedStreamCheck(){
                if(monitorConfig.signal_check_log == 1){
                    logWriterDraw(monitorId, {
                        log: {
                            type: 'Stream Check',
                            msg: lang.clientStreamFailedattemptingReconnect
                        }
                    })
                }
                mainSocket.f({f:'monitor',ff:'watch_on',id:monitorId});
            }
            function succeededStreamCheck(){
                if(monitorConfig.signal_check_log == 1){
                    logWriterDraw(monitorId, {
                        log: {
                            type: 'Stream Check',
                            msg : lang.Success
                        }
                    })
                }
            }
            async function executeCheck(){
                try{
                    switch(streamType){
                        case'b64':
                            monitorItem.resize()
                        break;
                        case'hls':case'flv':case'mp4':
                            if(monitorItem.find('video')[0].paused){
                                failedStreamCheck()
                            }else{
                                succeededStreamCheck()
                            }
                        break;
                        default:
                            if(dashboardOptions().jpeg_on === true){return}
                            var firstSnapshot = await getSnapshot({
                                monitor: shinobiServer.loadedMonitors[monitorId],
                            });
                            // console.log(firstSnapshot)
                            base64Length = firstSnapshot.fileSize
                            await setPromiseTimeout(checkSpeed)
                            var secondSnapshot = await getSnapshot({
                                monitor: shinobiServer.loadedMonitors[monitorId],
                            });
                            // console.log(secondSnapshot)
                            // console.log('----')
                            var secondSnapLength = secondSnapshot.fileSize
                            var hasFailed = firstSnapshot.url === secondSnapshot.url || base64Length === secondSnapLength;
                            if(hasFailed){
                                failedStreamCheck()
                            }else{
                                succeededStreamCheck()
                            }
                        break;
                    }
                    $.each(onSignalCheckLiveStreamExtensions,function(n,extender){
                        extender(streamType,monitorItem,peerConnectKey)
                    })
                }catch(err){
                    console.log('signal check ERROR', err)
                    failedStreamCheck()
                }
            }
            executeCheck()
        }catch(err){
            console.log(err)
            var errorStack = err.stack;
            function phraseFoundInErrorStack(x){return errorStack.indexOf(x) > -1}
            if(phraseFoundInErrorStack("The HTMLImageElement provided is in the 'broken' state.")){
                mainSocket.f({f:'monitor',ff:'watch_on',id:monitorId});
            }
            clearInterval(liveGridItem.signal);
            delete(liveGridItem.signal);
        }
    }

    function pauseMonitorItem(peerConnectKey, monitorId){
        liveGridPlayingNow[monitorId + peerConnectKey] = false
        closeLiveGridPlayer(peerConnectKey, monitorId,false)
    }
    function resumeMonitorItem(peerConnectKey, monitorId){
        // needs to know about substream
        liveGridPlayingNow[monitorId + peerConnectKey] = true
        resetMonitorCanvas(peerConnectKey, monitorId,true,null)
    }
    function isScrolledIntoView(elem){
        var el = $(elem)
        var theWindow = $(window)
        var docViewTop = theWindow.scrollTop();
        var docViewBottom = docViewTop + theWindow.height();

        var elemTop = el.offset().top;
        var elemBottom = elemTop + el.height();

        return (
            elemTop >= docViewTop && elemTop <= docViewBottom ||
            elemBottom >= docViewTop && elemBottom <= docViewBottom
        );
    }
    function pauseAllLiveGridPlayers(unpause){
        $('.monitor_item').each(function(n,el){
            var monitorId = $(el).attr('data-mid')
            var peerConnectKey = $(el).attr('data-peerconnectkey')
            if(!unpause){
                pauseMonitorItem(peerConnectKey, monitorId)
            }else{
                resumeMonitorItem(peerConnectKey, monitorId)
            }
        })
    }
    function setPauseStatusForMonitorItems(forceResume){
        $('.monitor_item').each(function(n,el){
            var monitorId = $(el).attr('data-mid')
            var peerConnectKey = $(el).attr('data-peerconnectkey')
            var isVisible = isScrolledIntoView(el)
            if(isVisible){
                if(forceResume || !liveGridPlayingNow[monitorId + peerConnectKey])resumeMonitorItem(peerConnectKey, monitorId);
            }else{
                pauseMonitorItem(peerConnectKey, monitorId)
            }
        })
    }
    function setPauseScrollTimeout(forceResume){
        clearTimeout(liveGridPauseScrollTimeout)
        if(tabTree.name === 'liveGrid'){
            liveGridPauseScrollTimeout = setTimeout(function(){
                setPauseStatusForMonitorItems(forceResume)
            },200)
        }
    }
    function openAllLiveGridPlayers(){
        const monitors = getLoadedMonitors();
        const numberOf = Object.keys(monitors).length
        $.each(monitors,function(monitorLiveId,monitor){
            getShinobiWebsocket(monitor.peerConnectKey).f({
                f: 'monitor',
                ff: 'watch_on',
                id: monitor.mid
            })
            openLiveGrid()
        })
    }
    function addMarkAsEvent(peerConnectKey, monitorId){
        loadedShinobiAPI[peerConnectKey].runTestDetectionTrigger(monitorId,{
            "name":"Marker",
            "reason":"marker",
            "matrices": [
                {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1,
                    tag: 'Marked',
                    confidence: 100,
                }
            ]
        });
    }
    function addMarkAsEventToAllOpenMonitors(){
        $.each(liveGridElements,function(n,theEl){
            var monitor = theEl.monitor
            var monitorId = monitor.mid
            var peerConnectKey = monitor.peerConnectKey
            if(liveGridPlayingNow[monitorId + peerConnectKey]){
                addMarkAsEvent(peerConnectKey, monitorId)
            }
        })
    }
    function showHideSubstreamActiveIcon(peerConnectKey, monitorId, show){
        try{
            var liveBlock = liveGridElements[monitorId + peerConnectKey].monitorItem
            liveBlock.find('.substream-is-on')[show ? 'show' : 'hide']()
        }catch(err){

        }
    }
    function openLiveGridPage(monitorId, peerConnectKey){
        if(isMobile){
            closeAllLiveGridPlayers()
        }
        getShinobiWebsocket(peerConnectKey).f({
            f: 'monitor',
            ff: 'watch_on',
            id: monitorId
        })
        openLiveGrid()
    }

    function autoPlaceCurrentMonitorItemsOnLiveGrid(gridNumber) {
        const wallviewVideos = liveGrid.find('.monitor_item');
        const totalItems = wallviewVideos.length;
        let numRows, numCols;
        if(gridNumber){
            numCols = gridNumber;
            numRows = gridNumber;
        }else if (totalItems === 6 || totalItems === 5) {
            numCols = 3;
            numRows = 2;
        } else {
            numRows = Math.ceil(Math.sqrt(totalItems));
            numCols = Math.ceil(totalItems / numRows);
        }

        const containerWidth = liveGrid.width();
        const containerHeight = liveGridTab.height();
        const itemWidth = containerWidth / numCols;
        const itemHeight = containerHeight / numRows;

        wallviewVideos.each(function(index, element) {
            const row = Math.floor(index / numCols);
            const col = index % numCols;

            $(element).css({
                left: col * itemWidth,
                top: row * itemHeight,
                width: itemWidth,
                height: itemHeight
            });
        });
        setPauseScrollTimeout()
    }
    function getCurrentLayout(){
        var layout = []
        liveGrid.find('.monitor_item').each(function(n,v){
            var el = $(v)
            var monitorId = el.attr('data-mid')
            var peerConnectKey = el.attr('data-peerconnectkey')
            var position = el.position()
            layout.push({
                monitorId,
                peerConnectKey,
                css: {
                    left: position.left,
                    top: position.top,
                    width: el.width(),
                    height: el.height(),
                }
            })
        })
        return layout
    }
    function rescaleMatrix(matrix, oldWidth, oldHeight, newWidth, newHeight) {
        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;

        return {
            left: matrix.left * scaleX,
            top: matrix.top * scaleY,
            width: matrix.width * scaleX,
            height: matrix.height * scaleY
        };
    }
    function resizeMonitorItem({ peerConnectKey, monitorId, css }, oldWidth, oldHeight, newWidth, newHeight){
        var monitorItem = liveGrid.find(`[data-peerconnectkey="${peerConnectKey}"][data-mid="${monitorId}"]`);
        var newCss = rescaleMatrix(css, oldWidth, oldHeight, newWidth, newHeight)
        monitorItem.css(newCss)
    }
    function onWindowResize(){
        var currentWindowWidth = liveGrid.width()
        var currentWindowHeight = liveGrid.height()
        var layout = getCurrentLayout();
        for(item of layout){
            resizeMonitorItem(item,lastWindowWidth,lastWindowHeight,currentWindowWidth,currentWindowHeight)
        }
        lastWindowWidth = currentWindowWidth
        lastWindowHeight = currentWindowHeight
    }

    function checkCollisionAndReposition($square) {
      if (checkAnyCollision($square)) {
        moveToOpenSpace($square);
      }
    }

    function moveToOpenSpace($square) {
      const $container = $('#monitors_live');
      const step = 5; // pixel increment for scanning
      const maxLeft = $container.width() - $square.outerWidth();
      const maxTop = $container.height() - $square.outerHeight();

      // Store the original position, in case you want to start scanning from there
      // rather than from (0,0). But if you want to fill from the very top-left,
      // set these to 0 instead.
      let startLeft = parseInt($square.css('left')) || 0;
      let startTop  = parseInt($square.css('top'))  || 0;

      // Scan top-down in small steps
      for (let y = startTop; y <= maxTop; y += step) {
        for (let x = startLeft; x <= maxLeft; x += step) {
          // Temporarily position the square to test for collisions
          $square.css({ top: y, left: x });

          // If no collision, we found our open space
          if (!checkAnyCollision($square)) {
            return; // exit the function and keep it here
          }
        }
        // For each new row, reset x to 0 if you want to fill from the left edge.
        // If you want to continue from the same "column" the square started,
        // comment out the next line.
        startLeft = 0;
      }

      console.warn('No free space found!');
    }

    function checkAnyCollision($currentSquare) {
      let collisionFound = false;
      const currentOffset = $currentSquare.offset();
      const currentWidth  = $currentSquare.outerWidth();
      const currentHeight = $currentSquare.outerHeight();

      liveGrid.find('.monitor_item').not($currentSquare).each(function() {
        const $other = $(this);
        const otherOffset = $other.offset();
        const otherWidth  = $other.outerWidth();
        const otherHeight = $other.outerHeight();

        if (isOverlap(
          currentOffset.left, currentOffset.top, currentWidth, currentHeight,
          otherOffset.left, otherOffset.top, otherWidth, otherHeight
        )) {
          collisionFound = true;
          return false; // break out of .each
        }
      });

      return collisionFound;
    }

    function isOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
      // Calculate overlap in X dimension
      const overlapX = Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2);
      // Calculate overlap in Y dimension
      const overlapY = Math.min(y1 + h1, y2 + h2) - Math.max(y1, y2);

      // If there's no overlap or overlap is negative, it's definitely not colliding
      if (overlapX <= 0 || overlapY <= 0) {
        return false;
      }

      // If both overlaps exceed 2px, count that as a collision
      return (overlapX > 2 && overlapY > 2);
    }



    $(document).ready(function(e){
        liveGrid
        .on('dblclick','.stream-block',function(){
            var monitorItem = $(this).parents('[data-mid]');
            const { parentEl, monitorId, peerConnectKey } = getMonitorInfo(this);
            fullScreenLiveGridStream(monitorItem)
        })
        $('body')
        .resize(function(){
            resetAllLiveGridDimensionsInMemory()
            updateAllLiveGridElementsHeightWidth()
        })
        .on('click','.launch-live-grid-monitor',function(){
            const { parentEl, monitorId, peerConnectKey } = getMonitorInfo(this);
            if(isMobile){
                closeAllLiveGridPlayers()
            }
            getShinobiWebsocket(peerConnectKey).f({
                f: 'monitor',
                ff: 'watch_on',
                id: monitorId
            })
            openLiveGrid()
        })
        .on('click','.monitor-live-group-open',function(){
            var el = $(this);
            var peerConnectKey = el.attr('data-peerconnectkey')
            var monitorIds = el.attr('monitor-ids').split(',')
            monitorIds.forEach((monitorId) => {
                getShinobiWebsocket(peerConnectKey).f({
                    f: 'monitor',
                    ff: 'watch_on',
                    id: monitorId
                })
            })
            openLiveGrid()
        })
        .on('click','.reconnect-live-grid-monitor',function(){
            const { parentEl, monitorId, peerConnectKey, websocket, monitorLiveId } = getMonitorInfo(this);
            websocket.f({
                f: 'monitor',
                ff: 'watch_on',
                id: monitorId
            });
            updateLiveGridElementHeightWidth(monitorLiveId)
        })
        .on('click','.close-live-grid-monitor',function(){
            const { parentEl, monitorId, groupKey, peerConnectKey, websocket } = getMonitorInfo(this);
            websocket.f({
                f: 'monitor',
                ff: 'watch_off',
                id: monitorId
            })
            setTimeout(function(){
                saveLiveGridBlockOpenState(peerConnectKey, monitorId, groupKey,0)
            },1000)
        })
        .on('click','.snapshot-live-grid-monitor',function(){
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            shinobiServer.getSnapshot({
                monitor: shinobiServer.loadedMonitors[monitorId],
            },function(url){
                $('#temp').html('<a href="'+url+'" download="'+formattedTimeForFilename()+'_'+monitorId+'.jpg">a</a>').find('a')[0].click();
            })
        })
        .on('click','.toggle-live-grid-monitor-logs',function(){
            const { parentEl: monitorItem, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            monitorItem.toggleClass('show_data')
            var dataBlocks = monitorItem.find('.stream-block,.mdl-data_window')
            var openMonitorLogs = monitorItem.hasClass('show_data')
            if(openMonitorLogs){
                loadVideoMiniList(peerConnectKey, monitorId)
                dataBlocks.addClass('col-md-6').removeClass('col-md-12')
            }else{
                dataBlocks.addClass('col-md-12').removeClass('col-md-6')
            }
            setLiveGridLogStreamOpenStatus(peerConnectKey,monitorId,openMonitorLogs)
        })
        .on('click','.toggle-live-grid-monitor-ptz-controls',function(){
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            drawPtzControlsOnLiveGridBlock(peerConnectKey, monitorId)
        })
        .on('click','.toggle-live-grid-monitor-menu,.mdl-overlay-menu-backdrop',function(){
            var monitorItem = $(this).parents('[data-mid]')
            monitorItem.find('.mdl-overlay-menu-backdrop').toggleClass('hidden')
        })
        .on('click','.mdl-overlay-menu',function(e){
            e.stopPropagation()
            return false;
        })
        .on('click','.toggle-live-grid-monitor-fullscreen',function(){
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            fullScreenLiveGridStream(parentEl)
        })
        .on('click','.run-live-grid-monitor-pop',function(){
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            popOutMonitor(peerConnectKey, monitorId)
        })
        .on('click','.open-wallview',function(){
            createWallViewWindow()
        })
        .on('click','.toggle-monitor-substream',function(){
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            shinobiServer.toggleSubStream(monitorId)
        })
        .on('click','.run-live-grid-monitor-ptz',function(){
            var el = $(this)
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            var switchChosen = el.attr('data-ptz-control')
            runPtzCommand(peerConnectKey,monitorId,switchChosen)
        })
        .on('mousedown','.run-live-grid-monitor-ptz-move',function(){
            var el = $(this)
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            var switchChosen = el.attr('data-ptz-control')
            runPtzMove(peerConnectKey,monitorId,switchChosen,true)
        })
        .on('mouseup','.run-live-grid-monitor-ptz-move',function(){
            var el = $(this)
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            var switchChosen = el.attr('data-ptz-control')
            runPtzMove(peerConnectKey,monitorId,switchChosen,false)
        })
        .on('click','.run-monitor-detection-trigger-test',function(){
            var el = $(this)
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            shinobiServer.runTestDetectionTrigger(monitorId)
        })
        .on('click','.run-monitor-detection-trigger-marker',function(){
            var el = $(this)
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            addMarkAsEvent(peerConnectKey, monitorId)
        })
        .on('click','.run-monitor-detection-trigger-test-motion',function(){
            var el = $(this)
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            shinobiServer.runTestDetectionTrigger(monitorId,{
                "name":"Test Motion",
                "reason":"motion",
                matrices: [
                    {
                        x: 5,
                        y: 5,
                        width: 150,
                        height: 150,
                        tag: 'Motion Test',
                        confidence: 100,
                    }
                ]
            });
        })
        .on('click','.magnify-glass-live-grid-stream',function(){
            const { parentEl, monitorId, peerConnectKey, monitorLiveId, websocket, shinobiServer } = getMonitorInfo(this);
            const streamWindow = $(`.monitor_item[data-mid="${monitorId}"][data-peerconnectkey="${peerConnectKey}"]`)
            const monitor = shinobiServer.loadedMonitors[monitorId]
            if(monitor.magnifyStreamEnabled){
                monitor.magnifyStreamEnabled = false
                clearTimeout(monitor.magnifyMouseActionTimeout)
                var zoomHoverShade = createMagnifyStreamMask({
                    p: streamWindow,
                })
                zoomHoverShade
                    .off('mousemove', monitor.magnifyMouseAction)
                    .off('touchmove', monitor.magnifyMouseAction);
                streamWindow
                    .find('.zoomGlass,.zoomHoverShade').remove()
            }else{
                streamWindow.find('.mdl-overlay-menu-backdrop').addClass('hidden')
                monitor.magnifyStreamEnabled = true
                var zoomHoverShade = createMagnifyStreamMask({
                    p: streamWindow,
                })
                monitor.magnifyMouseAction = function(e){
                    clearTimeout(monitor.magnifyMouseActionTimeout)
                    monitor.magnifyMouseActionTimeout = setTimeout(function(){
                        magnifyStream({
                            p: streamWindow,
                            zoomAmount: 1,
                            auto: false,
                            animate: false,
                            pageX: e.pageX,
                            pageY:  e.pageY,
                            attribute: '.magnify-glass-live-grid-stream'
                        })
                    },50)
                }
                zoomHoverShade
                    .on('mousemove', monitor.magnifyMouseAction)
                    .on('touchmove', monitor.magnifyMouseAction)
            }
        })
        liveGridSideMenu.find('.open-all-monitors').click(function(){
            openAllLiveGridPlayers()
        })
        liveGridSideMenu.find('.close-all-monitors').click(function(){
            closeAllLiveGridPlayers()
        });
        liveGridSideMenu.find('.auto-place-monitors').click(function(){
            var el = $(this);
            var gridNumber = parseInt(el.attr('data-number')) || 3
            autoPlaceCurrentMonitorItemsOnLiveGrid(gridNumber)
            saveLiveGridBlockPositions()
        });
        var dontShowDetectionSelectionOnStart = dashboardOptions().dontShowDetection != 1
        addOnTabOpen('liveGrid', function () {
            loadPreviouslyOpenedLiveGridBlocks()
        })
        addOnTabReopen('liveGrid', function () {
            pauseAllLiveGridPlayers(true)
            updateAllLiveGridElementsHeightWidth()
        })
        addOnTabAway('liveGrid', function () {
            pauseAllLiveGridPlayers(false)
        })
        // onInitWebsocket(function (d){
        //     loadPreviouslyOpenedLiveGridBlocks()
        // })
        // onToggleSideBarMenuHide(function (isHidden){
        //     setTimeout(updateAllLiveGridElementsHeightWidth,2000)
        // })
        onShinobiWebSocketEvent(function (d, peerConnectKey){
            var shinobiServer = loadedShinobiAPI[peerConnectKey]
            switch(d.f){
                case'video_build_success':
                    d.status = 1
                    d.mid = d.id || d.mid
                    var monitorId = d.mid
                    var videoTime = d.time
                    shinobiServer.loadedVideosInMemory[`${monitorId}${videoTime}${d.type}`] = d
                    if(liveGridElements[monitorId + peerConnectKey] && liveGridElements[monitorId + peerConnectKey].streamElement)drawVideoCardToMiniList(peerConnectKey, monitorId,createVideoLinks(d),false)
                break;
                case'monitor_watch_off':case'monitor_stopping':
                    var monitorId = d.mid || d.id
                    console.log('closeLiveGridPlayer',monitorId)
                    closeLiveGridPlayer(peerConnectKey, monitorId,(d.f === 'monitor_watch_off'))
                break;
                case'monitor_status':
                    if(
                        tabTree.name === 'liveGrid' &&
                        (
                            d.code === 2 ||
                            d.code === 3
                        )
                    ){
                        var monitorId = d.mid || d.id
                        setTimeout(function(){
                            callMonitorToLiveGrid(shinobiServer.loadedMonitors[monitorId])
                        },2000)
                    }
                break;
                case'substream_start':
                    shinobiServer.loadedMonitors[d.mid].subStreamChannel = d.channel
                    shinobiServer.loadedMonitors[d.mid].subStreamActive = true
                    showHideSubstreamActiveIcon(peerConnectKey, d.mid,true)
                    setTimeout(() => {
                        resetMonitorCanvas(peerConnectKey, d.mid,true,d.channel)
                    },3000)
                break;
                case'substream_end':
                    shinobiServer.loadedMonitors[d.mid].subStreamChannel = null
                    shinobiServer.loadedMonitors[d.mid].subStreamActive = false
                    resetMonitorCanvas(peerConnectKey, d.mid,true,null)
                    showHideSubstreamActiveIcon(peerConnectKey, d.mid,false)
                break;
                case'monitor_watch_on':
                    var monitorId = d.mid || d.id
                    var loadedMonitor = shinobiServer.loadedMonitors[monitorId]
                    var subStreamChannel = d.subStreamChannel
                    var monitorsPerRow = null;
                    var monitorHeight = null;
                    function doResize(){
                        checkCollisionAndReposition(liveGrid.find(`[data-mid="${monitorId}"][data-peerconnectkey="${peerConnectKey}"].monitor_item`));
                        var monitorOrderEngaged = dashboardOptions().switches.monitorOrder === 1;
                        if(!monitorOrderEngaged){
                            // autoPlaceCurrentMonitorItemsOnLiveGrid()
                        }
                    }
                    if(!loadedMonitor.subStreamChannel && loadedMonitor.details.stream_type === 'useSubstream'){
                        shinobiServer.toggleSubStream(monitorId,function(){
                            drawLiveGridBlock(shinobiServer.loadedMonitors[monitorId],subStreamChannel,monitorsPerRow,monitorHeight)
                            saveLiveGridBlockOpenState(peerConnectKey, monitorId, loadedMonitor.ke,1)
                            doResize()
                        })
                    }else{
                        drawLiveGridBlock(shinobiServer.loadedMonitors[monitorId],subStreamChannel,monitorsPerRow,monitorHeight)
                        saveLiveGridBlockOpenState(peerConnectKey, monitorId, loadedMonitor.ke,1)
                        doResize()
                    }
                    showHideSubstreamActiveIcon(peerConnectKey, monitorId,!!subStreamChannel)
                break;
                case'detector_trigger':
                    var monitorId = d.id
                    var matrices = d.details.matrices
                    var liveGridElement = liveGridElements[monitorId + peerConnectKey]
                    if(!window.dontShowDetection && liveGridElement){
                        var monitorElement = liveGridElement.monitorItem
                        var livePlayerElement = loadedLiveGrids[monitorId + peerConnectKey]
                        if(d.doObjectDetection === true){
                            monitorElement.addClass('doObjectDetection')
                            clearTimeout(livePlayerElement.detector_trigger_doObjectDetection_timeout)
                            livePlayerElement.detector_trigger_doObjectDetection_timeout = setTimeout(function(){
                                monitorElement.removeClass('doObjectDetection')
                            },3000)
                        }else{
                            monitorElement.removeClass('doObjectDetection')
                        }
                        if(matrices && matrices.length > 0){
                            drawMatrices(d,{
                                theContainer: liveGridElement.eventObjects,
                                height: liveGridElement.height,
                                width: liveGridElement.width,
                            }, null, true)
                        }
                        if(d.details.confidence){
                            var eventConfidence = d.details.confidence
                            if(eventConfidence > 100)eventConfidence = 100
                            liveGridElement.motionMeter.css('width',eventConfidence + '%');
                            liveGridElement.motionMeterText[0].innerHtml = d.details.confidence+'% change in <b>'+d.details.name+'</b>'
                        }
                        clearTimeout(livePlayerElement.detector_trigger_timeout);
                        livePlayerElement.detector_trigger_timeout = setTimeout(function(){
                            liveGridElement.eventObjects.find('.stream-detected-object,.stream-detected-point').remove()
                        },800);
                        if(dontShowDetectionSelectionOnStart){
                            monitorElement.addClass('detector_triggered')
                            clearTimeout(livePlayerElement.detector_trigger_ui_indicator_timeout);
                            livePlayerElement.detector_trigger_ui_indicator_timeout = setTimeout(function(){
                                monitorElement.removeClass('detector_triggered');
                            },1000 * 15);
                        }
                        playAudioAlert()
                        var monitorPop = monitorPops[monitorId + peerConnectKey]
                        if(window.popLiveOnEvent && (!monitorPop || !monitorPop.isOpen)){
                            popOutMonitor(peerConnectKey, monitorId)
                        }
                        // console.log({
                        //     ke: d.ke,
                        //     mid: monitorId,
                        //     log: {
                        //         type: lang['Event Occurred'],
                        //         msg: d.details,
                        //     }
                        // })
                    }
                break;
            }
        })
        $(window).focus(function(){
            if(canBackgroundStream()){
                // pauseAllLiveGridPlayers(true)
                setPauseScrollTimeout(true)
            }
        }).blur(function(){
            if(canBackgroundStream()){
                pauseAllLiveGridPlayers(false)
            }
        }).resize(function(){
            setPauseScrollTimeout(true)
            // onWindowResize()
            // saveLiveGridBlockPositions()
        });
        liveGrid.scroll(function(){
            setPauseScrollTimeout()
        })
        dashboardSwitchCallbacks.monitorOrder = function(toggleState){
            if(toggleState !== 1){
                $('.monitor_item').attr('gs-auto-position','yes')
            }else{
                $('.monitor_item').attr('gs-auto-position','no')
            }
        }
        dashboardSwitchCallbacks.dontMonStretch = function(toggleState){
            var theBody = $('body')
            if(toggleState !== 1){
                theBody.addClass('dont-stretch-monitors')
            }else{
                theBody.removeClass('dont-stretch-monitors')
            }
        }
        dashboardSwitchCallbacks.dontShowDetection = function(toggleState){
            if(toggleState !== 1){
                window.dontShowDetection = false
            }else{
                window.dontShowDetection = true
            }
        }
        dashboardSwitchCallbacks.alertOnEvent = function(toggleState){
            // audio_alert
            if(toggleState !== 1){
                window.audioAlertOnEvent = false
            }else{
                window.audioAlertOnEvent = true
            }
        }
        dashboardSwitchCallbacks.popOnEvent = function(toggleState){
            if($user.details.event_mon_pop === '1'){
                window.popLiveOnEvent = true
            }else if(toggleState !== 1){
                window.popLiveOnEvent = false
            }else{
                window.popLiveOnEvent = true
            }
        }
        dashboardSwitchCallbacks.monitorMuteAudio = function(toggleState){
            var monitorMutes = dashboardOptions().monitorMutes || {}
            $('.monitor_item video').each(function(n,vidEl){
                var el = $(this)
                var parentEl = el.parents('[data-mid]');
                var monitorId = parentEl.attr('data-mid')
                var peerConnectKey = parentEl.attr('data-peerconnectkey')
                if(toggleState === 1){
                    vidEl.muted = true
                }else{
                    if(monitorMutes[monitorId + peerConnectKey] !== 1){
                        vidEl.muted = false
                    }
                }
            })
        }
        dashboardSwitchCallbacks.liveGridBorderBetween = function(toggleState){
            var useBorder = toggleState === 1
            $('.monitor_item')[useBorder ? 'addClass' : 'removeClass']('border-between')
        }
        window.openLiveGridPage = openLiveGridPage;
        window.openLiveGrid = openLiveGrid;
        window.callMonitorToLiveGrid = callMonitorToLiveGrid;
        window.closeAllLiveGridPlayers = closeAllLiveGridPlayers;
        window.closeLiveGridPlayers = closeLiveGridPlayers;
    })
})()
