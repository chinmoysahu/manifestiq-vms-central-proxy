const path = require('path')
const fs = require('fs').promises
const listLocation = path.join(process.cwd(), '/userCredentials.json');
const { generateId, generatePasswordHash, fetchGet } = require('./commonUtils.js')
const shopEndpoint = `https://licenses.shinobi.video/`

async function overwrite(data) {
    try {
        await fs.writeFile(listLocation, JSON.stringify(data, null, 3), 'utf-8');
        return { ok: true };
    } catch (error) {
        return { ok: false, error };
    }
}

async function list() {
    try {
        const data = await fs.readFile(listLocation, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function login(username, password) {
    try {
        const currentList = await list();
        const item = currentList.find(entry => entry.username === username && entry.password === generatePasswordHash(password));
        if (!item) {
            return { ok: false, error: `No entry found for peerConnectKey: ${peerConnectKey}` };
        }
        const sessionId = generateId(15);
        item.sessionId = sessionId;
        return { ok: true, user: item };
    } catch (error) {
        return { ok: false, error };
    }
}

async function createNewUser(username, password, params = {}){
    try {
        let currentList = await list();
        const existingIndex = currentList.findIndex(item => item.username === username);
        const existingUser = currentList[existingIndex];
        const hashedPassword = password ? generatePasswordHash(password) : existingUser ? existingUser.password : generatePasswordHash('password');
        const userInfo = Object.assign({ username, password: hashedPassword }, params)
        if (existingIndex !== -1) {
            currentList[existingIndex] = userInfo;
        } else {
            currentList.push(userInfo);
        }
        const result = await overwrite(currentList);
        if (result.ok === false) throw result.error;

        return { ok: true };
    } catch (error) {
        return { ok: false, error };
    }
}

async function deleteUser(username){
    try {
        let currentList = await list();
        const existingIndex = currentList.findIndex(item => item.username === username);
        if (existingIndex !== -1) {
            currentList.splice(existingIndex, 1);
        }
        const result = await overwrite(currentList);
        if (result.ok === false) throw result.error;

        return { ok: true };
    } catch (error) {
        return { ok: false, error };
    }
}

async function checkApiKey(code) {
    console.log(`${shopEndpoint}api/check?code=${code}`)
    return fetchGet(`${shopEndpoint}api/check`, {
        code: code
    });
}

module.exports = {
    list,
    login,
    generatePasswordHash,
    checkApiKey,
    createNewUser,
    deleteUser,
};
