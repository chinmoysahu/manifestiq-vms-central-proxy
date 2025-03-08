var navBarBreadCrumbs = $('#navbar-breadcrumbs')
var navBarTitle = $('#navbar-title')
var tabTree = {}
var loadedPages = {}
var activeTabName = 'initial'
var pageTabLinks = $('.sidebar-pages')
var createdTabLinks = $('#createdTabLinks')
var pageTabContainer = $('#pageTabContainer')
var floatingBackButton = $('#floating-back-button')
function drawBreadCrumbs(items){
    var breadCrumbClass = 'breadcrumb-item text-sm'
    var html = ''
    var lastItem = items[items.length - 1]
    items.forEach((item, n) => {
        const isLast = n === item.length - 1;
        html += `<li class="${breadCrumbClass} text-white ${isLast ? 'active' : ''}"><a title="${item.label}" class="opacity-5 text-white" href="${item.href ? item.href : 'javascript:;'}">${item.icon ? `<i class="fa fa-${icon}"></i>` : item.label}</a></li>`
    });
    navBarBreadCrumbs.html(html);
    navBarTitle.html(lastItem.label ? lastItem.label : 'No Page Label');
}

function saveTabBlipPosition(tabId){
    var loadedTab = loadedPages[tabId]
    if(!loadedTab)return;
    var theDoc = document.documentElement
    loadedTab.bodyScrollX = parseFloat(`${theDoc.scrollTop}`)
    loadedTab.bodyScrollY = parseFloat(`${theDoc.scrollLeft}`)
}
function loadTabBlipPosition(tabId){
    var loadedTab = loadedPages[tabId]
    if(!loadedTab)return;
    blipTo(loadedTab.bodyScrollX || 0,loadedTab.bodyScrollY || 0)
}

function blipTo(xPageValue,yPageValue){
    document.documentElement.style.scrollBehavior = 'auto';
    setTimeout(() => window.scrollTo(yPageValue, xPageValue), 5);
    setTimeout(() => document.documentElement.style.scrollBehavior = 'smooth', 5);
}

function openTab(theTab,loadData,backAction,haltTrigger,type,overrideOnTabOpen){
    loadData = loadData ? loadData : {}
    if(tabTree && tabTree.back && tabTree.back.name === theTab){
        goBackOneTab()
        return;
    }
    saveTabBlipPosition(activeTabName)
    var allTabs = $('.page-tab');
    allTabs.hide().removeClass('tab-active');
    $(`#tab-${theTab}`).show().addClass('tab-active');
    pageLoadingData = Object.assign(loadData,{});
    if(!haltTrigger){
        tabTree = {
            name: theTab,
            loadData: loadData,
            back: tabTree,
        }
        $('body').trigger(`tab-open-${theTab}`);
    }
    if(tabTree && tabTree.back){
        floatingBackButton.show()
    }else{
        floatingBackButton.hide()
    }
    var targetUiElement = pageTabLinks.find(`.side-menu-link[page-open="${theTab}"]`)
    if(targetUiElement.length > 0){
        pageTabLinks.find(`.side-menu-link`).removeClass('page-link-active active')
        pageTabLinks.find('.nav-tab ul').hide();
        targetUiElement.addClass('page-link-active active').parent('.nav-tab').find('ul').show();
    }
    //
    $('[tab-specific-content]').hide()
    $(`[tab-specific-content="${theTab}"]`).show()
    //
    onTabAway(activeTabName)
    activeTabName = `${theTab}`;
    if(!loadedPages[theTab]){
        loadedPages[theTab] = {
            name: theTab,
            loadData: loadData,
            type: type || 'other'
        }
        overrideOnTabOpen ? overrideOnTabOpen(activeTabName) : onTabOpen(activeTabName)
    }else{
        overrideOnTabOpen ? overrideOnTabOpen(activeTabName) : onTabReopen(activeTabName)
    }
}

function goBackOneTab(){
    if(tabTree && tabTree.back){
        tabTree = tabTree.back
        if(tabTree.backAction)tabTree.backAction()
        if($(`#tab-${tabTree.name}`).length === 0)goBackOneTab();
        openTab(tabTree.name,tabTree.loadData,tabTree.backAction,true)
    }
}

function goBackHome(){
    if(tabTree.back){
        goBackOneTab()
        goBackHome()
    }else{
        pageTabLinks.find(`.side-menu-link`).removeClass('page-link-active active');
        pageTabLinks.find(`.side-menu-link.go-home`).addClass('page-link-active active');
    }
}

function createNewTab(tabName,tabLabel,baseHtml,loadData,backAction,type){
    var theTab = $(`#tab-${tabName}`)
    var existAlready = true
    if(theTab.length === 0){
        var tabIcon = 'file-o'
        existAlready = false
        pageTabContainer.append(baseHtml)
        createdTabLinks.append(buildTabHtml(tabName,tabLabel,tabIcon))
        theTab = $(`#tab-${tabName}`)
    }
    openTab(tabName,loadData,backAction,null,type)
    return {
        existAlready: existAlready,
        theTab: theTab,
    }
}

function buildTabHtml(tabName,tabLabel,tabIcon = 'file-o'){
    return `<li class="nav-item side-menu-link cursor-pointer btn btn-block" page-open="${tabName}">
        <div class="row align-items-center m-0" style="width:100%">
            <div class="col-1 p-0 text-start">
                <i class="fa fa-${tabIcon ? tabIcon : 'file-o'}"></i>
            </div>
            <div class="col text-start flex-grow-1 text-white">
                ${tabLabel}
            </div>
            <div class="col p-0 text-end">
                <span class="delete-tab">
                    <i class="fa fa-times"></i>
                </span>
            </div>
        </div>
    </li>`
}

function deleteTab(tabId){
    $(`[page-open="${tabId}"]`).remove()
    $(`#tab-${tabId}`).remove()
    onTabClose(tabId)
    delete(loadedPages[tabId])
}

var addedOnTabAway = {}
function addOnTabAway(tabId,action){
    if(!addedOnTabAway[tabId])addedOnTabAway[tabId] = []
    addedOnTabAway[tabId].push(action)
}

function onTabAway(tabId){
    var loadedTab = loadedPages[tabId]
    if(!loadedTab)return
    var type = loadedTab.type
    if(addedOnTabAway[tabId]){
        addedOnTabAway[tabId].forEach(function(theAction){
            try{
                theAction(loadedTab)
            }catch(err){
                console.log(err)
            }
        })
    }
}

var addedOnTabReopen = {}
function addOnTabReopen(tabId,action){
    if(!addedOnTabReopen[tabId])addedOnTabReopen[tabId] = []
    addedOnTabReopen[tabId].push(action)
}

function onTabReopen(tabId){
    var loadedTab = loadedPages[tabId]
    if(!loadedTab)return
    var type = loadedTab.type
    loadTabBlipPosition(tabId)
    console.log(`onTabReopen`,tabId,type)
    if(addedOnTabReopen[tabId]){
        addedOnTabReopen[tabId].forEach(function(theAction){
            try{
                theAction(loadedTab)
            }catch(err){
                console.log(err)
            }
        })
    }
}

var addedOnTabOpen = {}
function addOnTabOpen(tabId,action){
    if(!addedOnTabOpen[tabId])addedOnTabOpen[tabId] = []
    addedOnTabOpen[tabId].push(action)
}

function onTabOpen(tabId){
    var loadedTab = loadedPages[tabId]
    if(!loadedTab)return
    var type = loadedTab.type
    loadTabBlipPosition(tabId)
    if(addedOnTabOpen[tabId]){
        addedOnTabOpen[tabId].forEach(function(theAction){
            theAction(loadedTab)
        })
    }
}


var addedOnTabClose = {}
function addOnTabClose(tabId,action){
    addedOnTabClose[tabId] = action
}

function onTabClose(tabId){
    var loadedTab = loadedPages[tabId]
    if(!loadedTab)return
    var type = loadedTab.type
    console.log(`onTabClose`,tabId,type)
    if(addedOnTabClose[tabId])addedOnTabClose[tabId](loadedTab)
}


$(document).ready(function(){
    $('body')
        .on('click','.go-home',goBackHome)
        .on('click','.go-back',goBackOneTab)
        .on('click','.delete-tab',function(e){
            e.preventDefault()
            e.stopPropagation()
            var tabName = $(this).parents(`[page-open]`).attr(`page-open`)
            if(activeTabName === tabName){
                goBackOneTab()
            }
            deleteTab(tabName)
            return false;
        })
        .on('click','.delete-tab-dynamic',function(e){
            e.preventDefault()
            e.stopPropagation()
            var tabName = $(this).parents('.page-tab').attr('id').replace('tab-','')
            goBackOneTab()
            deleteTab(tabName)
            return false;
        })
        .on('click','[page-open]',function(){
            var el = $(this)
            var pageChoice = el.attr('page-open')
            var pageOptions = JSON.parse(el.attr('page-options') || '{}')
            if(tabTree.name === pageChoice)return;
            openTab(pageChoice,pageOptions)
        })
})
