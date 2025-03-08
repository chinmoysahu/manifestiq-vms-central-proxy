function loadHiddenSectionsInForms(){
    window.boxWrappersHidden = dashboardOptions().boxWrappersHidden || {}
    $.each(boxWrappersHidden,function(boxId,hide){
        if(hide){
            $(`#${boxId}`).addClass('hide-box-wrapper')
        }
    })
}
function loadSwitchStates(){
    var theSwitches = dashboardOptions().switches;
    if(!theSwitches){
        theSwitches = {
            notifyHide: 0,
            monitorMuteAudio: 1,
        }
        dashboardOptions('switches',theSwitches)
    }
    $.each(theSwitches,function(systemSwitch,toggleState){
        setSwitchUIState(systemSwitch,toggleState)
        runDashboardSwitchCallback(systemSwitch)
    })
}
function loadClassToggleStates(){
    var theClassToggles = dashboardOptions().class_toggle;
    if(theClassToggles){
        $.each(theClassToggles,function(n,v){
            var classToToggle = v[0]
            var togglePosition = v[1]
            if(togglePosition === 1){
                $(n).addClass(v[0])
            }else{
                $(n).removeClass(v[0])
            }
            if(v[2] && v[3]){
                var iconTarget = v[3]
                var iconClassesToToggle = v[2]
                var iconElement = $(`[class_toggle="${classToToggle}"] ${iconTarget}`)
                iconElement
                    .addClass(iconClassesToToggle[togglePosition])
                    .removeClass(iconClassesToToggle[togglePosition === 1 ? 0 : 1])
            }
        })
    }
}
function loadDropdownToggleStates(){
    var theDropdownToggles = dashboardOptions().dropdown_toggle
    if(theDropdownToggles){
        $.each(theDropdownToggles,function(n,v){
            $('[dropdown_toggle="'+n+'"]').val(v).change()
        })
    }
}
function loadLocalStorageInputValues(){
    var theLocalStorageBasedInputs = dashboardOptions()
    if(theLocalStorageBasedInputs){
        $.each(theLocalStorageBasedInputs,function(n,v){
            if(typeof v==='string'){
                var el = $('[localStorage="'+n+'"]')
                if(el.is(':checkbox') === false){
                    el.val(v)
                }
            }
        })
    }
}
function loadBoxWrappers() {
    window.boxWrappersHidden = dashboardOptions().boxWrappersHidden
}
function onFullScreenChange() {
    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
    if(!fullscreenElement){
        $('.videoPlayer-detection-info').removeClass('hide')
        $('.fullscreen').removeClass('fullscreen')
        setTimeout(function(){
            $('canvas.stream-element').resize();
        },2000)
    }
}
$('body')
.one('click',function(){
    window.hadFocus = true
})
.on('change','[localStorage]',function(){
    var el = $(this)
    var keyName = el.attr('localStorage')
    var value = el.val()
    dashboardOptions(keyName,value)
})
.on('change','[dropdown_toggle]',function(){
    var el = $(this);
    var keyName = el.attr('dropdown_toggle');
    var value = el.val();
    var dropdownToggles = dashboardOptions().dropdown_toggle || {};
    dropdownToggles[keyName] = value
    dashboardOptions('dropdown_toggle',dropdownToggles)
})
.on('dblclick','[type="password"],.password_field',function(){
    var _this = $(this)
    var type = 'password'
    _this.addClass('password_field')
    if(_this.attr('type') === 'password'){
        type = 'text'
    }
    _this.attr('type',type)
})
.on('click','.form-section-header:not(.no-toggle-header)', function(e){
    var parent = $(this).parent('.form-group-group')
    var boxWrapper = parent.attr('id')
    parent.toggleClass('hide-box-wrapper')
    var hideBoxWrapper = parent.hasClass('hide-box-wrapper')
    boxWrappersHidden[boxWrapper] = hideBoxWrapper
    dashboardOptions('boxWrappersHidden',boxWrappersHidden)
})
$(document).ready(function(){
    loadBoxWrappers()
    loadHiddenSectionsInForms()
    loadClassToggleStates()
    loadDropdownToggleStates()
    loadLocalStorageInputValues()

    document.addEventListener("fullscreenchange", onFullScreenChange, false);
    document.addEventListener("webkitfullscreenchange", onFullScreenChange, false);
    document.addEventListener("mozfullscreenchange", onFullScreenChange, false);

    if(localStorage.getItem('darkMode') == '1'){
        darkMode(true)
    }
    loadSwitchStates()
})
