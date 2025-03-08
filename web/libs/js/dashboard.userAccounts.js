function listUsers(){
    return new Promise((resolve) => {
        $.getJSON('/api/users',function(data){
            resolve(data.users)
        })
    })
}
$(document).ready(function(e){
    var theWindow = $('#tab-userAccounts')
    var theDropdown = $('#userAccountSelector')
    var userAssociationTable = $('#userAccountShinobiAssociation')
    var theForm = theWindow.find('form');
    var permissionsDropdown = theForm.find('[name="permissionSet"]');
    var deleteButton = theWindow.find('.delete');
    var loadedUsers = {}
    var loadedPermissions = {}
    function createNewUser(){
        var formValues = theForm.serializeObject()
        return new Promise((resolve) => {
            if(!formValues.username)return resolve({ ok: false, error: lang['Failed Action'] });
            $.post(`/api/users/add`,formValues,function(data){
                const notify = {
                    type: 'success',
                    title: lang['Saved'],
                }
                if(!data.ok){
                    notify.type = 'danger'
                    notify.title = lang['Failed Action']
                    notify.text = data.error
                }
                new PNotify(notify)
                resolve(data)
            })
        })
    }
    function deleteUser(username){
        return new Promise((resolve) => {
            $.post(`/api/users/delete`,{
                username,
            },function(response){
                resolve(response)
            })
        })
    }
    async function loadUsers(username = ''){
        var html = ''
        const list = await listUsers()
        loadedUsers = {}
        $.each(list,function(n,item){
            loadedUsers[item.username] = item;
            html += createOptionHtml({
                value: item.username,
                label: item.username
            })
        })
        theDropdown.find('optgroup').html(html)
        theDropdown.val(username)
    }
    async function loadUserToForm(username){
        let userAccount;
        if(!username){
            deleteButton.hide();
            clearUserForm()
        }else{
            await loadPermissions()
            userAccount = loadedUsers[username]
            $.each(userAccount,function(key, value){
                theForm.find(`[name="${key}"]`).val(value)
            })
            deleteButton.show();
        }
    }
    function clearUserForm(permission){
        theDropdown.val('')
        theForm.find(`[name="username"]`).val('')
        theForm.find(`[name="password"]`).val('')
        theForm.find(`[name="permissionSet"]`).val('')
        loadPermissions()
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
        permissionsDropdown.find('optgroup').html(html)
    }
    theForm.submit(function(e){
        e.preventDefault()
        var formValues = createNewUser(formValues)
        loadUsers(formValues.username)
        return false;
    })
    deleteButton.click(function(e){
        var username = theDropdown.val()
        if(loadedPermissions[name]){
            $.confirm.create({
                title: lang["Delete User"],
                body: `${lang.DeleteThisMsg}`,
                clickOptions: {
                    title: '<i class="fa fa-trash-o"></i> ' + lang.Delete,
                    class: 'btn-danger btn-sm'
                },
                clickCallback: async function(){
                    const response = deleteUser(username)
                    if(response.ok){
                        loadUsers()
                        theDropdown.val("")
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
        loadUserToForm(name)
    })
    addOnTabOpen('userAccounts', function () {
        loadUsers()
        loadPermissions()
    })
    addOnTabReopen('userAccounts', function () {
        var theSelected = theDropdown.val()
        loadUsers()
        theDropdown.val(theSelected)
    })
})
