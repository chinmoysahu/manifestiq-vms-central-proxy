$(document).ready(function(){
    const theEnclosure = $('#tab-superMountManager')
    const theSearch = $('#mountManagerListSearch')
    const theTable = $('#mountManagerListTable tbody')
    const newMountForm = $('#mountManagerNewMount')
    const peerConnectKeysList = theEnclosure.find('.peerConnectKeys_list')
    function getMountId(theMount){
        return `${theMount.mountPoint.split('/').join('_')}`
    }
    function drawMountToTable(theMount){
        const mountManager = getMountManager()
        var html = `
        <tr row-mounted="${getMountId(theMount)}">
            <td class="align-middle">
                <div>${theMount.device}</div>
                <div><small>${theMount.mountPoint}</small></div>
            </td>
            <td class="align-middle">
                ${theMount.type}
            </td>
            <td class="align-middle">
                ${theMount.options}
            </td>
            <td class="align-middle">
                <a class="btn btn-primary btn-sm cursor-pointer edit" title="${lang.Edit}"><i class="fa fa-pencil-square-o"></i></a>
                <a class="btn btn-success btn-sm cursor-pointer setVideosDir" title="${lang.videosDir}"><i class="fa fa-download"></i></a>
                <a class="btn btn-danger btn-sm cursor-pointer delete" title="${lang.Delete}"><i class="fa fa-trash-o"></i></a>
            </td>
        </tr>`
        theTable.append(html)
    }
    function drawMountsTable(data){
        theTable.empty()
        $.each(data,function(n,theMount){
            if(
                theMount.type === 'cifs' ||
                theMount.type === 'nfs' ||
                theMount.type === 'ext4' && theMount.mountPoint !== '/'
            )drawMountToTable(theMount)
        });
    }
    function filterMountsTable(theSearch = '') {
        const mountManager = getMountManager()
        var searchQuery = theSearch.trim().toLowerCase();
        if(searchQuery === ''){
            theTable.find(`[row-mounted]`).show()
            return;
        }
        var rows = Object.values(mountManager.loadedMounts);
        var filtered = []
        rows.forEach((row) => {
            var searchInString = JSON.stringify(row).toLowerCase();
            var theElement = theTable.find(`[row-mounted="${getMountId(row)}"]`)
            if(searchInString.indexOf(searchQuery) > -1){
                theElement.show()
            }else{
                theElement.hide()
            }
        })
        return filtered
    }

    function getMountManager(peerConnectKey = peerConnectKeysList.val()){
        return loadedSuperUsers[peerConnectKey].mountManager
    }

    async function drawMounts(peerConnectKey){
        const mountManager = getMountManager()
        await mountManager.loadMounts(drawMountsTable)
        theSearch.val('')
    }

    function launchSetVideoDirConfirm(localPath){
        const mountManager = getMountManager()
        mountManager.launchSetVideoDirConfirm(localPath)
    }

    newMountForm.submit(async function(e){
        e.preventDefault();
        const mountManager = getMountManager()
        const form = newMountForm.serializeObject();
        $.each(form, function(key,val){form[key] = val.trim()});
        const response = await mountManager.addMount(form);
        const notify = {
            title: lang['Mount Added'],
            text: lang.mountAddedText,
            type: 'success'
        }
        if(!response.ok){
            notify.title = lang['Failed to Add Mount']
            notify.text = response.error
            notify.type = 'danger'
        }else{
            const theMount = response.mount
            const mountId = getMountId(theMount);
            theTable.find(`[row-mounted="${mountId}"]`).remove()
            mountManager.loadedMounts[mountId] = theMount;
            drawMountToTable(theMount);
        }
        new PNotify(notify)
        return false;
    });
    theTable.on('click','.delete', async function(e){
        const mountManager = getMountManager()
        const el = $(this).parents('[row-mounted]')
        const mountId = el.attr('row-mounted');
        const theMount = mountManager.loadedMounts[mountId]
        const localPath = theMount.mountPoint
        $.confirm.create({
            title: lang['Delete Mount'],
            body: `<b>${lang['Mount Path']} : ${localPath} (${theMount.type})</b><br><small>${theMount.device}</small><br>${lang.setVideosDirWarning}`,
            clickOptions: {
                class: 'btn-danger',
                title: lang.Delete,
            },
            clickCallback: async function(){
                const response = await mountManager.removeMount(localPath);
                if(response.ok){
                    el.remove()
                }else{
                    new PNotify({
                        title: lang['Failed to Remove Mount'],
                        text: lang['See System Logs'],
                        type: 'danger'
                    })
                }
            }
        })
    })
    theTable.on('click','.edit', async function(e){
        const mountManager = getMountManager()
        const el = $(this).parents('[row-mounted]')
        const mountId = el.attr('row-mounted');
        const theMount = mountManager.loadedMounts[mountId]
        console.log(theMount)
        newMountForm.find('[name="sourceTarget"]').val(theMount.device)
        newMountForm.find('[name="localPath"]').val(theMount.mountPoint)
        newMountForm.find('[name="mountType"]').val(theMount.type)
        newMountForm.find('[name="options"]').val(theMount.options)
    })
    theTable.on('click','.setVideosDir', function(e){
        const mountManager = getMountManager()
        const el = $(this).parents('[row-mounted]')
        const mountId = el.attr('row-mounted');
        const theMount = mountManager.loadedMounts[mountId]
        const localPath = theMount.mountPoint
        mountManager.launchSetVideoDirConfirm(localPath)
    })
    theEnclosure.on('click','.setDefaultVideosDir', function(e){
        launchSetVideoDirConfirm('__DIR__/videos')
    })
    theSearch.keydown(function(){
        const value = $(this).val().trim()
        filterMountsTable(value)
    })
    peerConnectKeysList.change(function(){
        const peerConnectKey = peerConnectKeysList.val()
        drawMounts(peerConnectKey)
    })
    addOnTabOpen('superMountManager', function () {
        const firstServer = drawPeerConnectKeysToSelector(peerConnectKeysList,null,null)
        drawMounts(firstServer)
    })
    addOnTabReopen('superMountManager', function () {
        var theSelectedServer = `${peerConnectKeysList.val()}`
        drawPeerConnectKeysToSelector(peerConnectKeysList,null,null)
        peerConnectKeysList.val(theSelectedServer)
        drawMounts(theSelectedServer)
    })
})
