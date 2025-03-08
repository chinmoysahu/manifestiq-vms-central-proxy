function addShinobiServer(form){
    let hostServer = form.host;
    if(!hostServer.includes('://'))hostServer = `http://${hostServer}`;
    if(hostServer.split(':').length === 2)hostServer = `${hostServer}:8091`
    if(!hostServer.endsWith('/'))hostServer = `${hostServer}/`
    if(!form.managementServer)form.managementServer = `ws://${location.hostname}:${peerPort}`
    const managementServer = form.managementServer.startsWith('ws://') ? form.managementServer : `ws://${form.managementServer}`
    return new Promise((resolve) => {
        $.post(`${hostServer}mgmt/connect`, {
            managementServer,
            peerConnectKey: form.peerConnectKey,
        },function(data){
            if(data.ok){
                new PNotify({
                    title: lang['Added Server'],
                    text: lang.AddedServerText,
                    type: 'success'
                });
            }else{
                console.error(data)
                new PNotify({
                    title: lang['Action Failed'],
                    text: JSON.stringify(data,null,3),
                    type: 'danger'
                });
            }
            resolve(data)
        }).fail(function(err){
            console.error(err)
            new PNotify({
                title: lang['Action Failed'],
                text: err.toString(),
                type: 'danger'
            });
            resolve({ ok: false, err })
        })
    })
}
function removeShinobiServer(apiEndpoint, peerConnectKey){
    return new Promise((resolve) => {
        $.post(`${apiEndpoint}`, {
            managementServer: `ws://${location.hostname}:${peerPort}`,
            peerConnectKey
        },function(data){
            if(data.ok){
                new PNotify({
                    title: lang['Removed Server'],
                    text: lang.RemovedServerText,
                    type: 'success'
                });
            }else{
                console.error(data)
            }
            resolve(data)
        }).fail(function(err){
            console.error(err)
            resolve({ ok: false, err })
        })
    })
}
$(document).ready(function(){
    const theEnclosure = $('#modal-serverPairForm')
    const theForm = theEnclosure.find('form')
    theForm.submit(async function(e){
        e.preventDefault();
        const form = theForm.serializeObject();
        const response = await addShinobiServer(form);
        if(response.ok)theEnclosure.modal('hide')
        return false;
    });
    $('body').on('click', '.remove-shinobi-server', function(){
        const peerConnectKey = $(this).parents(`[drawn-id]`).attr('drawn-id')
        const shinobiServer = loadedSuperUsers[peerConnectKey]
        const apiBaseUrl = shinobiServer.buildApiPrefix('mgmt/disconnect')
        $.confirm.create({
            title: lang["Remove Server"],
            body: lang.RemoveServerText,
            clickOptions: {
                title: '<i class="fa fa-trash-o"></i> ' + lang.Disconnect,
                class: 'btn-danger btn-sm'
            },
            clickCallback: async function(){
                await removeShinobiServer(apiBaseUrl, peerConnectKey)
            }
        });
    });
    theForm.find('[name="managementServer"]').attr('placeholder', `ws://${location.hostname}:${peerPort}`)
})
