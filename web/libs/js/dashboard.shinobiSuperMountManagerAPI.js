class superUserMountManager {
    constructor(peerConnectKey, superApiKey) {
        this.loadedMounts = {};
        this.peerConnectKey = peerConnectKey;
        this.superApiKey = superApiKey;
        this.apiBaseUrl = `${shinobiServerHost}/s/${peerConnectKey}`
    }

    buildApiPrefix(endpoint) {
        return `${this.apiBaseUrl}/super/${this.superApiKey}/${endpoint}`
    }

    getMountId(theMount){
        return `${theMount.mountPoint.split('/').join('_')}`
    }

    loadMounts(callback) {
        var _this = this;
        return new Promise((resolve,reject) => {
            $.getJSON(this.buildApiPrefix('mountManager/list'),function(data){
                $.each(data.mounts,function(n,theMount){
                    _this.loadedMounts[_this.getMountId(theMount)] = theMount;
                });
                if(callback)callback(data.mounts);
                resolve(data);
            })
        })
    }
    addMount(form) {
        return new Promise((resolve,reject) => {
            // const { sourceTarget, localPath, mountType, options } = form;
            $.post(this.buildApiPrefix('mountManager/mount'), form,function(data){
                resolve(data)
            })
        })
    }
    removeMount(localPath) {
        return new Promise((resolve,reject) => {
            $.post(this.buildApiPrefix('mountManager/removeMount'),{
                localPath
            },function(data){
                resolve(data)
            })
        })
    }
    setVideosDir(localPath, pathInside) {
        return new Promise((resolve,reject) => {
            $.post(this.buildApiPrefix('mountManager/setVideosDir'),{
                localPath,
                pathInside
            },function(data){
                resolve(data)
            })
        })
    }

    launchSetVideoDirConfirm(localPath){
        var _this = this;
        $.confirm.create({
            title: lang['Set New Videos Directory'],
            body: `<b>${lang['Mount Path']} : ${localPath}</b><br>${lang.setVideosDirWarning} ${lang.restartRequired}<br><br><input placeholder="${lang['Path Inside Mount']}" class="form-control" id="newVideosDirInnerPath">`,
            clickOptions: {
                class: 'btn-success',
                title: lang.Save,
            },
            clickCallback: async function(){
                const pathInside = $('#newVideosDirInnerPath').val().trim();
                const response = await _this.setVideosDir(localPath, pathInside);
                if(response.ok){
                    new PNotify({
                        title: lang['New Videos Directory Set'],
                        text: lang.restartRequired,
                        type: 'success'
                    })
                }else{
                    new PNotify({
                        title: lang['Action Failed'],
                        text: lang['See System Logs'],
                        type: 'danger'
                    })
                }
            }
        })
    }
}
