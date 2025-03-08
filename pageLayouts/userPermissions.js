module.exports = (config,lang) => {
    return {
        "section": "User Permissions",
        "blocks": {
            "Info": {
                "name": lang["User Permissions"],
               "color": "blue",
               "blockquoteClass": "global_tip",
               "blockquote": lang.userPermissionsPageText,
               "info": [
                   {
                      "fieldType": "btn",
                      "attribute": `page-open="userAccounts"`,
                      "class": `btn-primary`,
                      "btnContent": `<i class="fa fa-clock-o"></i> &nbsp; ${lang["User Accounts"]}`,
                   },
               ]
            },
            "Permissions": {
                noHeader: true,
               "color": "green",
               "info": [
                   {
                      "id": "userPermissionsSelector",
                      "field": lang["Permissions"],
                      "fieldType": "select",
                      "possible": [
                          {
                             "name": lang['Add New'],
                             "value": ""
                          },
                          {
                             "name": lang['Saved Permissions'],
                             "optgroup": []
                          },
                      ]
                  },
               ]
           },
           "Preset": {
              "name": lang["Permission"],
              "color": "green",
              "info": [
                 {
                     "fieldType": "btn",
                     "attribute": `type="button" style="display:none"`,
                     "class": `btn-danger delete`,
                     "btnContent": `<i class="fa fa-trash"></i> &nbsp; ${lang.Delete}`,
                 },
                 {
                     "name": "name",
                     "field": lang.Name,
                     "example": lang.Operator,
                 },
                 {
                     "name": "all",
                     "field": lang['All Permissions'],
                     "fieldType": "select",
                     "selector": "userPermissions_allPermissions",
                     "possible": [
                         {
                            "name": lang.Yes,
                            "value": "1",
                            selected: true,
                         },
                         {
                            "name": lang.No,
                            "value": "0"
                         }
                     ]
                 },
                 {
                    "name": "pages",
                    "field": lang['Available Pages'],
                    "fieldType": "checkBoxTable",
                    styles: `display:none;`,
                    "class": "userPermissions_allPermissions_input userPermissions_allPermissions_0",
                    "possible": [
                        {
                           "name": lang.Dashboard,
                           "optgroup": require('./sideMenuDashboardPages.js')(config,lang).filter(item => !!item.tabName).map(item => {return { label: item.label, name: item.tabName, key: 'page-allowed' }})
                        },
                        {
                           "name": lang.superAdminTitle,
                           "optgroup": require('./sideMenuSuperPages.js')(config,lang).filter(item => !!item.tabName).map(item => {return { label: item.label, name: item.tabName, key: 'page-allowed' }})
                        }
                    ]
                 }
              ]
          }
       }
    }
}
