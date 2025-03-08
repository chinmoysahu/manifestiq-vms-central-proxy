$(document).ready(function(){
    var loadedMonitorStates = {}
    var loadedSchedules = {}
    var schedulerWindow = $('#tab-schedules')
    var scheduleSelector = $('#schedulesSelector')
    var schedulerForm = schedulerWindow.find('form')
    var selectedStates = schedulerWindow.find('[name="monitorStates"]')
    var selectedDays = schedulerWindow.find('[name="days"]')
    var peerConnectKeysList = schedulerWindow.find('.peerConnectKeys_list')
    var loadedMonitors = {};
    var shinobiServer = {};
    function getFullOrigin(){
        return shinobiServer.apiBaseUrl
    }
    function setSelectedPeerConnectKey(){
        const peerConnectKey = peerConnectKeysList.val()
        shinobiServer = loadedShinobiAPI[peerConnectKey]
        loadedMonitors = shinobiServer.loadedMonitors
        return { peerConnectKey, shinobiServer }
    }
    function getApiPrefix(target){
        return shinobiServer.buildApiPrefix(target)
    }
    var loadSchedules = function(callback){
        $.getJSON(getApiPrefix('schedule'),function(d){
            var html = ''
            $.each(d.schedules,function(n,v){
                loadedSchedules[v.name] = v
                html += createOptionHtml({
                    value: v.name,
                    label: v.name
                })
            })
            scheduleSelector.find('optgroup').html(html)
            if(callback)callback()
        })
    }
    var loadMonitorStates = function(){
        $.getJSON(getApiPrefix('monitorStates'),function(d){
            var html = ''
            $.each(d.presets,function(n,v){
                loadedMonitorStates[v.name] = v
                html += createOptionHtml({
                    value: v.name,
                    label: v.name
                })
            })
            selectedStates.html(html)
        })
    }
    schedulerWindow.on('click','.delete',function(e){
        $.confirm.create({
            title: lang['Delete Schedule'],
            body: lang.deleteScheduleText,
            clickOptions: {
                title: 'Delete',
                class: 'btn-danger'
            },
            clickCallback: function(){
                var form = schedulerForm.serializeObject()
                $.post(getApiPrefix('schedule') + '/' + form.name + '/delete',function(d){
                    debugLog(d)
                    if(d.ok === true){
                        loadSchedules()
                        new PNotify({title:lang.Success,text:d.msg,type:'success'})
                    }
                })
            }
        })
    })
    scheduleSelector.change(function(e){
        var selected = $(this).val()
        var loaded = loadedSchedules[selected]
        var namespace = schedulerWindow.find('[name="name"]')
        var deleteButton = schedulerWindow.find('.delete')
        var tzEl = schedulerWindow.find('[name="timezone"]')
        var startField = schedulerWindow.find('[name="start"]')
        var endField = schedulerWindow.find('[name="end"]')
        selectedStates.find('option').prop('selected',false)
        selectedDays.find('option').prop('selected',false)
        if(loaded){
            namespace.val(loaded.name)
            var html = ''
            $.each(loaded,function(n,v){
                schedulerForm.find('[name="' + n + '"]').val(v)
            })
            $.each(loaded.details.monitorStates,function(n,v){
                selectedStates.find('option[value="' + v + '"]').prop('selected',true)
            })
            $.each(loaded.details.days,function(n,v){
                selectedDays.find('option[value="' + v + '"]').prop('selected',true)
            })
            tzEl.val(loaded.details.timezone || '0')
            deleteButton.show()
        }else{
            tzEl.val('0')
            namespace.val('')
            startField.val('')
            endField.val('')
            deleteButton.hide()
        }
    })
    schedulerForm.submit(function(e){
        e.preventDefault()
        var el = $(this)
        var form = el.serializeObject()
        var monitors = []
        var failedToParseAJson = false
        if(form.name === ''){
            return new PNotify({title:lang['Invalid Data'],text:lang['Name cannot be empty.'],type:'error'})
        }
        if(form.start === ''){
            return new PNotify({title:lang['Invalid Data'],text:lang['Start Time cannot be empty.'],type:'error'})
        }
        if(form.monitorStates instanceof Array === false){
            form.monitorStates = [form.monitorStates]
        }
        if(!form.days || form.days === ''){
            form.days = null
        }else if(form.days instanceof Array === false){
            form.days = [form.days]
        }
        var data = {
            start: form.start,
            end: form.end,
            enabled: form.enabled,
            details: {
                monitorStates: form.monitorStates,
                days: form.days,
                timezone: form.timezone,
            }
        }
        $.post(getApiPrefix('schedule') + '/' + form.name + '/insert',{data:data},function(d){
            debugLog(d)
            if(d.ok === true){
                loadSchedules(function(){
                    scheduleSelector.val(form.name)
                })
                new PNotify({title:lang.Success,text:d.msg,type:'success'})
            }
        })
        return false;
    })
    peerConnectKeysList.change(function(){
        setSelectedPeerConnectKey()
        loadMonitorStates()
        loadSchedules()
    });
    addOnTabOpen('schedules',function(loadedTab){
        drawPeerConnectKeysToSelector(peerConnectKeysList,null,null)
        setSelectedPeerConnectKey()
        loadMonitorStates()
        loadSchedules()
    })
    addOnTabReopen('schedules',function(loadedTab){
        var theSelectedServer = peerConnectKeysList.val()
        theSelectedServer = drawPeerConnectKeysToSelector(peerConnectKeysList,!theSelectedServer,null,theSelectedServer)
        peerConnectKeysList.val(theSelectedServer)
        setSelectedPeerConnectKey()
        loadMonitorStates()
        loadSchedules()
    })
})
