var monitorGroupSelections = $('#monitor-group-selections')
var sidebarMenu = $('#sidenav-main')
var sideMenuMonitorSearch = $('#sideMenu-monitors-search')
// var sidebarMenuInner = $('#menu-side')
// var pageTabContainer = $('#pageTabContainer')
var monitorSideList = $('#monitorSideList')
// var sideMenuCollapsePoint = $('#side-menu-collapse-point')
// var floatingHideButton = $('#floating-hide-button')
var floatingBackButton = $('#floating-back-button')

function buildSubMenuItems(listOfItems){
    var html = ''
    $.each(listOfItems,function(n,item){
        if(!item)return;
        if(item.divider){
            html += `<li><hr class="dropdown-divider"/></li>`
        }else{
            html += `<li><a class="text-decoration-none ${item.class || ''}" ${item.attributes || ''}><span class="${item.hasParent ? 'ml-3' : ''} dot dot-${item.color || 'blue'} mr-2"></span>${item.label}</a></li>`
        }
    })
    return html
}
function drawSubMenuItems(linkTarget,definitionsBase){
    var list = $(`#side-menu-link-${linkTarget}  ul`)
    window[`sectionList-${linkTarget}`] = window[`sectionList-${linkTarget}`] || getAllSectionsFromDefinition(definitionsBase)
    var sectionSubLinks = Object.values(window[`sectionList-${linkTarget}`]).map(function(item){
        var sectionId = item.id
        if(!sectionId)return null
        var sectionElement = document.getElementById(`${sectionId}`)
        if(sectionElement && $(sectionElement).is(":hidden"))return null;
        var parentName = item.parentName
        var completeLabel = `${item.name}`
        return {
            attributes: `href="#${sectionId}" scrollToParent="#tab-${linkTarget}"`,
            class: `scrollTo`,
            color: item.color,
            hasParent: !!parentName,
            label: completeLabel,
        }
    })
    var html = buildSubMenuItems(sectionSubLinks)
    list.html(html)
}
function drawMonitorIconToMenu(monitor){
    var peerConnectKey = monitor.peerConnectKey
    var shinobiServer = loadedShinobiAPI[peerConnectKey]
    var html = `<li class="nav-item monitor-icon monitor_block search-row glM${monitor.mid}" data-ke="${monitor.ke}" data-mid="${monitor.mid}" data-status-code="${monitor.code}" data-peerconnectkey="${peerConnectKey}">
        <a class="launch-live-grid-monitor nav-link ml-0 py-1 px-0" aria-controls="dahsboardTabs" role="button" aria-expanded="true">
            <div class="icon p-0 icon-shape icon-sm text-center d-flex align-items-center justify-content-center">
                <div class="icon-img bg-primary">
                  <img class="snapshot" src="${shinobiServer.buildApiPrefix('icon') + '/' + monitor.mid}">
                </div>
            </div>
            <span class="nav-link-text ms-1">
                ${monitor.name}<br>
                <span class="monitor_status_icon" style="color:${monitorStatusCodes[`c${monitor.code}`]}"><i class="fa fa-${monitorStatusCodes[`i${monitor.code}`]}"></i></span>
                <small class="monitor_status">${monitorStatusCodes[monitor.code]}</small>
                <div class="d-none">
                    <div>${monitor.mid}</div>
                    <div>${monitor.host}</div>
                    <div>${JSON.stringify(monitor.details)}</div>
                    <div>${monitor.tags}</div>
                </div>
            </span>
        </a>
    </li>`
    monitorSideList.append(html)
}
function convertMonitorsToTreeForMenu(){
    const shinobiServer = loadedShinobiAPI[peerConnectKey];
    const monitors = getLoadedMonitors(false)
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
    $.each(loadedShinobiAPI,function(peerConnectKey, { loadedMonitors: monitorsOfServer }){
        var serverName = getServerName(peerConnectKey)
        if(!tree[serverName])tree[serverName] = {};
        $.each(monitorsOfServer, function(n, { mid: monitorId }){
            addMonitor(monitorId, monitorsOfServer[monitorId], serverName)
        });
    });
    return tree;
}
function drawMonitors(){
    monitorSideList.empty()
    var theTreeData = convertMonitorsToTreeForMenu()
    Tree.generate(`#monitorSideList`, theTreeData, {
        liClass: 'search-row',
    });
}
// function resizeMonitorIcons(){
//     var monitorIcons = sidebarMenuInner.find('.monitor_block img')
//     var iconWidth = monitorIcons.first().width()
//     monitorIcons.css({
//         height: `${iconWidth}px`,
//     })
// }
// function fixSideMenuScroll(){
//     sidebarMenuInner.css({
//         height: window.innerHeight,
//         overflow: "auto",
//     })
// }
function correctDropdownPosition(dropdownElement){
    var p = dropdownElement.offset();
    var dropdDownHeight = dropdownElement.height()
    var windowHeight = window.innerHeight
    var modifyX = p.left < 0
    var modifyY = p.top + dropdDownHeight > windowHeight
    if (modifyX || modifyY){
        dropdownElement[0].style = `transform:translate(${modifyX ? -p.left + 20 : 0}px, ${modifyY ? -dropdDownHeight - 20 : 0}px)!important;`
    }
}
function correctDropdownPositionAfterChange(dropdownElement){
    if(sideListMenuDropdownOpen){
        clearTimeout(sideListScrollTimeout)
        sideListScrollTimeout = setTimeout(function(){
            correctDropdownPosition(sideListMenuDropdownOpen)
        },500)
    }
}
// function sortListMonitors(){
//     if(!$user.details.monitorListOrder)$user.details.monitorListOrder = {0:[]}
//     var getIdPlace = function(x){return $user.details.monitorListOrder[0].indexOf(x)}
//     monitorSideList.find('.monitor_block').sort(function(a, b) {
//         var contentA = getIdPlace($(a).attr('data-mid'))
//         var contentB = getIdPlace($(b).attr('data-mid'))
//         return contentA - contentB
//      }).each(function() {
//          monitorSideList.append($(this))
//      })
//      resizeMonitorIcons()
// }
// function toggleSideMenuVisibility(){
//     if(pageTabContainer.hasClass('col-md-9')){
//         sidebarMenu.css('width','0px')
//         pageTabContainer.addClass('col-md-12 col-lg-12')
//         pageTabContainer.removeClass('col-md-9 col-lg-10')
//     }else{
//         sidebarMenu.css('width','')
//         pageTabContainer.removeClass('col-md-12 col-lg-12')
//         pageTabContainer.addClass('col-md-9 col-lg-10')
//     }
// }
// function toggleSideMenuCollapse(dontSaveChange){
//     var isVisible = sideMenuCollapsePoint.hasClass('show')
//     if(isVisible){
//         sideMenuCollapsePoint.collapse('hide')
//     }else{
//         sideMenuCollapsePoint.collapse('show')
//     }
//     if(!dontSaveChange)dashboardOptions('sideMenuCollapsed',!isVisible ? '0' : 1)
// }
// function loadSideMenuCollapseStatus(){
//     var isCollapsed = dashboardOptions().sideMenuCollapsed === 1;
//     if(isCollapsed){
//         sideMenuCollapsePoint.collapse('hide')
//     }else{
//         sideMenuCollapsePoint.collapse('show')
//     }
//     return isCollapsed
// }
function isSideBarMenuCollapsed(){
    // return dashboardOptions().sideMenuCollapsed === 1
}
// function isSideBarMenuHidden(){
//     return dashboardOptions().sideMenuHidden === 1
// }
// function toggleSideBarMenuHide(){
//     var theBody = $('body')
//     theBody.toggleClass('hide-side-menu')
//     var isHidden = theBody.hasClass('hide-side-menu')
//     dashboardOptions('sideMenuHidden',isHidden ? 1 : '0')
//     if(isHidden){
//         floatingHideButton.show()
//         floatingBackButton.hide()
//     }else{
//         floatingHideButton.hide()
//         if(tabTree.back)floatingBackButton.show()
//     }
//     onToggleSideBarMenuHideExtensions.forEach(function(extender){
//         extender(isHidden)
//     })
// }
// function makeMonitorListSortable(){
//     var monitorSideList = $('#monitorSideList')
//     if(isMobile)return;
//     var options = {
//         cellHeight: 80,
//         verticalMargin: 10,
//     };
//     monitorSideList.sortable({
//         containment: "parent",
//         stop : function(event,ui){
//             var order = []
//             var monitorBlocks = monitorSideList.find('.monitor_block')
//             $.each(monitorBlocks,function(n,block){
//                 var mid = $(block).attr('data-mid')
//                 order.push(mid)
//             })
//             $user.details.monitorListOrder = {0: order}
//             mainSocket.f({
//                 f:'monitorListOrder',
//                 monitorListOrder: {0: order}
//             })
//         },
//     })
// }
var sideListMenuDropdownOpen = null
var sideListScrollTimeout = null
monitorSideList.on('mouseup','[data-bs-toggle="dropdown"]',function(){
    var dropdownElement = $(this).next()
    sideListMenuDropdownOpen = dropdownElement
    setTimeout(function(){
        correctDropdownPosition(dropdownElement)
    },500)
})
monitorSideList.on('hidden.bs.dropdown', '[data-bs-toggle="dropdown"]', function(e) {
    sideListMenuDropdownOpen = null
})
// sidebarMenuInner.scroll(correctDropdownPositionAfterChange)
// $('[data-target="#monitorSideList"]').click(function(){
//     setTimeout(resizeMonitorIcons,500)
// })
$(window).resize(function(){
    // fixSideMenuScroll()
    // resizeMonitorIcons()
    correctDropdownPositionAfterChange()
})
$(document).ready(function(){
    $('body').on('click','.hide-side-menu-toggle',function(){
        toggleSideBarMenuHide()
    })
    $('.toggle-menu-collapse').click(function(){
        // toggleSideMenuCollapse()
    })
})
$('body').on('click', '.show-server-pane', function(){
    const fixedPlugin = $('.fixed-plugin')
    if(fixedPlugin.hasClass('show'))return;
    setTimeout(function(){
        fixedPlugin.toggleClass('show')
    },200)
})
addToEventHandler('onDashboardReady', (servers) => {
    // pageTabLinks.find(`.side-menu-link.go-home`).addClass('page-link-active active');
    drawMonitors()
    // fixSideMenuScroll()
    // sortListMonitors()
    // loadSideMenuCollapseStatus()
    // makeMonitorListSortable()
    // if(isSideBarMenuHidden()){
    //     toggleSideBarMenuHide()
    // }
})
addToEventHandler('onServerConnect', (server) => {
    drawMonitors()
})
addToEventHandler('onServerDisconnect', (server) => {
    drawMonitors()
})
onShinobiWebSocketEvent(function(d, peerConnectKey){
    switch(d.f){
        case'monitor_edit':
            drawMonitors()
            sideMenuMonitorSearch.keyup()
        break;
        case'monitor_status':
            var monitorId = d.mid || d.id;
            monitorSideList.find(`[data-mid="${monitorId}"][data-peerconnectkey="${peerConnectKey}"]`).attr('data-status-code',d.code);
        break;
        case'monitor_snapshot':
            setTimeout(function(){
                var snapElement = $(`[data-mid="${d.mid}"][data-peerconnectkey="${peerConnectKey}"] .snapshot`)
                switch(d.snapshot_format){
                    case'plc':
                        snapElement.attr('src',placeholder.getData(placeholder.plcimg({text:d.snapshot.toUpperCase().split('').join(' '), fsize: 25, bgcolor:'#1462a5'})))
                    break;
                    case'ab':
                        var theReader = new FileReader()
                        theReader.addEventListener("loadend",function(){
                            snapElement.attr('src',d.reader.result)
                            delete(theReader)
                        })
                        theReader.readAsDataURL(new Blob([d.snapshot],{type:"image/jpeg"}))
                    break;
                    case'b64':
                        snapElement.attr('src','data:image/jpeg;base64,'+d.snapshot)
                    break;
                }
            },1000)
        break;
    }
})
