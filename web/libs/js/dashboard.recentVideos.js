$(document).ready(function(){
    var theBlock = $('#recentVideos')
    var theList = $('#recentVideosList')
    var videoRangeEl = $('#recentVideosRange')
    var monitorsList = theBlock.find('.monitors_list')
    var peerConnectKeysList = theBlock.find('.peerConnectKeys_list')
    var loadedMonitors = {};
    var shinobiServer = {};
    function setSelectedPeerConnectKey(){
        const peerConnectKey = peerConnectKeysList.val()
        shinobiServer = loadedShinobiAPI[peerConnectKey]
        loadedMonitors = shinobiServer.loadedMonitors
        return { peerConnectKey, shinobiServer }
    }
    function getApiPrefix(target){
        return shinobiServer.buildApiPrefix(target)
    }
    function drawRowToList(row,toBegin,returnLastChild){
        theList[toBegin ? 'prepend' : 'append'](createVideoRow(row))
        if(returnLastChild){
            var theChildren = theList.children()
            return toBegin ? theChildren.first() : theChildren.last()
        }
    }
    function drawDaysToList(videos,toBegin,frames){
        var listOfDays = getAllDays(videos,frames)
        var videosSortedByDays = Object.assign({},listOfDays,sortVideosByDays(videos))
        var framesSortedByDays = Object.assign({},listOfDays,shinobiServer.sortFramesByDays(frames))
        $.each(listOfDays,function(monitorId,days){
            $.each(days,function(dayKey){
                var copyOfVideos = ([]).concat(videosSortedByDays[monitorId][dayKey] || []).reverse()
                var copyOfFrames = ([]).concat(framesSortedByDays[monitorId][dayKey] || []).reverse()
                theList.append(shinobiServer.createDayCard(copyOfVideos,copyOfFrames,dayKey,monitorId))
                var theChildren = theList.children()
                var createdCardCarrier = toBegin ? theChildren.first() : theChildren.last()
                shinobiServer.bindFrameFindingByMouseMoveForDay(createdCardCarrier,dayKey,copyOfVideos,copyOfFrames)
                // preloadAllTimelapseFramesToMemoryFromVideoList(copyOfFrames)
            })
        })
    }
    function drawListFiller(filler){
        theList.html(`<div class="text-center pt-4"><h3>${filler}</h3></div>`);
    }
    function loadVideos(options,callback){
        drawListFiller(`<i class="fa fa-spinner fa-pulse"></i>`)
        var currentDate = new Date()
        var videoRange = parseInt(videoRangeEl.val()) || 1
        options.videoRange = videoRange
        options.startDate = shinobiServer.convertTZ(moment(currentDate).subtract(videoRange, 'hours')._d, shinobiServer.serverTimezone);
        options.endDate = shinobiServer.convertTZ(moment(currentDate)._d, shinobiServer.serverTimezone);
        function drawVideoData(data){
            var html = ``
            var videos = data.videos || []
            var frames = data.frames || []
            // $.each(videos,function(n,row){
            //     var createdCardCarrier = drawRowToList(row,false,true)
            //     bindFrameFindingByMouseMove(createdCardCarrier,row)
            // })
            drawDaysToList(videos,false,frames)
            getCountOfEvents(options)
            callback(data)
        }
        shinobiServer.getVideos(options,function(data){
            theList.empty()
            if(data.videos.length === 0 && data.frames.length === 0){
                drawListFiller(lang['No Data'])
            }else{
                drawVideoData(data)
            }
        })
    }
    function getCountOfEvents(options){
        var monitorId = options.monitorId
        var loadedMonitor = loadedMonitors[monitorId]
        options.onlyCount = '1';
        if(!options.startDate)options.startDate = moment().subtract(24, 'hour').utc()._d
        if(!options.endDate)options.endDate = moment().add(1, 'hour').utc()._d
        shinobiServer.getEvents(options,function(data){
            var eventDesignationText = `${lang['All Monitors']}`
            if(monitorId){
                eventDesignationText = `${loadedMonitor ? loadedMonitor.name : monitorId}`
            }
            $('.events_from_last_24_which_monitor').text(eventDesignationText)
            $('.events_from_last_24').text(data.count)
        })
    }
    function onRecentVideosFieldChange(){
        var theSelected = monitorsList.val()
        loadVideos({
            limit: 0,
            monitorId: theSelected || undefined,
        },function(){
            liveStamp()
        })
    }
    monitorsList.change(onRecentVideosFieldChange);
    videoRangeEl.change(onRecentVideosFieldChange);
    peerConnectKeysList.change(function(){
        const { peerConnectKey } = setSelectedPeerConnectKey();
        drawMonitorListToSelector(monitorsList.find('optgroup'),null,null,false,peerConnectKey);
        monitorsList.val("");
        loadVideos({
            limit: 0,
            monitorId: undefined,
        },function(){
            liveStamp()
        });
    })
    theBlock.find('.recent-videos-refresh').click(function(){
        var theSelected = monitorsList.val()
        drawMonitorListToSelector(monitorsList.find('optgroup'))
        monitorsList.val(theSelected)
        loadVideos({
            limit: 0,
            monitorId: theSelected || undefined,
        },function(){
            liveStamp()
        })
    });
    function initDashboard() {
        const firstServer = drawPeerConnectKeysToSelector(peerConnectKeysList,true,null)
        setSelectedPeerConnectKey()
        drawMonitorListToSelector(monitorsList.find('optgroup'),null,null,false,firstServer)
        loadVideos({
            limit: 0,
        },function(){
            liveStamp()
        })
    }
    addOnTabOpen('recentVideos', initDashboard)
    addOnTabReopen('recentVideos', function () {
        var theSelectedServer = peerConnectKeysList.val()
        var theSelected = monitorsList.val()
        theSelectedServer = drawPeerConnectKeysToSelector(peerConnectKeysList,!theSelectedServer,null,theSelectedServer)
        peerConnectKeysList.val(theSelectedServer)
        setSelectedPeerConnectKey()
        theSelected = drawMonitorListToSelector(monitorsList.find('optgroup'),null,null,false,theSelectedServer)
        monitorsList.val(theSelected)
    })
    // addToEventHandler('onDashboardReady', function(){
    //     // openTab('recentVideos', {})
    //     initDashboard()
    // })
})
