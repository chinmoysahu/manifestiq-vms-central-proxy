var loadedServers = {}
var loadedSuperUsers = {};
var loadedShinobiAPI = {};
var loadedShinobiCredentials = {};
var loadedMonitorsByServer = {};
var loadedIdentifiers = {};
var dashboardSwitchCallbacks = {}
PNotify.prototype.options.styling = "fontawesome";
var monitorStatusCodes = pageLayouts['Monitor Status Codes'];
function showOnlyServerIndicatorBars(peerConnectKey){
    const sectionId = `#indicator-bars-${peerConnectKey}`
    $('#server-indicators .indicator-bars-container').addClass('hide-box-wrapper')
    $(sectionId).removeClass('hide-box-wrapper')
    $('.fixed-plugin-body').scrollTo(sectionId)
}
function initiateDashboard(){
    var serverIndicators = $('#server-indicators')
    async function getAddStorageIndicators(peerConnectKey){
        const shinobiServer = loadedShinobiAPI[peerConnectKey]
        const addStorage = shinobiServer.addStorage;
        const built = []
        $.each(addStorage,function(n,storage){
            built.push({
                "fieldType": "indicatorBar",
                "icon": "hdd-o",
                "name": `${storage.name}-${peerConnectKey}`,
                "bars": 3,
                "color0": "info",
                "title0": lang["Video Share"],
                "color1": "danger",
                "title1": lang["Timelapse Frames Share"],
                "color2": "warning",
                "title2": lang["FileBin Share"],
                "label": `<span style="text-transform:capitalize">${storage.name}</span> : <span class="value"></span>`,
            })
        })
        return built;
    }
    async function getCloudStorageIndicators(peerConnectKey){
        const shinobiServer = loadedShinobiAPI[peerConnectKey]
        const theUploaders = shinobiServer.uploaders;
        const built = []
        $.each(theUploaders,function(uploaderId,humanName){
            if(uploaderId === 'mnt')built.push({
                "fieldType": "indicatorBar",
                "icon": "cloud",
                "id": `indicator-${uploaderId}-${peerConnectKey}`,
                "name": humanName,
                "bars": 3,
                "color0": "info",
                "title0": lang["Video Share"],
                "color1": "danger",
                "title1": lang["Timelapse Frames Share"],
                "color2": "warning",
                "title2": lang["FileBin Share"],
                "label": `<span style="text-transform:capitalize">${humanName.replace(' Storage', '')}</span> : <span class="value"></span>`,
            })
        })
        return built;
    }
    function cacheMainIndicators(peerConnectKey){
        const shinobiServer = loadedShinobiAPI[peerConnectKey]
        const cpuIndicator = $(`#indicator-cpu-${peerConnectKey}`)
        const cpuIndicatorBar = cpuIndicator.find('.progress-bar')
        const cpuIndicatorPercentText = cpuIndicator.find('.indicator-percent')
        const ramIndicator = $(`#indicator-ram-${peerConnectKey}`)
        const ramIndicatorBar = ramIndicator.find('.progress-bar')
        const ramIndicatorUsed = ramIndicator.find('.used')
        const ramIndicatorPercentText = ramIndicator.find('.indicator-percent')
        const diskIndicator = $(`#indicator-disk-${peerConnectKey}`)
        const diskIndicatorBar = diskIndicator.find('.progress-bar')
        const diskIndicatorBarUsed = diskIndicator.find('.value')
        const diskIndicatorPercentText = diskIndicator.find('.indicator-percent')
        shinobiServer.mainIndicators = {
            cpuIndicator,
            cpuIndicatorBar,
            cpuIndicatorPercentText,
            ramIndicator,
            ramIndicatorBar,
            ramIndicatorUsed,
            ramIndicatorPercentText,
            diskIndicator,
            diskIndicatorBar,
            diskIndicatorBarUsed,
            diskIndicatorPercentText,
        }
    }
    function cacheAddStorageIndicators(peerConnectKey){
        const shinobiServer = loadedShinobiAPI[peerConnectKey]
        const addStorage = shinobiServer.addStorage;
        $.each(addStorage,function(n,storage){
            var el = $(`#indicator-${storage.name}-${peerConnectKey}`)
            shinobiServer.addStorageIndicators[storage.name] = {
                value: el.find('.value'),
                percent: el.find('.indicator-percent'),
                progressBar: el.find('.progress-bar'),
            }
        })
    }
    function cacheUploaderIndicators(peerConnectKey){
        const shinobiServer = loadedShinobiAPI[peerConnectKey]
        const uploaders = shinobiServer.uploaders;
        $.each(uploaders,function(uploaderId,storage){
            var el = $(`#indicator-${uploaderId}-${peerConnectKey}`)
            shinobiServer.uploaderIndicators[uploaderId] = {
                value: el.find('.value'),
                percent: el.find('.indicator-percent'),
                progressBar: el.find('.progress-bar'),
            }
        })
    }
    async function buildIndicatorBars(peerConnectKey){
        const sectionId = `indicator-bars-${peerConnectKey}`
        const savedIdentifier = loadedIdentifiers[peerConnectKey];
        const schema = {
            "id": sectionId,
            "name": `<span class="server-name">${savedIdentifier.name || peerConnectKey}</span>`,
            "box-wrapper-class": `d-flex flex-column flex-grow-1`,
            "box-wrapper-style": "width: 100%",
            isFormGroupGroup: true,
            "noDefaultSectionClasses": true,
            "section-class": `${boxWrappersHidden[sectionId] ? `hide-box-wrapper` : ''} indicator-bars-container text-white bg-gradient-blue px-3 py-2 mb-3 border-0 form-group-group`,
            info: [
                {
                    "fieldType": "indicatorBar",
                    "percent": 0,
                    "color": 'warning',
                    "indicatorPercentClass": 'activeCameraCount',
                    "icon": "video-camera",
                    "name": `activeCameraCount-${peerConnectKey}`,
                    "class": `activeCameraCount-${peerConnectKey}`,
                    "label": lang['Active Monitors'],
                },
                {
                    "fieldType": "indicatorBar",
                    "icon": "square",
                    "name": `cpu-${peerConnectKey}`,
                    "label": `<span class="os_cpuCount"><i class="fa fa-spinner fa-pulse"></i></span> ${lang.CPU}<span class="os_cpuCount_trailer"></span> : <span class="os_platform" style="text-transform:capitalize"><i class="fa fa-spinner fa-pulse"></i></span>`,
                },
                {
                    "fieldType": "indicatorBar",
                    "icon": "microchip",
                    "name": `ram-${peerConnectKey}`,
                    "label": `<span class="os_totalmem used"><i class="fa fa-spinner fa-pulse"></i></span> ${lang.MB} ${lang.RAM}`,
                },
                {
                    id: `disk-indicator-bars-${peerConnectKey}`,
                    isFormGroupGroup: true,
                    "noHeader": true,
                    "noDefaultSectionClasses": true,
                    "section-class": "disk-indicator-bars",
                    info: [
                        {
                            "fieldType": "indicatorBar",
                            "icon": "hdd-o",
                            "name": `disk-${peerConnectKey}`,
                            "bars": 3,
                            "color0": "info",
                            "title0": lang["Video Share"],
                            "color1": "danger",
                            "title1": lang["Timelapse Frames Share"],
                            "color2": "warning",
                            "title2": lang["FileBin Share"],
                            "label": `<span class="diskUsed" style="text-transform:capitalize">${lang.Primary}</span> : <span class="value"></span>`,
                        },
                        ...(await getAddStorageIndicators(peerConnectKey)),
                        ...(await getCloudStorageIndicators(peerConnectKey))
                    ]
                },
            ]
        };
        return drawBlock(schema)
    }
    async function drawIndicatorBars(peerConnectKey){
        const barsExist = $(`indicator-bars-${peerConnectKey}`).length === 1;
        if(!barsExist){
            const html = await buildIndicatorBars(peerConnectKey)
            serverIndicators.append(html)
        }
    }
    async function destroyIndicatorBars(peerConnectKey){
        const barsExist = $(`#indicator-bars-${peerConnectKey}`);
        barsExist.remove();
    }
    async function loadServer(server){
        try{
            const peerConnectKey = server.peerConnectKey
            const credentials = server.connectDetails;
            const serverTimezone = server.config.timezone;
            let { superApiKey, apiKey, groupKey } = credentials;
            if(myCredentials[peerConnectKey])apiKey = myCredentials[peerConnectKey];
            const superUser = new superUserAPI(peerConnectKey, superApiKey);
            const shinobiServer = new shinobiAPI(peerConnectKey, apiKey, groupKey);
            const monitors = await shinobiServer.getMonitors();
            const userInfo = await shinobiServer.getUserInfo();
            const savedIdentifier = await getSavedIdentifier(peerConnectKey);
            loadedServers[peerConnectKey] = server;
            loadedSuperUsers[peerConnectKey] = superUser;
            loadedShinobiAPI[peerConnectKey] = shinobiServer;
            loadedIdentifiers[peerConnectKey] = savedIdentifier;
            loadedShinobiCredentials[peerConnectKey] = credentials;
            loadedMonitorsByServer[peerConnectKey] = {};
            for(monitor of monitors){
                console.log(loadedMonitorsByServer[peerConnectKey])
                loadedMonitorsByServer[peerConnectKey][monitor.mid] = monitor;
            }
            shinobiServer.loadedMonitors = loadedMonitorsByServer[peerConnectKey];
            shinobiServer.$user = userInfo.user;
            await shinobiServer.getSystemInfo();
            await drawIndicatorBars(peerConnectKey);
            await shinobiServer.startWebsocket(userInfo);
            await superUser.setupSuperAPIs();
            cacheMainIndicators(peerConnectKey)
            cacheAddStorageIndicators(peerConnectKey)
            cacheUploaderIndicators(peerConnectKey)
            setMonitorAllCountOnUI()
            setServerCountsOnUI()
        }catch(err){
            console.log(err)
        }
    }
    function unloadServer(server){
        const peerConnectKey = server.peerConnectKey
        try{
            loadedShinobiAPI[peerConnectKey].disconnectWebsocket()
        }catch(err){}
        try{
            destroyIndicatorBars(peerConnectKey)
        }catch(err){}
        delete(loadedServers[peerConnectKey]);
        delete(loadedSuperUsers[peerConnectKey]);
        delete(loadedShinobiAPI[peerConnectKey]);
        delete(loadedIdentifiers[peerConnectKey]);
        delete(loadedShinobiCredentials[peerConnectKey]);
        delete(loadedMonitorsByServer[peerConnectKey]);
    }
    function loadServers({ servers }){
        return new Promise((resolve) => {
            let numberOfServers = Object.keys(servers).length;
            let doneLoading = 0;
            for(peerConnectKey in servers){
                var server = servers[peerConnectKey]
                loadServer(server).then(() => {
                    ++doneLoading;
                    if(numberOfServers === doneLoading){
                        resolve()
                    }
                })
            }
        })
    }
    function setDiskUsed({
        diskIndicatorBar,
        diskIndicatorBarUsed,
        diskIndicatorPercentText,
        diskLimit,
        diskUsed,
        usedSpaceVideos,
        usedSpaceTimelapseFrames,
        usedSpaceFilebin
    }){
        var percent = parseDiskUsePercent(diskUsed,diskLimit);
        var videosPercent = parseDiskUsePercent(usedSpaceVideos,diskLimit);
        var timelapsePercent = parseDiskUsePercent(usedSpaceTimelapseFrames,diskLimit);
        var fileBinPercent = parseDiskUsePercent(usedSpaceFilebin,diskLimit);
        var humanText = parseFloat(diskUsed)
        if(humanText > 1000){
            humanText = (humanText / 1000).toFixed(2) + ' GB'
        }else{
            humanText = humanText.toFixed(2) + ' MB'
        }
        diskIndicatorBarUsed.html(humanText)
        diskIndicatorPercentText.html(percent)
        diskIndicatorBar[0].style.width = videosPercent
        diskIndicatorBar[0].title = `${lang['Video Share']} : ${videosPercent}`
        diskIndicatorBar[1].style.width = timelapsePercent
        diskIndicatorBar[1].title = `${lang['Timelapse Frames Share']} : ${timelapsePercent}`
        diskIndicatorBar[2].style.width = fileBinPercent
        diskIndicatorBar[2].title = `${lang['FileBin Share']} : ${fileBinPercent}`
    }
    function setOtherDiskUsed({
         name, sizeLimit, usedSpace, usedSpaceVideos, usedSpaceTimelapseFrames = 0,
         diskIndicator, diskIndicatorBars
    }){
        usedSpaceVideos = usedSpaceVideos || usedSpace;
        var percent = parseDiskUsePercent(usedSpace,sizeLimit);
        var videosPercent = parseDiskUsePercent(usedSpaceVideos,sizeLimit);
        var timelapsePercent = parseDiskUsePercent(usedSpaceTimelapseFrames,sizeLimit);
        //
        var humanValue = parseFloat(usedSpace)
        if(humanValue > 1000){
            humanValue = (humanValue/1000).toFixed(2)+' GB'
        }else{
            humanValue = humanValue.toFixed(2)+' MB'
        }
        diskIndicator.value.html(humanValue)
        diskIndicator.percent.html(percent)
        diskIndicatorBars[0].style.width = videosPercent
        diskIndicatorBars[0].title = `${lang['Video Share']} : ${videosPercent}`
        diskIndicatorBars[1].style.width = timelapsePercent
        diskIndicatorBars[1].title = `${lang['Timelapse Frames Share']} : ${timelapsePercent}`
    }
    onWebSocketEvent(async function(data){
        switch(data.f){
            case'ready':
                await loadServers(data)
                const firstServer = drawPeerConnectKeysToSelector($('.peerConnectKeys_list'),null,null)
                executeEventHandlers('onDashboardReady', [data.servers])
            break;
            case'registeredServer':
                await loadServer(data.server)
                executeEventHandlers('onServerConnect', [ data.server ])
            break;
            case'deregisteredServer':
                unloadServer(data.server)
                executeEventHandlers('onServerDisconnect', [ data.server ])
            break;
        }
    })
    onShinobiWebSocketEvent(function(d, peerConnectKey){
        const shinobiServer = loadedShinobiAPI[peerConnectKey]
        switch(d.f){
            case'init_success':
                var {
                    cpuIndicator,
                    ramIndicatorUsed,
                } = shinobiServer.mainIndicators;
                var coreCount = d.os.cpuCount
                var operatingSystem = d.os.platform
                var totalRAM = d.os.totalmem
                cpuIndicator.find('.os_cpuCount').text(coreCount)
                cpuIndicator.find('.os_platform').text(operatingSystem)
                ramIndicatorUsed.attr('title',`Total : ${(totalRAM/1048576).toFixed(2)}`)
                if(d.os.cpuCount > 1){
                    cpuIndicator.find('.os_cpuCount_trailer').html('s')
                }
                setServerCountsOnUI()
            break;
            case'os':
                //cpu
                var {
                    cpuIndicatorBar,
                    cpuIndicatorPercentText,
                    ramIndicatorBar,
                    ramIndicatorUsed,
                    ramIndicatorPercentText,
                } = shinobiServer.mainIndicators;
                var cpuPercent = parseFloat(d.cpu).toFixed(1) + '%'
                cpuIndicatorBar.css('width',cpuPercent)
                cpuIndicatorPercentText.html(cpuPercent)
                //ram
                var ramPercent = parseFloat(d.ram.percent).toFixed(1) + '%'
                ramIndicatorBar.css('width',ramPercent)
                ramIndicatorPercentText.html(ramPercent)
                ramIndicatorUsed.html(d.ram.used.toFixed(2))
            break;
            case'cloudDiskUsed':
                $.each(d.cloudDisks,function(uploaderId, { name, sizeLimit, usedSpace }){
                    try{
                        var diskIndicator = shinobiServer.uploaderIndicators[uploaderId]
                        var diskIndicatorBars = diskIndicator.progressBar
                        setOtherDiskUsed({
                             name, sizeLimit, usedSpace,
                             diskIndicator, diskIndicatorBars
                        })
                    }catch(err){
                        // console.log(uploaderId)
                        // console.log(err)
                    }
                })
            break;
            case'diskUsed':
                var {
                    diskIndicatorBar,
                    diskIndicatorBarUsed,
                    diskIndicatorPercentText,
                } = shinobiServer.mainIndicators;
                var diskLimit = d.limit || 10000
                var diskUsed = d.size
                var { usedSpaceVideos, usedSpaceTimelapseFrames, usedSpaceFilebin } = d;
                setDiskUsed({
                    diskIndicatorBar,
                    diskIndicatorBarUsed,
                    diskIndicatorPercentText,
                    diskLimit,
                    diskUsed,
                    usedSpaceVideos,
                    usedSpaceTimelapseFrames,
                    usedSpaceFilebin
                })
                if(d.addStorage){
                    $.each(d.addStorage,function(n, { name, sizeLimit, usedSpace, usedSpaceVideos, usedSpaceTimelapseFrames }){
                        var diskIndicator = shinobiServer.addStorageIndicators[name]
                        var diskIndicatorBars = diskIndicator.progressBar
                        setOtherDiskUsed({
                             name, sizeLimit, usedSpace, usedSpaceVideos, usedSpaceTimelapseFrames,
                             diskIndicator, diskIndicatorBars
                        })
                    })
                }
            break;
            case'monitor_status':
                var monitorId = d.mid || d.id;
                var el = $(`[data-mid="${monitorId}"][data-peerconnectkey="${peerConnectKey}"]`)
                updateMonitorStatus(d, peerConnectKey);
                el.find(`.monitor_status`).html(monitorStatusCodes[d.code] || d.code || d.status);
                el.find(`.monitor_status_icon`).html(`<i class="fa fa-${monitorStatusCodes[`i${d.code}`]}"></i>`).css('color', monitorStatusCodes[`c${d.code}`]);
                setMonitorAllCountOnUI()
            break;
        }
    })
}

function setSwitchUIState(systemSwitch,toggleState){
    var el = $(`[shinobi-switch="${systemSwitch}"]`)
    var onClass = el.attr('on-class')
    var offClass = el.attr('off-class')
    var childTarget = el.attr('ui-change-target')
    if(childTarget)el = el.find(childTarget)
    if(onClass || offClass){
        if(toggleState === 1){
            if(onClass)el.addClass(onClass)
            if(offClass)el.removeClass(offClass)
        }else{
            if(onClass)el.removeClass(onClass)
            if(offClass)el.addClass(offClass)
        }
    }
}
function runDashboardSwitchCallback(systemSwitch){
    var theSwitches = dashboardOptions().switches
    var afterAction = dashboardSwitchCallbacks[systemSwitch]
    if(afterAction){
        afterAction(theSwitches[systemSwitch])
    }
}
function dashboardSwitch(systemSwitch){
    var theSwitches = dashboardOptions().switches
    if(!theSwitches){
        theSwitches={}
    }
    if(!theSwitches[systemSwitch]){
        theSwitches[systemSwitch]=0
    }
    if(theSwitches[systemSwitch]===1){
        theSwitches[systemSwitch]=0
    }else{
        theSwitches[systemSwitch]=1
    }
    dashboardOptions('switches',theSwitches)
    runDashboardSwitchCallback(systemSwitch)
    setSwitchUIState(systemSwitch,theSwitches[systemSwitch])
}

function getDetailValues(parentForm){
    var theList = {}
    var allDetailFieldsInThisForm = parentForm.find('[detail]')
    allDetailFieldsInThisForm.each(function(n,v){
        var el = $(v)
        var detailParam = el.attr('detail')
        var theValue = el.val()
        theList[detailParam] = theValue
    })
    return theList
}

function onDetailFieldChange(_this){
    var parentForm = $(_this).parents('form');
    parentForm.find('[name="details"]').val(JSON.stringify(getDetailValues(parentForm)));
}

function onSelectorChange(_this,parent){
    var el = $(_this)
    var theParam = el.attr('selector')
    var theValue = el.val()
    var theSelected = el.find('option:selected').text()
    parent.find(`.${theParam}_input`).hide()
    parent.find(`.${theParam}_${theValue}`).show()
    parent.find(`.${theParam}_text`).text(theSelected)
}

function generateId(x){
    if(!x){x=10};var t = "";var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < x; i++ )
        t += p.charAt(Math.floor(Math.random() * p.length));
    return t;
}

function removeSpecialCharacters(stringToReplace){
    return stringToReplace.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
}

function mergeDeep(...objects) {
  const isObject = obj => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      }
      else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      }
      else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}

function jsonToHtmlBlock(target){
    var html = ''
    if(target instanceof Object){
        var html = '<ul>'
        $.each(target,function(key,value){
            html += `
                <li><b>${key}</b> : ${jsonToHtmlBlock(value)}</li>
            `
        })
        html += '</ul>'
    }else{
        html += `<span>${target}</span>`
    }
    return html
}

onInitWebsocket(function(data){
    sendToSocket({ f: 'init' })
})

$(document).ready(function(){
    darkMode(true)
    initiateDashboard()
    loadSwitchStates()

    // sign-out
    $('.logout').click(function(){
        $.get('/logout',function(){
            // localStorage.removeItem('ShinobiLogin_'+location.host);
            location.href = location.href.split('#')[0];
        })
    });
    $(window)
    .resize(function(){
        clearTimeout(window.pageResizeTimeout)
        window.pageResizeTimeout = setTimeout(function(){
            $('body').removeClass('g-sidenav-pinned')
        },500)
    });
    $('body')
    .on('click','[class_toggle]',function(){
        var el = $(this)
        var targetElement = el.attr('data-target')
        var classToToggle = el.attr('class_toggle')
        var iconClassesToToggle = el.attr('icon-toggle')
        var togglPosition = $(targetElement).hasClass(classToToggle) ? 0 : 1
        var classToggles = dashboardOptions().class_toggle || {}
        classToggles[targetElement] = [classToToggle,togglPosition,iconClassesToToggle,iconTarget];
        dashboardOptions('class_toggle',classToggles)
        $(targetElement).toggleClass(classToToggle)
        if(iconClassesToToggle){
            iconClassesToToggle = iconClassesToToggle.split(' ')
            var iconTarget = el.attr('icon-child')
            var iconTargetElement = el.find(el.attr('icon-child'))
            iconTargetElement
                .removeClass(iconClassesToToggle[togglPosition === 1 ? 0 : 1])
                .addClass(iconClassesToToggle[togglPosition])
        }
    })
    .on('click','[shinobi-switch]',function(){
        var el = $(this)
        var systemSwitch = el.attr('shinobi-switch');
        dashboardSwitch(systemSwitch)
    })
    .on('keyup','.search-parent .search-controller',function(){
        var _this = $(this);
        var parent = _this.parents('.search-parent')
        var searchRaw = _this.val().toLowerCase();
        var searchCases = searchRaw.split(',').map(item => item.trim())
        var requiredMatches = searchCases.length
        $.each(parent.find(".search-body .search-row"), function() {
            var el = $(this);
            var elText = el.text().toLowerCase();
            var matches = 0;
            for(searchText of searchCases){
                if(elText.indexOf(searchText) !== -1){
                    ++matches;
                }else{
                    return el.hide();
                }
            }
            if(matches === requiredMatches)
               el.show();
        });
    })
})
