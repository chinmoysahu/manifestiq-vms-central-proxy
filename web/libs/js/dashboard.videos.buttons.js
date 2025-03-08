onShinobiWebSocketEvent(function(d, peerConnectKey){
    const shinobiServer = loadedShinobiAPI[peerConnectKey];
    switch(d.f){
        case'video_edit':case'video_archive':
            var video = shinobiServer.loadedVideosInMemory[`${d.mid}${d.time}${d.type}`]
            if(video){
                let filename = `${formattedTimeForFilename(convertTZ(d.time),false,`YYYY-MM-DDTHH-mm-ss`)}.${video.ext || 'mp4'}`
                shinobiServer.loadedVideosInMemory[`${d.mid}${d.time}${d.type}`].status = d.status
                $(`[data-mid="${d.mid}"][data-filename="${filename}"][data-peerconnectkey="${peerConnectKey}"]`).attr('data-status',d.status);
            }
        break;
        case'video_delete':
            d.peerConnectKey = peerConnectKey;
            $(`[data-peerconnectkey="${peerConnectKey}"][file="${d.filename}"][mid="${d.mid}"]:not(.modal)`).remove();
            $(`[data-peerconnectkey="${peerConnectKey}"][data-file="${d.filename}"][data-mid="${d.mid}"]:not(.modal)`).remove();
            $(`[data-peerconnectkey="${peerConnectKey}"][data-time-formed="${(new Date(d.time))}"][data-mid="${d.mid}"]:not(.modal)`).remove();
            var videoPlayerId = getVideoPlayerTabId(d)
            if(tabTree.name === videoPlayerId){
                goBackOneTab()
            }
            deleteTab(videoPlayerId)
        break;
    }
})
$(document).ready(function(){
    $('body')
    .on('click','.open-video',function(e){
        e.preventDefault()
        var _this = this;
        var {
            peerConnectKey,
            monitorId,
            videoTime,
            video,
        } = getVideoInfoFromEl(_this)
        createVideoPlayerTab(video)
        setVideoStatus(video)
        return false;
    })
    .on('click','.delete-video',function(e){
        e.preventDefault()
        var el = $(this).parents('[data-mid]')
        var peerConnectKey = el.attr('data-peerconnectkey')
        var monitorId = el.attr('data-mid')
        var videoTime = el.attr('data-time')
        var videoType = el.attr('data-type')
        loadedShinobiAPI[peerConnectKey].deleteVideoWithConfirm(monitorId, videoTime, videoType)
        return false;
    })
    .on('click','.compress-video',function(e){
        e.preventDefault()
        var el = $(this).parents('[data-mid]')
        var peerConnectKey = el.attr('data-peerconnectkey')
        var monitorId = el.attr('data-mid')
        var videoTime = el.attr('data-time')
        var shinobiServer = loadedShinobiAPI[peerConnectKey];
        shinobiServer.compressVideoWithConfirm(monitorId, videoTime)
        return false;
    })
    .on('click','.download-video',function(e){
        e.preventDefault()
        var _this = this;
        var {
            peerConnectKey,
            monitorId,
            videoTime,
            video,
        } = getVideoInfoFromEl(_this)
        var shinobiServer = loadedShinobiAPI[peerConnectKey];
        shinobiServer.downloadVideo(video)
        return false;
    })
    .on('click','.archive-video',function(e){
        e.preventDefault()
        var el = $(this).parents('[data-mid]')
        var peerConnectKey = el.attr('data-peerconnectkey')
        var monitorId = el.attr('data-mid')
        var videoTime = el.attr('data-time')
        var unarchive = $(this).hasClass('status-archived')
        var shinobiServer = loadedShinobiAPI[peerConnectKey];
        var video = shinobiServer.loadedVideosInMemory[`${monitorId}${videoTime}${undefined}`]
        var ext = video.filename.split('.')
        ext = ext[ext.length - 1]
        if(unarchive){
            shinobiServer.unarchiveVideo(video)
        }else{
            shinobiServer.archiveVideo(video)
        }
        return false;
    })
})
