function listPermissions(){
    return new Promise((resolve) => {
        $.getJSON('/api/permissions',function(data){
            resolve(data.permissions)
        })
    })
}
$(document).ready(function(e){
    var theWindow = $('#tab-userPermissions')
    var theDropdown = $('#userPermissionsSelector')
    var shinobiApiKeyPermissions = $('#apiKeyShinobiAssociation')
    var theForm = theWindow.find('form');
    var allPermissionsSelect = theForm.find('[selector="userPermissions_allPermissions"]');
    var deleteButton = theWindow.find('.delete');
    var loadedPermissions = {}
    function getPermissionSet(name){
        return new Promise((resolve) => {
            $.getJSON(`/api/permissions/get/${name}`,function(data){
                resolve(data.permission)
            })
        })
    }
    async function getFormFields(){
        var formValues = theForm.serializeObject();
        var pagesAllowed = theForm.find('[page-allowed]:checked');
        formValues.pages = [];
        pagesAllowed.each(function(n,v){
            var el = $(v);
            var key = el.attr('page-allowed')
            formValues.pages.push(key)
        })
        formValues.credentials = await getAndFillApiKeysForPermissions()
        return formValues
    }
    async function createPermissionSet(){
        var formValues = await getFormFields();
        return new Promise((resolve) => {
            if(!formValues.name)return resolve({ ok: false, error: lang['Failed Action'] });
            $.post(`/api/permissions/add`,formValues, async function(data){
                const notify = {
                    type: 'success',
                    title: lang['Saved Permissions'],
                }
                if(!data.ok){
                    notify.type = 'danger'
                    notify.title = lang['Failed Action']
                    notify.text = data.error
                }else{
                    loadedPermissions[formValues.name] = formValues;
                    await loadPermissions()
                    theDropdown.val(formValues.name)
                }
                new PNotify(notify)
                resolve(data)
            })
        })
    }
    function deletePermissionSet(name){
        return new Promise((resolve) => {
            $.post(`/api/permissions/delete`,{
                name,
            },function(response){
                resolve(response)
            })
        })
    }
    async function loadPermissions(){
        var html = ''
        const list = await listPermissions()
        loadedPermissions = {}
        $.each(list,function(name,item){
            loadedPermissions[name] = item;
            html += createOptionHtml({
                value: name,
                label: name
            })
        })
        theDropdown.find('optgroup').html(html)
    }
    function loadPermissionToForm(name){
        if(!name){
            deleteButton.hide();
            clearPermissionForm()
            loadAllServerApiKeysPermissions()
        }else{
            const permission = loadedPermissions[name]
            $.each(permission,function(key, value){
                theForm.find(`[name="${key}"]`).val(value)
            });
            theForm.find(`[page-allowed]`).prop('checked', false)
            $.each(permission.pages,function(key, value){
                theForm.find(`[page-allowed="${value}"]`).prop('checked', true)
            })
            loadAllServerApiKeysPermissions(permission)
            deleteButton.show();
        }
        allPermissionsSelect.change();
    }
    function clearPermissionForm(permission){
        theDropdown.val('')
        theForm.find(`[name="all"]`).val('1').change()
        theForm.find(`[page-allowed]`).prop('checked', false)
    }
    // API Keys >
    var permissionTypeNames = [
        { name: 'monitors', label: lang['Can View Monitor'] },
        { name: 'monitor_edit', label: lang['Can Edit Monitor'] },
        { name: 'video_view', label: lang['Can View Videos and Events'] },
        { name: 'video_delete', label: lang['Can Delete Videos and Events'] },
    ];
    async function drawApiKeyPermissions(peerConnectKey){
        const savedIdentifier = loadedIdentifiers[peerConnectKey];
        const fields = { ...pageLayouts['API Keys For User Permissions'].blocks };
        var fieldsAddNew = fields['Add New'];
        fieldsAddNew.name = `${savedIdentifier.name || peerConnectKey}`
        fieldsAddNew.id = `apiKeySectionAddNew-${peerConnectKey}`;
        fieldsAddNew.info[0].id = `apiKey_permissions-${peerConnectKey}`;
        fieldsAddNew.info[3].id = `apiKeys_monitors-${peerConnectKey}`;
        var html = `<div api-key-permissions="${peerConnectKey}" class="card">${Object.values(fields).map(item => drawBlock(item)).join('')}</div>`;
        shinobiApiKeyPermissions.html(html)
    }
    function drawSelectableForPermissionForm(apiKey = { details: {} }){
        var permission = apiKey.details.monitorPermissions || {}
        var html = `
        <thead class="text-center">
            <tr>
                <td></td>
                <td></td>
                ${permissionTypeNames.map(permissionType => `<td><a class="btn btn-sm btn-primary" toggle-checkbox="${permissionType.name}">${permissionType.label}</a></td>`).join('')}
            </tr>
        </thead>
        <tbody class="text-center">`
        $.each(getLoadedMonitorsAlphabetically(peerConnectKey),function(n,monitor){
            html += `<tr class="search-row permission-view" style="vertical-align: baseline;">`
                html += `<td class="text-start">${monitor.name} (${monitor.mid})</td>`
                html += `<td>${(monitor.tags || '').split(',').map(item => `<span class="label label-primary">${item}</span>`)}</td>`
                $.each(permissionTypeNames,function(n,permissionType){
                    const isChecked = permission && (permission[permissionType.name] || []).indexOf(monitor.mid) > -1;
                    html += `<td><input class="form-check-input" type="checkbox" data-monitor="${monitor.mid}" value="${permissionType.name}" ${isChecked ? 'checked' : ''}></td>`
                })
            html += `</tr>`
        })
        html += '</tbody>'
        $(`#apiKeys_monitors-${peerConnectKey}`).html(html)
    }
    async function loadApiKeyPermissions(peerConnectKey, permission = { credentials: {} }){
        const apiKeyCode = (permission.credentials || {})[peerConnectKey];
        const apiKey = apiKeyCode ? await loadedShinobiAPI[peerConnectKey].getApiKey(apiKeyCode) : null;
        if(apiKey){
            const drawnForm = shinobiApiKeyPermissions.find(`[api-key-permissions="${peerConnectKey}"]`)
            const userPermissionsEl = $(`#apiKey_permissions-${peerConnectKey}`)
            const monitorPermissionsEl = $(`#apiKeys_monitors-${peerConnectKey}`)
            $.each(apiKey.details,function(key, value){
                drawnForm.find(`[detail="${key}"]`).val(value);
            });
            userPermissionsEl.find('[apikey-permissions-allowed]').each(function(n, v){
                const el = $(v);
                const key = el.attr('apikey-permissions-allowed');
                if(apiKey.details[key] === '1'){
                    el.prop('checked',true)
                }else{
                    el.prop('checked',false)
                }
            });
            $.each(apiKey.details.monitorPermissions || {},function(key, monitorIds){
                monitorPermissionsEl.find(`input[value="${key}"]`).prop('checked',true);
            });
            drawSelectableForPermissionForm(apiKey)
        }else{
            drawSelectableForPermissionForm()
        }
    }
    async function loadAllServerApiKeysPermissions(permission){
        const serverKeys = Object.keys(loadedShinobiAPI);
        for(peerConnectKey of serverKeys){
            drawApiKeyPermissions(peerConnectKey)
            loadApiKeyPermissions(peerConnectKey, permission)
        }
    }
    function getApiKeyFormDetails(peerConnectKey){
        var drawnForm = shinobiApiKeyPermissions.find(`[api-key-permissions="${peerConnectKey}"]`)
        var details = {};
        drawnForm.find('[detail]').each(function(n,v){
            var el = $(v);
            var key = el.attr('detail');
            var value = el.val();
            details[key] = value;
        });
        $(`#apiKey_permissions-${peerConnectKey}`).find('[apikey-permissions-allowed]').each(function(n,option){
            var el = $(option)
            var permissionValue = el.attr('apikey-permissions-allowed')
            if(el.prop('checked')){
                details[permissionValue] = "1"
            }else{
                details[permissionValue] = "0"
            }
        });
        details.monitorPermissions = details.monitorsRestricted === '1' ? getMonitorsSelectedInPermissionForm(peerConnectKey) : {};
        return {
            ip: '0.0.0.0',
            details,
        }
    }
    function getMonitorsSelectedInPermissionForm(peerConnectKey){
        const monitors = {
            'monitors': [],
            'monitor_edit': [],
            'video_view': [],
            'video_delete': [],
        };
        $(`#apiKeys_monitors-${peerConnectKey} .permission-view input:checked`).each(function(n,v){
            var el = $(v)
            var monitorId = el.attr('data-monitor')
            var permissionType = el.val() // permissions selected
            monitors[permissionType].push(monitorId)
        });
        return monitors
    }
    function isApiKeyMatching(formValues, apiKeyRow){
        const obj1 = Object.assign({}, formValues);
        const obj2 = Object.assign({}, apiKeyRow);
        for(ignoredKey of (['ke', 'uid', 'code', 'time', 'peerConnectKey'])){
            delete(obj1[ignoredKey])
            delete(obj2[ignoredKey])
        }
        obj1.ip = '0.0.0.0'
        obj1.details.permissionSet = ''
        obj1.details.treatAsSub = '1'
        const isSame = areObjectsTheSame(obj1, obj2, apiKeyRow.code);
        // console.log('--------')
        // console.log('compare', isSame)
        // console.log('compare', isSame, JSON.stringify(obj1,null,3), JSON.stringify(obj2,null,3))
        return isSame
    }
    async function findApiKeyBasedOnPermissions(peerConnectKey){
        const shinobiServer = loadedShinobiAPI[peerConnectKey];
        const formValues = getApiKeyFormDetails(peerConnectKey);
        const apiKeys = await shinobiServer.getApiKeys();
        let foundKey = null;
        for(apiKey of apiKeys){
            var isMatching = isApiKeyMatching(formValues, apiKey);
            if(isMatching){
                foundKey = apiKey.code;
                break;
            }
        }
        return foundKey;
    }
    async function getAllMatchingServerApiKeys(){
        const serverKeys = Object.keys(loadedShinobiAPI);
        const matching = {}
        for(peerConnectKey of serverKeys){
            matching[peerConnectKey] = null
            var foundMatchingApiKey = await findApiKeyBasedOnPermissions(peerConnectKey);
            if(foundMatchingApiKey){
                matching[peerConnectKey] = foundMatchingApiKey;
            }
        }
        return matching;
    }
    async function createApiKeysForNonMatching(matching){
        for(peerConnectKey in matching){
            const matched = matching[peerConnectKey];
            if(!matched){
                const shinobiServer = loadedShinobiAPI[peerConnectKey];
                const formValues = getApiKeyFormDetails(peerConnectKey);
                delete(formValues.code);
                formValues.ip = '0.0.0.0';
                formValues.details.treatAsSub = '1';
                const { api: insertQuery } = await shinobiServer.createApiKey(formValues);
                matching[peerConnectKey] = insertQuery.code
            }
        }
    }
    async function getAndFillApiKeysForPermissions(){
        const matching = await getAllMatchingServerApiKeys();
        await createApiKeysForNonMatching(matching);
        return matching
    }
    // API Keys />
    theWindow.on('change', '[selector]', function(){
        onSelectorChange(this,theWindow)
    })
    theWindow.on('click', '.submit', function(){
        theForm.submit()
    })
    theForm.submit(function(e){
        e.preventDefault()
        createPermissionSet()
        return false;
    })
    deleteButton.click(function(e){
        var name = theDropdown.val()
        if(loadedPermissions[name]){
            $.confirm.create({
                title: lang["Delete Permission"],
                body: `${lang.DeleteThisMsg}`,
                clickOptions: {
                    title: '<i class="fa fa-trash-o"></i> ' + lang.Delete,
                    class: 'btn-danger btn-sm'
                },
                clickCallback: async function(){
                    const response = await deletePermissionSet(name)
                    if(response.ok){
                        await loadPermissions()
                        clearPermissionForm()
                    }else{
                        new PNotify({
                            type: 'danger',
                            title: lang['Failed Action'],
                            text: data.error,
                        })
                    }
                }
            });
        }
    })
    theDropdown.change(function(){
        var name = $(this).val();
        loadPermissionToForm(name)
    })
    allPermissionsSelect.change(function(){
        var isYes = $(this).val() === '1';
        var apiKeySections = theWindow.find('.api-key-section');
        apiKeySections.find(`[detail="monitorsRestricted"]`).val(isYes ? '0' : '1').change()
        apiKeySections.find(`[apikey-permissions-allowed]`).prop('checked', isYes)
        // apiKeySections[isYes ? 'hide' : 'show']()
    })
    theWindow.on('click', '[toggle-checkbox]',function(){
        var el = $(this);
        var monitorsTable = el.parents('.monitors_table')
        var target = el.attr('toggle-checkbox')
        var checkBoxes = monitorsTable.find(`.permission-view [value="${target}"]:visible`);
        var isChecked = checkBoxes.first().prop('checked')
        checkBoxes.prop('checked', !isChecked)
    })
    addOnTabOpen('userPermissions', function () {
        loadPermissions()
        loadPermissionToForm()
    })
    addOnTabReopen('userPermissions', function () {
        var theSelected = theDropdown.val()
        loadPermissions()
        theDropdown.val(theSelected)
    })
})
