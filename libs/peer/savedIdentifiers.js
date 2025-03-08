const fs = require('fs').promises;
const path = require('path');
const listLocation = path.join(process.cwd(), '/savedIdentifiers.json');

async function list() {
    try {
        const data = await fs.readFile(listLocation, 'utf-8');
        return { ok: true, list: JSON.parse(data) };
    } catch (error) {
        console.log(error, new Error())
        return { ok: false, error, list: [] };
    }
}
async function overwrite(data) {
    try {
        await fs.writeFile(listLocation, JSON.stringify(data, null, 3), 'utf-8');
        return { ok: true };
    } catch (error) {
        return { ok: false, error };
    }
}
async function add(serverInfo) {
    const { peerConnectKey } = serverInfo;
    try {
        let currentList = (await list()).list;
        const existingIndex = currentList.findIndex(item => item.peerConnectKey === peerConnectKey);
        if (existingIndex !== -1) {
            currentList[existingIndex] = serverInfo;
        } else {
            currentList.push(serverInfo);
        }
        const result = await overwrite(currentList);
        return result;
    } catch (error) {
        return { ok: false, error };
    }
}
async function remove(peerConnectKey) {
    try {
        let currentList = await list();
        currentList = currentList.filter(item => item.peerConnectKey !== peerConnectKey);
        const result = await overwrite(currentList);
        if (result.ok === false) throw result.error;

        return { ok: true };
    } catch (error) {
        return { ok: false, error };
    }
}
async function get(peerConnectKey) {
    try {
        const currentList = (await list()).list;
        const item = currentList.find(entry => entry.peerConnectKey === peerConnectKey);
        if (!item) {
            return { ok: false, error: `No entry found for peerConnectKey: ${peerConnectKey}` };
        }

        return { ok: true, server: item };
    } catch (error) {
        console.error(error)
        return { ok: false, error };
    }
}

module.exports = {
    list,
    overwrite,
    add,
    get,
    remove,
    update: add,
}
