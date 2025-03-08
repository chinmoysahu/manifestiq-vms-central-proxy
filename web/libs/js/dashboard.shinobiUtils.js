const loadedFramesMemory = {}
const loadedFramesMemoryTimeout = {}
const loadedFramesLock = {}
class shinobiAPI {
    constructor(peerConnectKey, apiKey, groupKey, serverTimezone) {
        this.loadedVideosInMemory = {};
        this.loadedEventsInMemory = {};
        this.loadedFilesInMemory = {};
        this.currentlyArchiving = {};
        this.connectedDetectorPlugins = {};
        this.mainIndicators = {};
        this.addStorageIndicators = {};
        this.uploaderIndicators = {};
        this.peerConnectKey = peerConnectKey;
        this.apiKey = apiKey;
        this.groupKey = groupKey;
        this.serverTimezone = serverTimezone;
        this.apiBasePath = `/s/${peerConnectKey}`
        this.apiBaseUrl = `${shinobiServerHost}${this.apiBasePath}`
        this.origin = `${shinobiServerHost}`
        this.socketIoPath = `${this.apiBasePath}/socket.io`
        // logViewer
        this.logWriterFloodTimeout = null
        this.logWriterFloodCounter = 0
        this.logWriterFloodLock = null
        this.logStreams = {}
        this.logStreamWiggler = {}
        this.logStreamWiggling = {}
        this.logStreamLastTimeEl = {}
    }

    async startWebsocket(userInfo){
        const $user = (userInfo || await this.getUserInfo()).user;
        $user.auth = this.apiKey;
        this.websocket = new shinobiWebSocket({ peerConnectKey: this.peerConnectKey, $user, groupKey: this.groupKey });
        return this.websocket.create();
    }

    async disconnectWebsocket(userInfo){
        try{
            this.websocket.destroy();
        }catch(err){
            console.log(err)
        }
    }

    buildApiPrefix(endpoint) {
        return `${this.apiBaseUrl}/${this.apiKey}/${endpoint}/${this.groupKey}`
    }

    buildAdminApiPrefix(endpoint) {
        return `${this.apiBaseUrl}${this.adminApiPrefix}${endpoint}/${this.groupKey}`
    }

    getUserInfo() {
        const _this = this;
        return new Promise((resolve) => {
            const url = this.buildApiPrefix('userInfo');
            $.getJSON(url, {timestamp: `${new Date()}`}, resolve).fail((err) => {
                console.error(err)
                setTimeout(async () => {
                    resolve(await _this.getUserInfo())
                }, 2000)
            });
        });
    }

    parseUploaders() {
        const uploaders = {}
        this.uploaderFields.info.forEach((uploadFields) => {
            if(uploadFields.simpleUploader)return;
            const humanName = uploadFields.name;
            const uploaderId = uploadFields.uploaderId || uploadFields.info[0].selector.replace('autosave_', '');
            uploaders[uploaderId] = humanName;
        })
        return uploaders
    }

    async getSystemInfo() {
        this.addStorage = await this.getList('addStorage', 'list')
        this.uploaderFields = await this.getList('uploaderFields', 'fields')
        this.uploaders = this.parseUploaders()
        this.adminApiPrefix = `${await this.getAdminApiPrefix()}${this.apiKey}/`
    }

    getMonitorIconPath(monitorId){
        return this.buildApiPrefix('icon') + '/' + monitorId
    }

    applyPeerConnectKeyToRows(theArray){
        const peerConnectKey = this.peerConnectKey;
        theArray.forEach((item, n) => {
            theArray[n].peerConnectKey = peerConnectKey;
        })
        return theArray
    }

    permissionCheck(toCheck,monitorId){
        var details = this.$user.details
        if(details.sub && details.allmonitors === '0'){
            var chosenValue = details[toCheck]
            if(details[toCheck] instanceof Array && chosenValue.indexOf(monitorId) > -1){
                return true
            }else if(chosenValue === '1'){
                return true
            }
        }else{
            return true
        }
        return false
    }

    getTVChannels(monitorId = '') {
        return new Promise((resolve) => {
            const url = `${this.buildApiPrefix('tvChannels')}${monitorId ? `/${monitorId}` : ''}`;
            $.getJSON(url, resolve);
        });
    }

    getMonitors(monitorId = '') {
        return new Promise((resolve) => {
            const _this = this;
            const url = `${this.buildApiPrefix('monitor')}${monitorId ? `/${monitorId}` : ''}`;
            $.ajax({
                url,
                cache: false,
                method: 'GET',
                dataType: 'json',
                timeout: 15000,
                success: (monitors) => {
                    monitors = _this.applyPeerConnectKeyToRows(monitors)
                    resolve(monitors)
                },
                error: (xhr, status, err) => {
                    console.error(err)
                    setTimeout(async () => {
                        resolve(await _this.getMonitors(monitorId))
                    }, 2000)
                }
            });
        });
    }

    getAdminApiPrefix() {
        return new Promise((resolve) => {
            const _this = this;
            const url = `${this.buildApiPrefix('getAdminApiPrefix')}`;
            $.getJSON(url, (data) => {
                resolve(data.adminApiPrefix)
            });
        });
    }

    getApiKey(code){
        return new Promise((resolve) => {
            const _this = this;
            $.getJSON(`${this.buildApiPrefix('api')}/get/${code}`,function(data){
                resolve(data.key)
            }).fail((err) => {
                console.log(err)
                setTimeout(async () => {
                    resolve(await _this.getApiKey(code))
                },1000)
            })
        })
    }

    getApiKeys(){
        return new Promise((resolve) => {
            const _this = this;
            $.getJSON(this.buildApiPrefix('api') + '/list',function(data){
                resolve(data.keys || [])
            }).fail((err) => {
                console.log(err)
                setTimeout(async () => {
                    resolve(await _this.getApiKeys())
                },1000)
            })
        })
    }

    createApiKey(formValues){
        return new Promise((resolve) => {
            const _this = this;
            $.post(this.buildApiPrefix('api') + '/add',{
                data: JSON.stringify(formValues)
            },function(data){
                resolve(data)
            }).fail((err) => {
                console.log(err)
                setTimeout(async () => {
                    resolve(await _this.createApiKey(formValues))
                },1000)
            })
        })
    }

    deleteApiKey(code){
        return new Promise((resolve) => {
            const _this = this;
            $.post(this.buildApiPrefix('api') + '/delete',{
                code: code
            },function(data){
                resolve(data)
            }).fail((err) => {
                console.log(err)
                setTimeout(async () => {
                    resolve(await _this.deleteApiKey(code))
                },1000)
            })
        })
    }

    deleteMonitor(monitorId, filesToo) {
        return new Promise((resolve) => {
            const _this = this;
            const url = `${this.buildApiPrefix('configureMonitor')}/${monitorId}/delete${filesToo ? `?deleteFiles=true` : ''}`;
            $.getJSON(url, (data) => {
                if(data.ok){
                    delete(_this.loadedMonitors[monitorId])
                }
                resolve(data)
            });
        });
    }

    deleteMonitorWithConfirm(monitorId, afterDelete) {
        const _this = this;
        const monitor = this.loadedMonitors[monitorId]
        $.confirm.create({
            title: lang['Delete']+' '+monitor.name,
            body: '<p>'+lang.DeleteMonitorsText+'</p>',
            clickOptions: [
                {
                    title:lang['Delete']+' '+lang['Monitors'],
                    class:'btn-danger',
                    callback: async function(){
                        await _this.deleteMonitor(monitorId, false);
                        if(afterDelete)afterDelete(monitorId)
                    }
                },
                {
                    title:lang['Delete Monitors and Files'],
                    class:'btn-danger',
                    callback: async function(){
                        await _this.deleteMonitor(monitorId, true);
                        if(afterDelete)afterDelete(monitorId)
                    }
                }
            ]
        })
    }

    addApiKey(formValues, uid){
        return new Promise((resolve) => {
            $.post(this.buildApiPrefix('api') + '/add',{
                uid,
                data: JSON.stringify(formValues)
            },function(data){
                if(data.ok){
                    resolve(data.api)
                }
            })
        })
    }

    getApiKeys(uid) {
        return new Promise((resolve) => {
            const _this = this;
            const url = `${this.buildApiPrefix('api')}/list${uid ? `?uid=${uid}` : ''}`;
            $.getJSON(url, async ({ keys }) => {
                keys = _this.applyPeerConnectKeyToRows(keys)
                // if(onlyFullAccessKeys){
                //     keys = keys.filter(key => {
                //         const details = safeJsonParse(key.details);
                //         const
                //         delete(details.treatAsSub);
                //         delete(details.permissionSet);
                //         delete(details.monitorsRestricted);
                //         delete(details.monitorPermissions);
                //         const filtered = (Object.values(details).filter(value => value === '0'));
                //         const hasAccess = filtered.length === 0;
                //         return hasAccess;
                //     })
                //     if(uid && keys.length === 0){
                //         keys.push(await _this.addApiKey({},uid))
                //     }
                // }
                resolve(keys)
            });
        });
    }

    getSubAccounts(uid) {
        return new Promise((resolve) => {
            const _this = this;
            $.getJSON(`${this.buildAdminApiPrefix('accounts')}${uid ? `/${uid}` : ''}`, ({ accounts }) => {
                accounts.forEach((account) => {
                    account.details = safeJsonParse(account.details)
                });
                resolve(uid ? accounts[0] : accounts)
            });
        });
    }

    listPermissions(){
        return new Promise((resolve) => {
            $.getJSON(this.buildApiPrefix('permissions'),function(data){
                resolve(data.permissions)
            })
        })
    }

    toggleSubStream(monitorId,callback){
        var monitor = this.loadedMonitors[monitorId]
        var substreamConfig = monitor.details.substream
        var isSubStreamConfigured = !!substreamConfig.output;
        if(!isSubStreamConfigured){
            new PNotify({
                type: 'warning',
                title: lang['Invalid Settings'],
                text: lang.SubstreamNotConfigured,
            });
            return;
        }
        if(monitor.subStreamToggleLock)return false;
        monitor.subStreamToggleLock = true
        $.getJSON(this.buildApiPrefix('toggleSubstream') + monitorId + (monitor.subStreamActive ? '?action=stop' : ''),function(d){
            monitor.subStreamToggleLock = false
            debugLog(d)
            if(callback)callback()
        })
    }

    runTestDetectionTrigger(monitorId,customData){
        return new Promise((resolve,reject) => {
            var detectionData = Object.assign({
                "plug":"dashboard",
                "name":"Test Object",
                "reason":"object",
                "confidence": 80,
                imgHeight: 640,
                imgWidth: 480,
                matrices: [
                    {
                        x: 15,
                        y: 15,
                        width: 50,
                        height: 50,
                        tag: 'Object Test',
                        confidence: 100,
                    }
                ]
            },customData || {});
            $.getJSON(this.buildApiPrefix('motion') + '/'+monitorId+'/?data=' + JSON.stringify(detectionData),function(d){
                debugLog(d)
                resolve(d)
            })
        })
    }

    getEventRecordings(monitorId) {
        return new Promise((resolve) => {
            const url = `${this.buildApiPrefix('eventRecordings')}/${monitorId}`;
            $.getJSON(url, resolve);
        });
    }

    getFullOrigin(){
        return this.apiBaseUrl
    }

    getFileBinHref(file){
        var href = this.buildApiPrefix('fileBin') + '/' + file.mid + '/' + file.name
        return href
    }

    loadFileData(video){
        const _this = this;
        delete(video.f)
        _this.loadedFilesInMemory[`${video.mid}${video.name}`] = Object.assign({},video,{
            href: _this.getFileBinHref(video),
            filename: video.name,
        })
    }

    getFileBinFiles(monitorId,startDate,endDate){
        const _this = this;
        return new Promise((resolve) => {
            var apiURL = `${_this.buildApiPrefix('fileBin')}${monitorId ? `/${monitorId}` : ''}`;
            var queryString = ['start=' + startDate,'end=' + endDate,'limit=0']
            $.getJSON(apiURL + '?' + queryString.join('&'),function(data){
                _this.loadedFilesInMemory = {}
                $.each(data.files,function(n,file){
                    _this.loadFileData(file)
                });
                resolve(data)
            })
        })
    }

    getVideos(options,callback,noEvents){
        const _this = this;
        return new Promise((resolve,reject) => {
            options = options ? options : {}
            const {
                searchQuery,
                andOnly,
                monitorId,
                archived,
                customVideoSet,
                limit,
                eventLimit,
                doLimitOnFames,
                eventStartTime,
                eventEndTime,
                requestQueries,
            } = getVideoSearchRequestQueries(options);
            $.getJSON(`${_this.buildApiPrefix(customVideoSet ? customVideoSet : searchQuery ? `videosByEventTag` : `videos`)}${monitorId ? `/${monitorId}` : ''}?${requestQueries.concat([limit ? `limit=${limit}` : `noLimit=1`]).join('&')}`,function(data){
                data.videos = _this.applyPeerConnectKeyToRows(data.videos)
                var videos = data.videos.map((video) => {
                    return Object.assign({},video,{
                        href: `${_this.getFullOrigin(true) + video.href}${customVideoSet === 'cloudVideos' ? `?type=${video.type}` : ''}`
                    })
                })
                $.getJSON(`${_this.buildApiPrefix(`timelapse`)}${monitorId ? `/${monitorId}` : ''}?${requestQueries.concat([`noLimit=1`]).join('&')}`,function(timelapseFrames){
                    function completeRequest(eventData){
                        var theEvents = eventData.events || eventData;
                        var newVideos = applyDataListToVideos(videos,theEvents)
                        newVideos = _this.applyTimelapseFramesListToVideos(newVideos,timelapseFrames.frames || timelapseFrames,'timelapseFrames',true).map((video) => {
                            video.videoSet = customVideoSet
                            return video
                        })
                        _this.loadEventsData(theEvents)
                        _this.loadVideosData(newVideos)
                        if(callback)callback({videos: newVideos, frames: timelapseFrames});
                        resolve({videos: newVideos, frames: timelapseFrames})
                    }
                    if(noEvents){
                        completeRequest([])
                    }else{
                        $.getJSON(`${_this.buildApiPrefix(`events`)}${monitorId ? `/${monitorId}` : ''}?${requestQueries.concat([`limit=${eventLimit}`]).join('&')}`,function(eventData){
                            console.log(eventData)
                            // eventData = _this.applyPeerConnectKeyToRows(eventData)
                            completeRequest(eventData)
                        })
                    }
                })
            })
        })
    }

    loadVideosData(newVideos){
        const _this = this;
        $.each(newVideos,function(n,video){
            delete(video.f)
            _this.loadedVideosInMemory[`${video.mid}${video.time}${video.type}`] = video
        })
    }
    loadEventsData(videoEvents){
        const _this = this;
        videoEvents.forEach((anEvent) => {
            _this.loadedEventsInMemory[`${anEvent.mid}${anEvent.time}`] = anEvent
        })
    }
    applyTimelapseFramesListToVideos(videos, events, keyName, reverseList) {
        const thisApiPrefix = this.buildApiPrefix('timelapse') + '/';
        const eventMap = new Map();

        // Build a map of events by monitor ID
        events.forEach(event => {
            if (!eventMap.has(event.mid)) {
                eventMap.set(event.mid, []);
            }
            eventMap.get(event.mid).push(event);
        });

        // Attach timelapse frames to videos
        videos.forEach(video => {
            const videoEvents = eventMap.get(video.mid) || [];
            const matchedEvents = videoEvents.filter(event => {
                const startTime = new Date(video.time);
                const endTime = new Date(video.end);
                const eventTime = new Date(event.time);
                return eventTime >= startTime && eventTime <= endTime;
            });

            if (reverseList) matchedEvents.reverse();

            // Assigning matched events to video
            video[keyName || 'timelapseFrames'] = matchedEvents.map(row => {
                const apiURL = `${thisApiPrefix}${row.mid}`;
                return {
                    ...row,
                    href: `${apiURL}/${row.filename.split('T')[0]}/${row.filename}`
                };
            });
        });

        return videos;
    }

    getDetailedVideos(options,callback,noEvents){
        return new Promise((resolve,reject) => {
            options = options ? options : {}
            const {
                searchQuery,
                monitorId,
                archived,
                customVideoSet,
                limit,
                eventLimit,
                doLimitOnFames,
                eventStartTime,
                eventEndTime,
                requestQueries,
            } = getVideoSearchRequestQueries(options);
            var videoUrl = this.buildApiPrefix(customVideoSet ? customVideoSet : searchQuery ? `videosByEventTag` : `videos`);
            var timelapseUrl = this.buildApiPrefix(`timelapse`);
            var eventsUrl = this.buildApiPrefix(`events`);
            var _this = this;
            $.getJSON(`${videoUrl}${monitorId ? `/${monitorId}` : ''}?${requestQueries.concat([limit ? `limit=${limit}` : `noLimit=1`]).join('&')}`,function(data){
                var videos = _this.applyPeerConnectKeyToRows(data.videos).map((video) => {
                    return Object.assign({},video,{
                        href: _this.apiBaseUrl + video.href
                    })
                });
                $.getJSON(`${timelapseUrl}${monitorId ? `/${monitorId}` : ''}?${requestQueries.concat([`noLimit=1`]).join('&')}`,function(timelapseFrames){
                    function completeRequest(eventData){
                        var theEvents = eventData.events || eventData;
                        var newVideos = applyDataListToVideos(videos,theEvents)
                        newVideos = _this.applyTimelapseFramesListToVideos(newVideos,timelapseFrames.frames || timelapseFrames,'timelapseFrames',true).map((video) => {
                            video.videoSet = customVideoSet
                            return video
                        })
                        _this.loadEventsData(theEvents)
                        _this.loadVideosData(newVideos)
                        if(callback)callback({videos: newVideos, frames: timelapseFrames});
                        resolve({videos: newVideos, frames: timelapseFrames})
                    }
                    if(noEvents){
                        completeRequest([])
                    }else{
                        $.getJSON(`${eventsUrl}${monitorId ? `/${monitorId}` : ''}?${requestQueries.concat([`limit=${eventLimit}`]).join('&')}`,function(eventData){
                            completeRequest(eventData)
                        })
                    }
                })
            })
        })
    }

    deleteVideo(video){
        return new Promise((resolve,reject) => {
            var apiEndpoint = `${this.buildApiPrefix(`videos`)}/${video.mid}/${video.filename}/delete`
            $.getJSON(apiEndpoint,function(data){
                notifyIfActionFailed(data)
                resolve(data)
            })
        })
    }

    deleteVideoWithConfirm(monitorId, videoTime, videoType){
        var video = this.loadedVideosInMemory[`${monitorId}${videoTime}${videoType}`]
        var videoSet = video.videoSet
        var ext = video.filename.split('.')
        ext = ext[ext.length - 1]
        var isCloudVideo = videoSet === 'cloudVideos'
        var videoEndpoint = this.buildApiPrefix(videoSet || 'videos') + '/' + video.mid + '/' + video.filename
        var endpointType = isCloudVideo ? `?type=${video.type}` : ''
        $.confirm.create({
            title: lang["Delete Video"] + ' : ' + video.filename,
            body: `${lang.DeleteVideoMsg}<br><br><div class="row"><video class="video_video" autoplay loop controls><source src="${videoEndpoint}${endpointType}" type="video/${ext}"></video></div>`,
            clickOptions: {
                title: '<i class="fa fa-trash-o"></i> ' + lang.Delete,
                class: 'btn-danger btn-sm'
            },
            clickCallback: function(){
                $.getJSON(videoEndpoint + '/delete' + endpointType,function(data){
                    if(data.ok){
                        console.log('Video Deleted')
                    }else{
                        console.log('Video Not Deleted',data,videoEndpoint + endpointType)
                    }
                })
            }
        });
    }

    compressVideoWithConfirm(monitorId, videoTime, videoType = undefined){
        var video = this.loadedVideosInMemory[`${monitorId}${videoTime}${videoType}`]
        var ext = video.filename.split('.')
        ext = ext[ext.length - 1]
        var videoEndpoint = this.buildApiPrefix(`videos`) + '/' + video.mid + '/' + video.filename
        $.confirm.create({
            title: lang["Compress"] + ' : ' + video.filename,
            body: `${lang.CompressVideoMsg}<br><br><div class="row"><video class="video_video" autoplay loop controls><source src="${videoEndpoint}" type="video/${ext}"></video></div>`,
            clickOptions: {
                title: '<i class="fa fa-compress"></i> ' + lang.Compress,
                class: 'btn-primary btn-sm'
            },
            clickCallback: function(){
                compressVideo(video)
            }
        });
    }

    async deleteVideos(videos){
        for (let i = 0; i < videos.length; i++) {
            var video = videos[i];
            await this.deleteVideo(video)
        }
    }

    downloadVideo(video){
        new PNotify({ title: `${lang['Downloading...']} : ${video.filename}`, text: lang['Please Wait...'], type: 'info' })
        return downloadFile(video.href,video.filename)
    }

    async downloadVideos(videos){
        var _this = this;
        for (let i = 0; i < videos.length; i++) {
            var video = videos[i];
            await _this.downloadVideo(video)
        }
    }

    getEvents(options,callback){
        return new Promise((resolve,reject) => {
            options = options ? options : {}
            var requestQueries = []
            var monitorId = options.monitorId
            var limit = options.limit || 5000
            var eventStartTime
            var eventEndTime
            // var startDate = options.startDate
            // var endDate = options.endDate
            if(options.startDate){
                eventStartTime = formattedTimeForFilename(options.startDate,false)
                requestQueries.push(`start=${eventStartTime}`)
            }
            if(options.endDate){
                eventEndTime = formattedTimeForFilename(options.endDate,false)
                requestQueries.push(`end=${eventEndTime}`)
            }
            if(options.onlyCount){
                requestQueries.push(`onlyCount=1`)
            }
            $.getJSON(`${this.buildApiPrefix(`events`)}${monitorId ? `/${monitorId}` : ''}?${requestQueries.join('&')}`,function(eventData){
                var theEvents = eventData.events || eventData
                if(callback)callback(theEvents)
                resolve(theEvents)
            })
        })
    }

    getTimelapseFrames(monitorId,startDate,endDate,limit) {
        return new Promise((resolve,reject) => {
            if(!monitorId || !startDate || !endDate){
                console.log(new Error(`getTimelapseFrames error : Failed to get proper params`))
                resolve([])
                return
            }
            var queryString = [
                'start=' + startDate,
                'end=' + endDate,
                limit === 'noLimit' ? `noLimit=1` : limit ? `limit=${limit}` : `limit=50`
            ]
            var apiURL = `${this.buildApiPrefix('timelapse')}${monitorId ? `/${monitorId}` : ''}`
            $.getJSON(apiURL + '?' + queryString.join('&'),function(data){
                $.each(data,function(n,fileInfo){
                    fileInfo.href = apiURL + '/' + fileInfo.filename.split('T')[0] + '/' + fileInfo.filename
                })
                resolve(data)
            })
        })
    }

    getLogs(start, end, monitorId = '', limit = 50) {
        return new Promise((resolve) => {
            const url = `${this.buildApiPrefix('logs')}${monitorId ? `/${monitorId}` : ''}?start=${start}&end=${end}&limit=${limit}`;
            $.getJSON(url, resolve);
        });
    }

    getVideosCount(start, end, monitorId = '', getCloudVideos) {
        return new Promise((resolve) => {
            const url = `${this.buildApiPrefix(getCloudVideos ? 'cloudVideos' : 'videos')}${monitorId ? `/${monitorId}` : ''}?start=${start}&end=${end}&onlyCount=1`;
            $.getJSON(url, resolve);
        });
    }

    getEventCountStatus(monitorId) {
        return new Promise((resolve) => {
            const url = `${this.buildApiPrefix('eventCountStatus')}/${monitorId}`;
            $.getJSON(url, resolve);
        });
    }

    mergeVideos(videos) {
        return new Promise((resolve) => {
            $.post(`${this.buildApiPrefix('mergeVideos')}`, { videos }, resolve, 'json');
        });
    }

    uploadVideo(videoFile, monitorId) {
        const formData = new FormData();
        formData.append('video', videoFile);

        return new Promise((resolve) => {
            $.ajax({
                url: `${this.buildApiPrefix('videos')}/${monitorId}`,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: resolve,
                dataType: 'json'
            });
        });
    }

    editAccount(accountData) {
        return new Promise((resolve) => {
            $.post(`${this.buildApiPrefix('accounts')}/edit`, accountData, resolve, 'json');
        });
    }

    setMode(monitorId, mode) {
        const _this = this;
        return new Promise((resolve) => {
            $.getJSON(`${_this.buildApiPrefix('monitor')}/${monitorId}/${mode}`,function(data){
                resolve(data)
            }).fail((err) => {
                console.log('Failed Mode Change Trying Again...', monitorId)
                _this.setMode(monitorId, mode).then(resolve)
            })
        });
    }

    archiveVideo(video,unarchive,isFileBin){
        return new Promise((resolve) => {
            var _this = this;
            var videoEndpoint = this.buildApiPrefix(isFileBin ? `fileBin` : `videos`) + '/' + video.mid + '/' + (isFileBin ? video.name : video.filename)
            // var currentlyArchived = video.archive === 1
            if(this.currentlyArchiving[videoEndpoint]){
                resolve({ok: false})
                return;
            }
            this.currentlyArchiving[videoEndpoint] = true
            $.getJSON(videoEndpoint + '/archive' + `${unarchive ? `?unarchive=1` : ''}`,function(data){
                if(data.ok){
                    var archiveButtons = getArchiveButtons(video,isFileBin)
                    var classToRemove = 'btn-default'
                    var classToAdd = 'btn-success status-archived'
                    var iconToRemove = 'fa-unlock-alt'
                    var iconToAdd = 'fa-lock'
                    var elTitle = `${lang.Unarchive}`
                    if(!data.archived){
                        console.log('Video Unarchived',unarchive)
                        classToRemove = 'btn-success status-archived'
                        classToAdd = 'btn-default'
                        iconToRemove = 'fa-lock'
                        iconToAdd = 'fa-unlock-alt'
                        elTitle = `${lang.Archive}`
                    }else{
                        console.log('Video Archived',unarchive)
                    }
                    archiveButtons.removeClass(classToRemove).addClass(classToAdd).attr('title',elTitle)
                    archiveButtons.find('i').removeClass(iconToRemove).addClass(iconToAdd)
                    archiveButtons.find('span').text(elTitle)
                    video.archive = data.archived ? 1 : 0
                }else{
                    console.log('Video Archive status unchanged',data,videoEndpoint)
                }
                delete(_this.currentlyArchiving[videoEndpoint])
                resolve(data)
            })
        })
    }
    async archiveVideos(videos){
        for (let i = 0; i < videos.length; i++) {
            var video = videos[i];
            await archiveVideo(video)
        }
    }
    unarchiveVideo(video){
        return this.archiveVideo(video,true)
    }
    async unarchiveVideos(videos){
        for (let i = 0; i < videos.length; i++) {
            var video = videos[i];
            await this.unarchiveVideo(video)
        }
    }

    convertTZ(date) {
        return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: this.serverTimezone}));
    }

    getSelectedTime(dateSelector){
        var dateRange = dateSelector.data('daterangepicker')
        var clonedStartDate = dateRange.startDate.clone()
        var clonedEndDate = dateRange.endDate.clone()
        var isNotValidDate = !clonedStartDate._d || this.convertTZ(clonedStartDate._d) == 'Invalid Date';
        var startDate = moment(isNotValidDate ? this.convertTZ(clonedStartDate) : this.convertTZ(clonedStartDate._d))
        var endDate = moment(isNotValidDate ? this.convertTZ(clonedEndDate) : this.convertTZ(clonedEndDate._d))
        var stringStartDate = startDate.format('YYYY-MM-DDTHH:mm:ss')
        var stringEndDate = endDate.format('YYYY-MM-DDTHH:mm:ss')
        if(isNotValidDate){
            console.error(`isNotValidDate detected, Didn't use ._d`,startDate,endDate,new Error());
        }
        return {
            startDateMoment: startDate,
            endDateMoment: endDate,
            startDate: stringStartDate,
            endDate: stringEndDate
        }
    }
    buildDefaultVideoMenuItems(file,options){
        var isLocalVideo = !file.videoSet || file.videoSet === 'videos'
        var href = file.href + `${!isLocalVideo ? `?type=${file.type}` : ''}`
        options = options ? options : {play: true}
        console.log('videoEndpoint',href)
        return `
            <li><a class="dropdown-item download-video" href="${href}">${lang.Download}</a></li>
            ${options.play ? `<li><a class="dropdown-item open-video" href="${href}">${lang.Play}</a></li>` : ``}
            <li><hr class="dropdown-divider"></li>
            ${isLocalVideo && this.permissionCheck('video_delete',file.mid) ? `<li><a class="dropdown-item open-video-studio" href="${href}">${lang.Slice}</a></li>` : ``}
            ${this.permissionCheck('video_delete',file.mid) ? `<li><a class="dropdown-item delete-video" href="${href}">${lang.Delete}</a></li>` : ``}
            ${isLocalVideo && this.permissionCheck('video_delete',file.mid) ? `<li><a class="dropdown-item compress-video" href="${href}">${lang.Compress}</a></li>` : ``}
        `
    }
    compressVideo(video,callback){
        if(video.filename.includes('.webm')){
            console.log('Already Compressed')
            if(callback)callback('Already Compressed')
            return
        }
        return new Promise((resolve) => {
            var videoEndpoint = this.buildApiPrefix(`videos`) + '/' + video.mid + '/' + video.filename
            $.getJSON(videoEndpoint + '/compress',function(data){
                if(data.ok){
                    console.log('Video Compressing')
                }else{
                    console.log('Video Not Compressing',data,videoEndpoint)
                }
                if(callback)callback()
                resolve()
            })
        })
    }
    async compressVideos(videos){
        for (let i = 0; i < videos.length; i++) {
            var video = videos[i];
            await compressVideo(video)
        }
    }
    mergeVideosAndBin(options,callback){
        const {
            searchQuery,
            monitorId,
            archived,
            customVideoSet,
            limit,
            eventLimit,
            doLimitOnFames,
            eventStartTime,
            eventEndTime,
            requestQueries,
        } = getVideoSearchRequestQueries(options);
        const videos = options.videos.map(video => {
            const newVideo = {
                ke: video.ke,
                mid: video.mid,
                time: video.time,
                end: video.end,
                ext: video.ext,
                saveDir: video.saveDir,
                details: video.details,
            };
            delete(newVideo.timelapseFrames)
            return newVideo
        });
        console.log(videos)
        return new Promise((resolve) => {
            $.post(`${this.buildApiPrefix(`mergeVideos`)}${monitorId ? `/${monitorId}` : ''}?${requestQueries.concat([limit ? `limit=${limit}` : `noLimit=1`]).join('&')}`, {
                videos,
            },function(data){
                resolve(data)
            })
        })
    }

    buildStreamUrl(monitorId){
        var _this = this;
        var monitor = this.loadedMonitors[monitorId]
        var streamURL = ''
        var streamType = safeJsonParse(monitor.details).stream_type
        switch(streamType){
            case'jpeg':
                streamURL = _this.buildApiPrefix(`jpeg`) + '/' + monitorId + '/s.jpg'
            break;
            case'mjpeg':
                streamURL = _this.buildApiPrefix(`mjpeg`) + '/' + monitorId
            break;
            case'hls':
                streamURL = _this.buildApiPrefix(`hls`) + '/' + monitorId + '/s.m3u8'
            break;
            case'flv':
                streamURL = _this.buildApiPrefix(`flv`) + '/' + monitorId + '/s.flv'
            break;
            case'mp4':
                streamURL = _this.buildApiPrefix(`mp4`) + '/' + monitorId + '/s.mp4'
            break;
            case'b64':
                streamURL = 'Websocket'
            break;
            case'useSubstream':
                streamURL = lang['Use Substream']
            break;
        }
        if(!streamURL){
            $.each(onBuildStreamUrlExtensions,function(n,extender){
                console.log(extender)
                streamURL = extender(streamType,monitorId)
            })
        }
        return streamURL
    }
    buildFileBinUrl(data){
        return this.buildApiPrefix(`fileBin`) + '/' + data.mid + '/' + data.name
    }

    async configureMonitor(monitorConfig){
        const _this = this;
        return new Promise((resolve) => {
            const monitorId = monitorConfig.mid;
            $.ajax({
                url: `${_this.buildApiPrefix('configureMonitor')}/${monitorId}`,
                method: 'POST',
                dataType: 'json',
                data: {data: JSON.stringify(monitorConfig, null, 3)},
                timeout: 1000 * 60 * 5,
                success: function(d) {
                    resolve(d);
                },
                error: async function(xhr, status, error) {
                    console.error("Request failed:", status, error);
                    resolve(await _this.configureMonitor(monitorConfig))
                }
            });
        })
    }
    async importMonitor(textData){
        try{
            var _this = this;
            var parsedData = textData instanceof Object ? textData : safeJsonParse(mergeConcattedJsonString(textData))
            //shinobi one monitor
            if(parsedData.mid){
                await _this.configureMonitor(parsedData)
            }else
            //shinobi multiple monitors
            if(parsedData[0] && parsedData[0].mid){
                for(monitor of parsedData){
                    await _this.configureMonitor(monitor)
                }
            }
        }catch(err){
            //#EXTM3U
            if(textData instanceof String && textData.indexOf('#EXTM3U') > -1 && textData.indexOf('{"') === -1){
                importM3u8Playlist(textData)
            }else{
                console.error(err)
                new PNotify({
                    title: lang['Invalid JSON'],
                    text: lang.InvalidJSONText,
                    type: 'error'
                })
            }
        }
    }
    getList(target, param = 'list', defaultVal = []){
        return new Promise((resolve) => {
            $.get(this.buildApiPrefix(target), {timestamp: `${new Date()}`},function(data){
                var theList = data[param] || defaultVal;
                resolve(theList)
            }).fail((err) => {
                console.error(err)
                setTimeout(async () => {
                    resolve(await _this.getList(target, param, defaultVal))
                }, 2000)
            });
        })
    }
    // day card >>>
    bindFrameFindingByMouseMoveForDay(createdCardCarrier,dayKey,videos,allFrames){
        const _this = this;
        var stripTimes = getStripStartAndEnd(videos,allFrames)
        var dayStart = stripTimes.start
        var dayEnd = stripTimes.end
        var createdCardElement = createdCardCarrier.find('.video-time-card')
        var timeImg = createdCardElement.find('.video-time-img')
        var rowHeader = createdCardElement.find('.video-time-header')
        var timeStrip = createdCardElement.find('.video-time-strip')
        var timeNeedleSeeker = createdCardElement.find('.video-time-needle-seeker')
        var firstFrameOfDay = allFrames[0] || null
        $.each(videos,function(day,video){
            $.each(video.timelapseFrames,function(day,frame){
                if(!firstFrameOfDay)firstFrameOfDay = frame;
            })
        })
        if(!firstFrameOfDay){
            timeImg.remove()
            rowHeader.css('position','initial')
        }else{
            timeImg.attr('src',firstFrameOfDay.href)
        }
        var videoSlices = createdCardElement.find('.video-day-slice')
        var videoTimeLabel = createdCardElement.find('.video-time-label')
        var currentlySelected = videos[0]
        var currentlySelectedFrame = null
        var reversedVideos = ([]).concat(videos).reverse();
        function onSeek(evt, isTouch){
            var offest = createdCardElement.offset()
            var elementWidth = createdCardElement.width() + 2
            var amountMoved = (isTouch ? evt.originalEvent.touches[0] : evt).pageX - offest.left
            var percentMoved = amountMoved / elementWidth * 100
            percentMoved = percentMoved > 100 ? 100 : percentMoved < 0 ? 0 : percentMoved
            var videoFound = videos[0] ? getVideoFromDay(percentMoved,reversedVideos,dayStart,dayEnd) : null
            createdCardElement.find(`[data-time]`).css('background-color','')
            if(videoFound){
                if(currentlySelected && currentlySelected.time !== videoFound.time){
                    timeNeedleSeeker.attr('video-time-seeked-video-position',videoFound.time)
                }
                currentlySelected = Object.assign({},videoFound)
            }
            // draw frame
            var result = getFrameOnVideoRow(percentMoved,{
                time: dayStart,
                end: dayEnd,
                timelapseFrames: allFrames,
            })
            var frameFound = result.foundFrame
            videoTimeLabel.text(formattedTime(result.timeAdded,'hh:mm:ss AA, DD-MM-YYYY'))
            if(frameFound){
                currentlySelectedFrame = Object.assign({},frameFound)
                setTimeout(async function(){
                    var frameUrl = await getLocalTimelapseImageLink(frameFound.href)
                    if(frameUrl && currentlySelectedFrame.time === frameFound.time)timeImg.attr('src',frameUrl);
                },1)
            }
            timeNeedleSeeker.attr('video-slice-seeked',result.timeInward).css('left',`${percentMoved}%`)
        }
        createdCardElement.on('mousemove',function(evt){
            onSeek(evt, false)
        })
        createdCardElement.on('touchmove',function(evt){
            onSeek(evt, true)
        })
        createdCardElement.on('click','[video-time-seeked-video-position]',function(){
            var el = $(this)
            var monitorId = el.attr('data-mid')
            var videoTime = el.attr('video-time-seeked-video-position')
            var timeInward = (parseInt(el.attr('video-slice-seeked')) / 1000) - 2
            var video = _this.loadedVideosInMemory[`${monitorId}${videoTime}${undefined}`]
            timeInward = timeInward < 0 ? 0 : timeInward
            createVideoPlayerTab(video,timeInward)
        })
    }
    createDayCard(videos,frames,dayKey,monitorId,classOverride){
        const _this = this;
        var html = ''
        var eventMatrixHtml = ``
        var stripTimes = getStripStartAndEnd(videos,frames)
        var startTime = stripTimes.start
        var endTime = stripTimes.end
        var firstVideoTime = videos[0] ? videos[0].time : null
        var dayParts = formattedTime(startTime).split(' ')[1].split('-')
        var day = dayParts[2]
        var month = dayParts[1]
        var year = dayParts[0]
        $.each(videos,function(n,row){
            var nextRow = videos[n + 1]
            var marginRight = !!nextRow ? getVideoPercentWidthForDay({time: row.end, end: nextRow.time},videos,frames) : 0;
            eventMatrixHtml += `<div class="video-day-slice" data-mid="${row.mid}" data-time="${row.time}" style="width:${getVideoPercentWidthForDay(row,videos,frames)}%;position:relative">`
            if(row.events && row.events.length > 0){
                $.each(row.events,function(n,theEvent){
                    var leftPercent = getPercentOfTimePositionFromVideo(row,theEvent)
                    eventMatrixHtml += `<div class="video-time-needle video-time-needle-event" style="margin-left:${leftPercent}%"></div>`
                })
            }
            eventMatrixHtml += `</div>`
            eventMatrixHtml += `<div class="video-day-slice-spacer" style="width: ${marginRight}%"></div>`
        })
        html += `
        <div class="video-row ${classOverride ? classOverride : `col-md-12 col-lg-6 mb-3`} search-row">
            <div class="video-time-card border border-2 border-dark shadow-sm px-0">
                <div class="video-time-header">
                    <div class="d-flex flex-row vertical-center">
                        <div class="flex-grow-1 p-3">
                            <b>${_this.loadedMonitors[monitorId] ? _this.loadedMonitors[monitorId].name : monitorId}</b>
                            <div>
                                <span class="video-time-label">${formattedTime(startTime)} to ${formattedTime(endTime)}</span>
                            </div>
                        </div>
                        <div class="text-right p-3" style="background:rgba(0,0,0,0.5)">
                            <div class="text-center" style="font-size:20pt;font-weight:bold">${day}</div>
                            <div>${month}, ${year}</div>
                        </div>
                    </div>
                </div>
                <div class="text-center">
                    <img class="video-time-img">
                </div>
                <div class="video-time-strip card-footer p-0">
                    <div class="flex-row d-flex" style="height:30px">${eventMatrixHtml}</div>
                    <div class="video-time-needle video-time-needle-seeker" ${firstVideoTime ? `video-time-seeked-video-position="${firstVideoTime}"` : ''} data-mid="${monitorId}"></div>
                </div>
            </div>
        </div>`
        return html
    }
    sortFramesByDays(frames){
        var days = {}
        var thisApiPrefix = this.buildApiPrefix('timelapse') + '/'
        frames.forEach(function(frame){
            var frameTime = new Date(frame.time)
            var theDayKey = `${frameTime.getDate()}-${frameTime.getMonth()}-${frameTime.getFullYear()}`
            if(!days[frame.mid])days[frame.mid] = {};
            if(!days[frame.mid][theDayKey])days[frame.mid][theDayKey] = [];
            var apiURL = thisApiPrefix + frame.mid
            frame.href = apiURL + '/' + frame.filename.split('T')[0] + '/' + frame.filename
            days[frame.mid][theDayKey].push(frame)
        })
        return days
    }
    // day card />>
    buildLogRow(v){
        var monitor = this.loadedMonitors[v.mid]
        var humanMonitorName = monitor ? monitor.name + ` (${monitor.mid}) : ` : ''
        var html = ''
        html += `<div class="log-item card border-1 border-info shadow-lg mb-3 px-0 btn-default search-row">
            <div class="card-header">
                <small>${humanMonitorName}${v.info && v.info.type ? v.info.type : v.mid}</small>
            </div>
            <div class="card-body">
                <div class="msg-tree">${jsonToHtmlBlock(v.info.msg)}</div>
            </div>
            <div class="card-footer">
                <small class="text-muted">${formattedTime(v.time)}</small>
            </div>
        </div>`
        return html
    }
    buildLogTableRow(item){
        var monitor = this.loadedMonitors[item.mid]
        var humanMonitorName = monitor ? monitor.name + ` (${monitor.mid}) : ` : lang.User
        var html = ''
        html += `<tr class="log-item search-row">
            <td>
                ${item.time}
            </td>
            <td>
                ${humanMonitorName}
            </td>
            <td>
                ${item.info.type}
            </td>
            <td>
                <div class="pre-inline text-white mb-0">${jsonToHtmlBlock(item.info.msg || {})}</div>
            </td>
        </tr>`
        return html
    }
    shakeLogWriterMonitorIcon(monitorId){
        var _this = this;
        if(this.logStreamWiggling[monitorId])return;
        var theWiggler = this.logStreamWiggler[monitorId];
        theWiggler.addClass('animate-shake text-yellow')
        this.logStreamWiggling[monitorId] = setTimeout(function(){
            _this.logStreamWiggling[monitorId] = null;
            theWiggler.removeClass('animate-shake text-yellow')
        },3000)
    }
    removeLogRows(logElements){
        logElements.each(function(n,v){
            var theRows = logElements.find('.log-item')
            if(theRows.length > 10){
                theRows.last().remove()
            }
        })
    }

    logWriterDraw(monitorId,data){
        if(!data.time)data.time = formattedTime();
        var isUserLog = monitorId === '$USER'
        var logType = isUserLog ? '_USER' : monitorId
        var logElement = this.logStreams[logType];
        var html = this.buildLogRow({
            ke: data.ke,
            mid: data.mid,
            info: data.log,
            time: data.time,
        })
        shakeLogWriterIcon()
        try{
            this.shakeLogWriterMonitorIcon(logType)
            logElement.prepend(html)
            this.removeLogRows(logElement)
            if(tabTree.name === 'monitorSettings' && monitorEditorSelectedMonitor.mid === monitorId){
                monitorLogStreamElement.prepend(html)
                this.removeLogRows(monitorLogStreamElement)
            }
            this.logStreamLastTimeEl[monitorId].text(formattedTime(new Date(), true))
        }catch(err){
            // console.log(`Failed Log Write`, data)
        }
    }

    buildEmbedUrl(monitor){
        var monitorId = monitor.mid;
        var streamURL = `${this.buildApiPrefix(`embed`)}/${monitorId}/fullscreen|jquery|gui|relative?host=${this.apiBasePath}/`
        return streamURL;
    }
}
function restartUnitConnection(peerConnectKey){
    sendToSocket({
        f: 'restartConnection',
        peerConnectKey,
    })
}
function drawMonitorListToSelector(jqTarget,selectFirst,showId,addAllMonitorsOption,peerConnectKey){
    var html = ''
    $.each(getLoadedMonitorsAlphabetically(peerConnectKey),function(n,v){
        html += createOptionHtml({
            value: v.mid,
            label: v.name + (showId === 'host' ? ` (${v.host})` : showId ? ` (${v.mid})` : ''),
        })
    })
    addAllMonitorsOption ? jqTarget.html(`
        <option value="">${lang['All Monitors']}</option>
        <optgroup label="${lang.Monitors}">${html}</optgroup>
    `) : jqTarget.html(html);
    if(selectFirst){
        jqTarget
        .find('option')
        .first()
        .prop('selected',true)
        .parent()
        .change()
    }
    var selected = jqTarget.find('option:selected')
    return selected.length > 0 ? selected.first().val() : jqTarget.find('option').first().val();
}
function drawPeerConnectKeysToSelector(jqTarget, selectFirst, showId, selectThis){
    var html = ''
    $.each(getPeerConnectKeysAlphabetically(),function(n,peerConnectKey){
        html += createOptionHtml({
            selected: selectThis === peerConnectKey,
            value: peerConnectKey,
            label: loadedIdentifiers[peerConnectKey].name || peerConnectKey,
        })
    });
    jqTarget.html(html);
    if(selectFirst){
        jqTarget
        .find('option')
        .first()
        .prop('selected',true)
        // .parent()
        // .change()
    }
    return selectThis || jqTarget.find('option').first().val();
}
function getLoadedMonitorsAlphabetically(peerConnectKey){
    var monitors = []
    if(peerConnectKey){
        monitors = Object.values(loadedMonitorsByServer[peerConnectKey])
    }else{
        for(monitorList of Object.values(loadedMonitorsByServer)){
            var anArray = monitorList instanceof Array ? monitorList : Object.values(monitorList)
            monitors.push(...anArray)
        }
    }
    return alphabetizeArray(monitors)
}
function getPeerConnectKeysAlphabetically(peerConnectKey){
    return alphabetizeArray(Object.keys(loadedServers))
}
function getVideoSearchRequestQueries(options){
    var searchQuery = options.searchQuery
    var requestQueries = []
    var monitorId = options.monitorId
    var archived = options.archived
    var customVideoSet = options.customVideoSet
    var limit = options.limit
    var eventLimit = options.eventLimit || 300
    var doLimitOnFames = options.doLimitOnFames || false
    var eventStartTime
    var eventEndTime
    if(options.startDate){
        eventStartTime = formattedTimeForFilename(options.startDate,false)
        requestQueries.push(`start=${eventStartTime}`)
    }
    if(options.endDate){
        eventEndTime = formattedTimeForFilename(options.endDate,false)
        requestQueries.push(`end=${eventEndTime}`)
    }
    if(searchQuery){
        requestQueries.push(`search=${searchQuery}`)
    }
    if(archived){
        requestQueries.push(`archived=1`)
    }
    return {
        searchQuery,
        monitorId,
        archived,
        customVideoSet,
        limit,
        eventLimit,
        doLimitOnFames,
        eventStartTime,
        eventEndTime,
        requestQueries,
    }
}
function applyDataListToVideos(videos, events, keyName, reverseList) {
    const eventMap = new Map();

    // Build a map of events by monitor ID
    events.forEach(event => {
        if (!eventMap.has(event.mid)) {
            eventMap.set(event.mid, []);
        }
        eventMap.get(event.mid).push(event);
    });

    // Attach events to videos
    videos.forEach(video => {
        const videoEvents = eventMap.get(video.mid) || [];
        const matchedEvents = videoEvents.filter(event => {
            const startTime = new Date(video.time);
            const endTime = new Date(video.end);
            const eventTime = new Date(event.time);
            return eventTime >= startTime && eventTime <= endTime;
        });

        if (reverseList) matchedEvents.reverse();

        video[keyName || 'events'] = matchedEvents;
    });

    return videos;
}
function getDisplayDimensions(videoElement) {
  var actualVideoWidth = videoElement.videoWidth;
  var actualVideoHeight = videoElement.videoHeight;
  var elementWidth = videoElement.offsetWidth;
  var elementHeight = videoElement.offsetHeight;
  var actualVideoAspect = actualVideoWidth / actualVideoHeight;
  var elementAspect = elementWidth / elementHeight;
  var displayWidth, displayHeight;
  if (actualVideoAspect > elementAspect) {
    displayWidth = elementWidth;
    displayHeight = elementWidth / actualVideoAspect;
  } else {
    displayHeight = elementHeight;
    displayWidth = elementHeight * actualVideoAspect;
  }
  return {
    videoWidth: displayWidth,
    videoHeight: displayHeight,
  };
}
function setVideoStatus(video,toStatus){
    return new Promise((resolve,reject) => {
        toStatus = toStatus || 2
        if(video.status != toStatus){
            $.get(`${video.actionUrl}/status/${toStatus}`,function(data){
                resolve(data)
            })
        }
    })
}
function createVideoLinks(video, options, apiPrefix){
    var details = safeJsonParse(video.details)
    var queryString = []
    // if(details.isUTC === true){
    //     queryString.push('isUTC=true')
    // }else{
    //     video.time = s.utcToLocal(video.time)
    //     video.end = s.utcToLocal(video.end)
    // }
    if(queryString.length > 0){
        queryString = '?' + queryString.join('&')
    }else{
        queryString = ''
    }
    video.ext = video.ext ? video.ext : 'mp4'
    if(details.type === 'googd'){
        video.href = undefined
    }else if(!video.ext && video.href){
        video.ext = video.href.split('.')
        video.ext = video.ext[video.ext.length - 1]
    }
    video.filename = formattedTimeForFilename(convertTZ(video.time, serverTimezone),null,`YYYY-MM-DDTHH-mm-ss`) + '.' + video.ext;
    var href = apiPrefix + '/'+video.mid+'/'+video.filename;
    video.actionUrl = href
    video.links = {
        deleteVideo : href+'/delete' + queryString,
        changeToUnread : href+'/status/1' + queryString,
        changeToRead : href+'/status/2' + queryString
    }
    if(!video.href || options.hideRemote === true)video.href = href + queryString
    video.details = details
    return video
}
function getLocalTimelapseImageLink(imageUrl){
    if(loadedFramesLock[imageUrl]){
        return null;
    }else if(loadedFramesMemory[imageUrl]){
        return loadedFramesMemory[imageUrl]
    }else{
        loadedFramesLock[imageUrl] = true
        return new Promise((resolve,reject) => {
            fetch(imageUrl)
              .then(res => res.blob()) // Gets the response and returns it as a blob
              .then(blob => {
                var objectURL = URL.createObjectURL(blob);
                loadedFramesMemory[imageUrl] = objectURL
                clearTimeout(loadedFramesMemoryTimeout[imageUrl])
                loadedFramesMemoryTimeout[imageUrl] = setTimeout(function(){
                    URL.revokeObjectURL(objectURL)
                    delete(loadedFramesMemory[imageUrl])
                    delete(loadedFramesMemoryTimeout[imageUrl])
                },1000 * 60 * 10);
                loadedFramesLock[imageUrl] = false;
                resolve(objectURL);
            }).catch((err) => {
                resolve()
            });
        })
    }
}
async function preloadAllTimelapseFramesToMemoryFromVideoList(framesSortedByDays){
    async function syncWait(waitTime){
        return new Promise((resolve,reject) => {
            setTimeout(function(){
                resolve()
            },waitTime)
        })
    }
    for (let ii = 0; ii < framesSortedByDays.length; ii++) {
        var frame = framesSortedByDays[ii]
        console.log ('Loading... ',frame.href)
        await syncWait(50)
        await getLocalTimelapseImageLink(frame.href)
        console.log ('Loaded! ',frame.href)
    }
}
function drawVideoRowsToList(targetElement,rows){
    var theVideoList = $(targetElement)
    theVideoList.empty()
    $.each(rows,function(n,row){
        theVideoList.append(createVideoRow(row))
    })
    liveStamp()
}
function getArchiveButtons(video,isFileBin){
    return $(`[data-mid="${video.mid}"][data-ke="${video.ke}"][data-time="${video.time}"] .archive-${isFileBin ? `file` : 'video'}`)
}
function getVideoInfoFromEl(_this){
    var el = $(_this).parents('[data-mid]')
    var peerConnectKey = el.attr('data-peerconnectkey')
    var monitorId = el.attr('data-mid')
    var videoTime = el.attr('data-time')
    var videoType = el.attr('data-type')
    console.log(peerConnectKey)
    var shinobiServer = loadedShinobiAPI[peerConnectKey];
    var video = shinobiServer.loadedVideosInMemory[`${monitorId}${videoTime}${videoType}`]
    return {
        peerConnectKey,
        monitorId,
        videoTime,
        videoType,
        video,
    }
}
// day cards >>>
function createVideoRow(row,classOverride){
    const peerConnectKey = row.peerConnectKey;
    const shinobiServer = loadedShinobiAPI[peerConnectKey]
    var objectTagsHtml = ``
    var eventMatrixHtml = ``
    if(row.objects && row.objects.length > 0){
        $.each(row.objects.split(','),function(n,objectTag){
            eventMatrixHtml += `<span class="badge badge-primary badge-sm">${objectTag}</span>`
        })
    }
    if(row.events && row.events.length > 0){
        $.each(row.events,function(n,theEvent){
            var leftPercent = getPercentOfTimePositionFromVideo(row,theEvent)
            eventMatrixHtml += `<div title="Event at ${theEvent.time}" class="video-time-needle video-time-needle-event" style="left:${leftPercent}%"></div>`
        })
    }
    var videoEndpoint = shinobiServer.buildApiPrefix(`videos`) + '/' + row.mid + '/' + row.filename
    return `
    <div class="video-row ${classOverride ? classOverride : `col-md-12 col-lg-6 mb-3`} search-row" data-peerconnectkey="${row.peerConnectKey}" data-mid="${row.mid}" data-time="${row.time}" data-type="${row.type}" data-time-formed="${new Date(row.time)}">
        <div class="video-time-card shadow-lg p-1 mb-1 bg-dark text-white">
            <div class="card-header p-2">
                <div>
                    ${moment(row.time).fromNow()}
                </div>
                <small class="text-muted">~${durationBetweenTimes(row.time,row.end)} ${lang.Minutes}</small>
            </div>
            <div class="card-body p-2">
                <div class="mb-2">
                    <a class="badge btn btn-primary open-video" title="${lang['Watch']}"><i class="fa fa-play-circle"></i></a>
                    <a class="badge btn btn-success download-video" href="${videoEndpoint}" title="${lang['Download']}"><i class="fa fa-download"></i></a>
                    <a class="badge btn btn-danger delete-video" title="${lang['Delete']}"><i class="fa fa-trash-o"></i></a>
                </div>
                <div title="${row.time}" class="border-bottom-dotted border-bottom-dark mb-2">
                    <div>
                        <div title="${row.time}"><small class="text-muted">${lang.Started} : ${formattedTime(row.time,true)}</small></div>
                        <div title="${row.end}"><small class="text-muted">${lang.Ended} : ${formattedTime(row.end,true)}</small></div>
                    </div>
                    <small>
                        ${shinobiServer.loadedMonitors[row.mid] ? shinobiServer.loadedMonitors[row.mid].name : row.mid}
                    </small>
                </div>
                <div class="mb-2">
                    ${objectTagsHtml}
                </div>
            </div>
            <div class="video-time-strip card-footer p-0">
                ${eventMatrixHtml}
            </div>
        </div>
    </div>`
}
function getFrameOnVideoRow(percentageInward, video) {
    var startTime = video.time;
    var endTime = video.end;
    var timeDifference = endTime - startTime;
    var timeInward = timeDifference / (100 / percentageInward);
    var timeAdded = new Date(startTime.getTime() + timeInward); // ms
    var frames = video.timelapseFrames || [];

    if (frames.length === 1) {
        return {
            timeInward: timeInward,
            foundFrame: frames[0],
            timeAdded: timeAdded,
        };
    }

    var closestFrame = frames.length > 0 ? frames.reduce(function(prev, curr) {
        var prevDiff = Math.abs(timeAdded - new Date(prev.time));
        var currDiff = Math.abs(timeAdded - new Date(curr.time));
        return (prevDiff < currDiff) ? prev : curr;
    }) : null;

    return {
        timeInward: timeInward,
        foundFrame: closestFrame,
        timeAdded: timeAdded,
    };
}
function getVideoFromDay(percentageInward, reversedVideos, startTime, endTime) {
    var timeDifference = endTime - startTime;
    var timeInward = timeDifference / (100 / percentageInward);
    var timeAdded = new Date(startTime.getTime() + timeInward); // ms
    var closestVideo = reversedVideos.reduce(function (prev, curr) {
        var prevDiff = Math.abs(timeAdded - new Date(prev.time));
        var currDiff = Math.abs(timeAdded - new Date(curr.time));
        return (prevDiff < currDiff) ? prev : curr;
    });
    return closestVideo;
}
function getPercentOfTimePositionFromVideo(video,theEvent){
    var startTime = new Date(video.time)
    var endTime = new Date(video.end)
    var eventTime = new Date(theEvent.time)
    var rangeMax = endTime - startTime
    var eventMs = eventTime - startTime
    var percentChanged = eventMs / rangeMax * 100
    return percentChanged
}
function sortVideosByDays(videos){
    var days = {}
    videos.forEach(function(video){
        var videoTime = new Date(video.time)
        var theDayKey = `${videoTime.getDate()}-${videoTime.getMonth()}-${videoTime.getFullYear()}`
        if(!days[video.mid])days[video.mid] = {};
        if(!days[video.mid][theDayKey])days[video.mid][theDayKey] = [];
        days[video.mid][theDayKey].push(video)
    })
    return days
}
function getAllDays(videos,frames){
    var listOfDays = {}
    $.each(this.loadedMonitors,function(monitorId){
        if(!listOfDays[monitorId])listOfDays[monitorId] = {}
    })
    videos.forEach(function(video){
        var videoTime = new Date(video.time)
        var monitorId = video.mid
        var theDayKey = `${videoTime.getDate()}-${videoTime.getMonth()}-${videoTime.getFullYear()}`
        if(!listOfDays[monitorId])listOfDays[monitorId] = {};
        listOfDays[monitorId][theDayKey] = []
    })
    frames.forEach(function(frame){
        var frameTime = new Date(frame.time)
        var monitorId = frame.mid
        var theDayKey = `${frameTime.getDate()}-${frameTime.getMonth()}-${frameTime.getFullYear()}`
        if(!listOfDays[monitorId])listOfDays[monitorId] = {};
        listOfDays[monitorId][theDayKey] = []
    })
    return listOfDays
}
function getStripStartAndEnd(videos,frames){
    var stripStartTimeByVideos = videos[0] ? new Date(videos[0].time) : null
    var stripEndTimeByVideos = videos[0] ? new Date(videos[videos.length - 1].end) : null
    var stripStartTimeByFrames = frames[0] ? new Date(frames[0].time) : stripStartTimeByVideos
    var stripEndTimeByFrames = frames[0] ? new Date(frames[frames.length - 1].time) : stripEndTimeByVideos
    var stripStartTime = stripStartTimeByVideos && stripStartTimeByVideos < stripStartTimeByFrames ? stripStartTimeByVideos : stripStartTimeByFrames
    var stripEndTime = stripEndTimeByVideos && stripEndTimeByVideos > stripEndTimeByFrames ? stripEndTimeByVideos : stripEndTimeByFrames
    return {
        start: new Date(stripStartTime),
        end: new Date(stripEndTime),
    }
}
function getVideoPercentWidthForDay(row,videos,frames){
    var startTime = new Date(row.time)
    var endTime = new Date(row.end)
    var timeDifference = endTime - startTime
    var stripTimes = getStripStartAndEnd(videos,frames)
    var stripTimeDifference = stripTimes.end - stripTimes.start
    var percent = (timeDifference / stripTimeDifference) * 100
    return percent
}
// day cards />>
function drawMatrices(event, options, autoRemoveTimeout, drawTrails){
    var theContainer = options.theContainer
    var height = options.height
    var width = options.width
    var widthRatio = width / event.details.imgWidth
    var heightRatio = height / event.details.imgHeight
    var objectTagGroup = event.details.reason === 'motion' ? 'motion' : event.details.name
    theContainer.find(`.stream-detected-object[name="${objectTagGroup}"]`).remove()
    var html = ''
    let moreMatrices = []
    var monitorId = event.id;
    function processMatrix(n,matrix){
        const newWidth = widthRatio * matrix.width;
        const newHeight = heightRatio * matrix.height;
        if(drawTrails)html += `<div class="stream-detected-object fresh-detected-trail" style="height:2px;width:2px;top:${heightRatio * matrix.y + (newHeight / 2)}px;left:${widthRatio * matrix.x + (newWidth / 2)}px;border-color: green;"></div>`
        html += `<div class="stream-detected-object fresh-detected-object" name="${objectTagGroup}" style="height:${newHeight}px;width:${newWidth}px;top:${heightRatio * matrix.y}px;left:${widthRatio * matrix.x}px;border-color: ${matrix.color};">`
        if(matrix.tag)html += `<span class="tag">${matrix.tag}${!isNaN(matrix.id) ? ` <small class="label label-default">${matrix.id}</small>`: ''} (${matrix.confidence.toFixed(2) || 0})</span>`
        if(matrix.notice)html += `<div class="matrix-info" style="color:yellow">${matrix.notice}</div>`;
        if(matrix.missingNear && matrix.missingNear.length > 0){
            html += `<div class="matrix-info yellow"><small>Missing Near</small><br>${matrix.missingRecently.map(item => `${item.tag} (${item.id}) by ${item.missedNear.tag} (${item.missedNear.id})`).join(', ')}</div>`;
        }
        if(matrix.missingRecentlyNearHands && matrix.missingRecentlyNearHands.length > 0){
            html += `<div class="matrix-info yellow"><small>Missing Recently</small><br>${matrix.missingRecentlyNearHands.map(item => `${item.tag} (${item.id})`).join(', ')}</div>`;
        }
        if(matrix.pose){
            var pose = matrix.pose;
            html += `<div class="matrix-info text-left">`;
            if(pose.isPersonFallen)html += `<div><small>Stance</small><br>${pose.isPersonFallen}</div>`;
            if(pose.isPersonReaching){
                html += `<div><small>Left Hand</small><br>${pose.isPersonReaching.left.pose}</div>`;
                html += `<div><small>Right Hand</small><br>${pose.isPersonReaching.right.pose}</div>`;
            }
            // if(pose.isPersonTouchingWaistOrHips)html += `<div>Waist or Hips : ${pose.isPersonTouchingWaistOrHips}</div>`;
            html += `</div>`;
            // console.log(matrix.poseInference)
        }
        if(matrix.poseInference)moreMatrices.push(...buildPosePoints(matrix.poseInference.keypoints,matrix.x,matrix.y))
        if(matrix.nearHands){
            var leftHand = matrix.nearHands.leftWrist;
            var rightHand = matrix.nearHands.rightWrist;
            html += `<div class="matrix-info text-left">`
                html += `<div><small>Left Interact</small><br>${leftHand.matrices.map(item => `${item.tag} (${item.id})`).join(', ')}</div>`;
                html += `<div><small>Right Interact</small><br>${rightHand.matrices.map(item => `${item.tag} (${item.id})`).join(', ')}</div>`;
            html += `</div>`
        }
        if(matrix.nearBy){
            html += `<div class="matrix-info">`
            matrix.nearBy.forEach((nearMatrix) => {
                html += `<div class="mb-1">${nearMatrix.tag} <small class="label label-default">${nearMatrix.id}</small> (${nearMatrix.overlapPercent.toFixed(2)}%)</div>`
            });
            html += `</div>`
        }
        if(matrix.redAlert){
            var monitor = loadedMonitors[monitorId]
            redAlertNotify({
                title: `${monitor.name}`,
                text: `${matrix.tag} (${matrix.id})<br>${matrix.notice}`,
                type: 'danger'
            });
        }
        html += '</div>'
    }
    $.each(event.details.matrices, processMatrix);
    $.each(moreMatrices, processMatrix);
    var addedEls = theContainer.append(html)
    if(autoRemoveTimeout){
        addedEls = addedEls.find('.fresh-detected-object').removeClass('fresh-detected-object')
        setTimeout(function(){
            addedEls.remove()
        }, autoRemoveTimeout);
    }
    if(drawTrails){
        var addedTrails = theContainer.find('.fresh-detected-trail').removeClass('fresh-detected-trail')
        setTimeout(function(){
            addedTrails.remove()
        }, 5000);
    }
}
function getDbColumnsForMonitor(monitor){
    var acceptedFields = [
        'mid',
        'ke',
        'name',
        'details',
        'type',
        'ext',
        'protocol',
        'host',
        'path',
        'port',
        'fps',
        'mode',
        'saveDir',
        'tags',
        'width',
        'height'
    ]
    var row = {};
    $.each(monitor,function(m,b){
        if(acceptedFields.indexOf(m)>-1){
            row[m]=b;
        }
    })
    return row
}

async function getAllApiKeys(asObject){
    const theArray = asObject ? {} : []
    const peerConnectKeys = Object.keys(loadedShinobiAPI)
    for(peerConnectKey of peerConnectKeys){
        var shinobiServer = loadedShinobiAPI[peerConnectKey]
        const keys = await shinobiServer.getApiKeys();
        asObject ? theArray[peerConnectKey] = keys : theArray.push(...keys)
    }
    return theArray
}

function downloadMonitorConfigurationsToDisk(monitorIds){
    var selectedMonitors = []
    $.each(monitorIds,function(n,monitorId){
        var monitor = monitorId instanceof Object ? monitorId : loadedMonitors[monitorId]
        if(monitor)selectedMonitors.push(monitor)
    })
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedMonitors));
    $('#temp').html('<a></a>')
        .find('a')
        .attr('href',dataStr)
        .attr('download',`${applicationName}_Monitors_${new Date()}.json`)
        [0].click()
}

function getRowsMonitorId(rowEl){
    var el = $(rowEl).parents('[data-mid]')
    var monitorId = el.attr('data-mid')
    var peerConnectKey = el.attr('data-peerconnectkey')
    return {
        monitorId,
        peerConnectKey,
        el
    }
}

function getMonitorInfo(_this){
    var el = $(_this)
    var parentEl = el.parents('[data-mid]');
    var monitorId = parentEl.attr('data-mid')
    var groupKey = parentEl.attr('data-ke')
    var peerConnectKey = parentEl.attr('data-peerconnectkey')
    var monitorLiveId = monitorId + peerConnectKey;
    var shinobiServer = loadedShinobiAPI[peerConnectKey];
    var websocket = shinobiServer.websocket;
    return {
        parentEl,
        monitorId,
        peerConnectKey,
        websocket,
        monitorLiveId,
        shinobiServer
    }
}

function getShinobiWebsocket(peerConnectKey){
    return loadedShinobiAPI[peerConnectKey].websocket
}

async function deleteMonitors(monitors, filesToo){
    for(monitor of monitors){
        var monitorId = monitor.mid;
        var peerConnectKey = monitor.peerConnectKey;
        var shinobiServer = loadedShinobiAPI[peerConnectKey];
        var response = await shinobiServer.deleteMonitor(monitorId, filesToo);
        notifyIfActionFailed(response)
    }
}

function deleteSelectedMonitors(monitorsSelected,afterDelete){
    $.confirm.create({
        title: lang['Delete']+' '+lang['Monitors'],
        body: '<p>'+lang.DeleteMonitorsText+'</p>',
        clickOptions: [
            {
                title:lang['Delete']+' '+lang['Monitors'],
                class:'btn-danger',
                callback: async function(){
                    await deleteMonitors(monitorsSelected, false)
                    if(afterDelete)afterDelete(monitorsSelected)
                }
            },
            {
                title:lang['Delete Monitors and Files'],
                class:'btn-danger',
                callback: async function(){
                    await deleteMonitors(monitorsSelected, true)
                    if(afterDelete)afterDelete(monitorsSelected)
                }
            }
        ]
    })
}
function launchImportMonitorWindow(callback){
    var html = `${lang.ImportMultiMonitorConfigurationText}
    <div style="margin-top: 15px;">
        <div class="form-group">
            <select class="form-control form-control-sm import-to-peer"></select>
        </div>
        <div class="form-group">
            <textarea placeholder="${lang['Paste JSON here.']}" class="form-control"></textarea>
        </div>
        <label class="upload_file btn btn-primary btn-block">${lang['Upload File']}<input class="upload" type="file" name="files[]" /></label>
    </div>`
    $.confirm.create({
        title: lang['Import Monitor Configuration'],
        body: html,
        clickOptions: [
            {
                title: lang['Import'],
                class: 'btn-primary',
                callback: function(){
                    var peerConnectKey = $.confirm.e.find('.import-to-peer').val();
                    var shinobiServer = loadedShinobiAPI[peerConnectKey];
                    var rawTextArea = mergeConcattedJsonString($.confirm.e.find('textarea').val());
                    var parseData = safeJsonParse(rawTextArea)
                    if(callback){
                        callback(parseData)
                    }else{
                        shinobiServer.importMonitor(parseData)
                    }
                }
            },
            // {
            //     title: lang['Upload'],
            //     class: 'btn-primary',
            //     callback: function(e){
            //         var files = e.target.files; // FileList object
            //         f = files[0];
            //         var reader = new FileReader();
            //         reader.onload = function(ee) {
            //             $.confirm.e.find('textarea').val(ee.target.result);
            //         }
            //         reader.readAsText(f);
            //     }
            // }
        ],
    })
    $.confirm.e.find('.upload').change(function(e){
        var files = e.target.files; // FileList object
        f = files[0];
        var reader = new FileReader();
        reader.onload = function(ee) {
            $.confirm.e.find('textarea').val(ee.target.result);
        }
        reader.readAsText(f);
    });
    var peerConnectKeysList = $.confirm.e.find('.import-to-peer');
    drawPeerConnectKeysToSelector(peerConnectKeysList,null,null);
}
function runPtzCommand(peerConnectKey, monitorId,switchChosen){
    const shinobiServer = loadedShinobiAPI[peerConnectKey]
    switch(switchChosen){
        case'setHome':
            $.getJSON(shinobiServer.buildApiPrefix(`control`) + '/' + monitorId + '/setHome',function(data){
                console.log(data)
            })
        break;
        default:
            shinobiServer.websocket.f({
                f: 'control',
                direction: switchChosen,
                id: monitorId,
                ke: $user.ke
            })
        break;
    }
}
function runPtzMove(peerConnectKey, monitorId,switchChosen,doMove){
    getShinobiWebsocket(peerConnectKey).f({
        f: doMove ? 'startMove' : 'stopMove',
        direction: switchChosen,
        id: monitorId,
        ke: $user.ke
    })
}
function getLoadedMonitors(groupedByPeerConnectKey){
    const theMonitors = {}
    $.each(loadedShinobiAPI,function(peerConnectKey,shinobiServer){
        $.each(shinobiServer.loadedMonitors,function(monitorId,monitor){
            if(groupedByPeerConnectKey){
                if(!theMonitors[peerConnectKey])theMonitors[peerConnectKey] = {};
                theMonitors[peerConnectKey][monitor.mid] = monitor
            }else{
                theMonitors[monitor.mid + peerConnectKey] = monitor
            }
        })
    })
    return theMonitors;
}
function getMonitorsFromIds(monitorIds){
    var foundMonitors = []
    monitorIds.forEach((monitorId) => {
        foundMonitors.push(loadedMonitors[monitorId])
    })
    return foundMonitors
}
function getListOfTagsFromMonitors(loadedMonitors){
    var listOftags = {}
    $.each(loadedMonitors || getLoadedMonitors(),function(monitorLiveId,monitor){
        if(monitor.tags){
           monitor.tags.split(',').forEach((tag) => {
               if(!listOftags[tag])listOftags[tag] = [];
               const monitorId = monitor.mid;
               const peerConnectKey = monitor.peerConnectKey;
               listOftags[tag].push({ monitorId, peerConnectKey })
           })
        }
    })
    return listOftags
}
function sanitizeTagList(tags){
    var allTags = getListOfTagsFromMonitors()
    return findCommonElements(allTags,tags)
}
function getMonitorsFromTags(tags){
    var foundMonitors = {}
    $.each(loadedMonitors,function(monitorId,monitor){
        if(monitor.tags){
            tags.forEach((tag) => {
                if(monitor.tags.includes(tag)){
                    if(!foundMonitors[monitorId])foundMonitors[monitorId] = monitor
                }
            })
        }
    })
    return Object.values(foundMonitors)
}
function buildMonitorGroupListFromTags(){
    var html = ``
    var listOftags = getListOfTagsFromMonitors()
    $.each(listOftags,function(tagName,monitorIds){
        html += `<li class="cursor-pointer"><a class="dropdown-item monitor-live-group-open" monitor-ids="${monitorIds.join(',')}">${tagName}</a></li>`
    })
    return html
}
function drawMonitorGroupList(){
    var html = `<li><hr class="dropdown-divider"></li>
    <li class="pl-4"><small class="text-muted">${lang.Tags}</small></li>`
    html += buildMonitorGroupListFromTags()
    monitorGroupSelections.html(html)
}
function buildDefaultMonitorMenuItems(){
    return `
    <li><a class="dropdown-item launch-live-grid-monitor cursor-pointer">${lang['Live Grid']}</a></li>
    <li><a class="dropdown-item run-live-grid-monitor-pop cursor-pointer">${lang['Pop']}</a></li>
    <li><a class="dropdown-item toggle-substream cursor-pointer">${lang['Toggle Substream']}</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item open-videosTable cursor-pointer">${lang['Videos List']}</a></li>
    <!-- <li><a class="dropdown-item cursor-pointer" monitor-action="pvv">${lang['Power Viewer']}</a></li> -->
    <li><a class="dropdown-item open-timelapse-viewer cursor-pointer">${lang['Time-lapse']}</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item open-monitor-settings cursor-pointer">${lang['Monitor Settings']}</a></li>
    <li><a class="dropdown-item export-this-monitor-settings cursor-pointer">${lang['Export']}</a></li>
    <li><hr class="dropdown-divider"></li>
    <li class="pl-4"><small class="text-muted">${lang['Set Mode']}</small></li>
    <li><a class="dropdown-item cursor-pointer" set-mode="stop">${lang.Disable}</a></li>
    <li><a class="dropdown-item cursor-pointer" set-mode="start">${lang['Watch-Only']}</a></li>
    <li><a class="dropdown-item cursor-pointer" set-mode="record">${lang.Record}</a></li>`
}
function setCosmeticMonitorInfo(monitorConfig){
    var peerConnectKey = monitorConfig.peerConnectKey
    var monitorId = monitorConfig.mid
    var monitorElements = $('.glM' + monitorId + peerConnectKey)
    if(safeJsonParse(monitorConfig.details).vcodec !=='copy' && monitorConfig.mode == 'record'){
        monitorElements.find('.monitor_not_record_copy').show()
    }else{
        monitorElements.find('.monitor_not_record_copy').hide()
    }
    var humanReadableMode = humanReadableModeLabel(monitorConfig.mode)
    monitorElements.find('.monitor_name').text(monitorConfig.name)
    monitorElements.find('.monitor_mid').text(monitorId)
    monitorElements.find('.monitor_ext').text(monitorConfig.ext)
    monitorElements.find('.monitor_mode').text(humanReadableMode)
    monitorElements.find('.monitor_status').html(pageLayouts['Monitor Status Codes'][monitorConfig.code] || monitorConfig.status || '<i class="fa fa-spinner fa-pulse"></i>')
    monitorElements.attr('mode',humanReadableMode)
    monitorElements.find('.lamp').attr('title',humanReadableMode)
    if(monitorConfig.details.control=="1"){
        monitorElements.find('[monitor="control_toggle"]').show()
    }else{
        monitorElements.find('.pad').remove()
        monitorElements.find('[monitor="control_toggle"]').hide()
    }
}
function humanReadableModeLabel(mode){
    var humanMode = lang['Disabled']
    switch(mode){
        case'idle':
            humanMode = lang['Idle']
        break;
        case'stop':
            humanMode = lang['Disabled']
        break;
        case'record':
            humanMode = lang['Record']
        break;
        case'start':
            humanMode = lang['Watch Only']
        break;
    }
    return humanMode
}
function compileConnectUrl(options){
    var porty = ''
    if(options.port && options.port !== ''){
        porty = ':' + options.port
    }
    var url = options.protocol + '://' + options.host + porty + options.path
    return url
}
function setServerCountsOnUI(){
    const serversCount = Object.keys(loadedShinobiAPI).length
    const serversConnected = Object.values(loadedShinobiAPI).filter(api => api.websocket.io.io._readyState == 'open').length
    $('.serversCount').text(serversCount)
    $('.serversConnectedCount').text(serversConnected)
}
function setMonitorAllCountOnUI(){
    const allMonitors = Object.values(getLoadedMonitors());
    const allStarted = allMonitors.filter(item => item.code == "2" || item.code == "9")
    const allRecording = allMonitors.filter(item => item.code == "3")
    const allDead = allMonitors.filter(item => item.code == "7")
    const allStopped = allMonitors.filter(item => item.code == "5" || item.code == "8" || item.code == "0")
    $('.cameraStartedCount').text(allStarted.length)
    $('.cameraRecordingCount').text(allRecording.length)
    $('.cameraDeadCount').text(allDead.length)
    $('.cameraStoppedCount').text(allStopped.length)
    $('.cameraCount').text(Object.keys(allMonitors).length)
    for(peerConnectKey in loadedShinobiAPI){
        updateActiveMonitorIndicator(peerConnectKey)
    }
}
function updateMonitorStatus(data, peerConnectKey){
    try{
        const monitorId = data.mid || data.id;
        var loadedMonitors = loadedShinobiAPI[peerConnectKey].loadedMonitors;
        // Updated status of interface in loaded Monitors
        loadedMonitors[monitorId].code = parseInt(`${data.code}`)
        loadedMonitors[monitorId].status = `${data.status}`
    }catch(err){

    }
}
function updateActiveMonitorIndicator(peerConnectKey, monitors){
    var data = monitors || Object.values(loadedShinobiAPI[peerConnectKey].loadedMonitors)
    var allCameraCount = data.length;
    var activeCameraCount = data.filter((monitor) => {
        var monCode = parseInt(monitor.code)
        return monCode === 9 || monCode === 2 || monCode === 3
    }).length;
    var percentActive = (activeCameraCount / allCameraCount) * 100;
    // Update Camera count in status bar
    var el = $(`.activeCameraCount-${peerConnectKey}`)
    var count = el.find('.indicator-percent')
    count.text(`${activeCameraCount} / ${allCameraCount}`)
    el.find('.progress-bar').css('width', `${percentActive}%`)
}
