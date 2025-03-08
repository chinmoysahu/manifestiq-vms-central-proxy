async function getSavedIdentifier(peerConnectKey){
    return new Promise((resolve) => {
        const url = `/serverCredentials/get/${peerConnectKey}`;
        $.getJSON(url, (data) => {
            if(!data.ok)console.error(data);
            const serverInfo = data.server || { peerConnectKey };
            loadedIdentifiers[peerConnectKey] = serverInfo;
            resolve(serverInfo);
        });
    });
}
async function setSavedIdentifier(serverInfo){
    const peerConnectKey = serverInfo.peerConnectKey;
    return new Promise((resolve) => {
        const url = `/serverCredentials/add`;
        $.post(url, serverInfo, (data) => {
            if(!data.ok){
                console.error(data);
            }else{
                loadedIdentifiers[peerConnectKey] = serverInfo;
            }
            resolve(data)
        });
    });
}
function getServerName(peerConnectKey){
    const serverInfo = loadedIdentifiers[peerConnectKey]
    return serverInfo.name || peerConnectKey
}
