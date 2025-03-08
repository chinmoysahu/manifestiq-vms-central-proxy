const path = require('path')
const fs = require('fs').promises
const listLocation = path.join(process.cwd(), '/userPermissions.json');
global.loadedPermissions = null;

async function overwritePermissions(data) {
    try {
        await fs.writeFile(listLocation, JSON.stringify(data, null, 3), 'utf-8');
        return { ok: true };
    } catch (error) {
        return { ok: false, error };
    }
}

async function listPermissions() {
    try {
        if(global.loadedPermissions){
            return global.loadedPermissions;
        }
        const data = await fs.readFile(listLocation, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

function getPermissionSet(name){
    return global.loadedPermissions[name] || { all: '1' };
}

async function createPermissionSet(params = {}){
    try {
        if(!params.name)return { ok: false, error: 'Name Missing' }
        if(typeof params.all !== 'string')params.all = '1'
        global.loadedPermissions[params.name] = params;
        const result = await overwritePermissions(global.loadedPermissions);
        if (result.ok === false) throw result.error;

        return { ok: true };
    } catch (error) {
        return { ok: false, error };
    }
}

async function deletePermissionSet(name){
    try {
        delete(global.loadedPermissions[name]);
        const result = await overwritePermissions(global.loadedPermissions);
        if (result.ok === false) throw result.error;

        return { ok: true };
    } catch (error) {
        return { ok: false, error };
    }
}

listPermissions().then((theList) => {
    global.loadedPermissions = theList;
})

module.exports = {
    listPermissions,
    getPermissionSet,
    createPermissionSet,
    deletePermissionSet,
};
