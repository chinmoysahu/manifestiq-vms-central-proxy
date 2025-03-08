module.exports = (config,lang) => {
    return {
        "section": "User Accounts",
        "blocks": {
            "Info": {
                "name": lang["User Accounts"],
               "color": "blue",
               "blockquoteClass": "global_tip",
               "blockquote": lang.userAccountsPageText,
               "info": [
                   {
                      "fieldType": "btn",
                      "attribute": `page-open="userPermissions"`,
                      "class": `btn-primary`,
                      "btnContent": `<i class="fa fa-clock-o"></i> &nbsp; ${lang["User Permissions"]}`,
                   },
               ]
            },
            "Permissions": {
                noHeader: true,
               "color": "green",
               "info": [
                   {
                      "id": "userAccountSelector",
                      "field": lang["Accounts"],
                      "fieldType": "select",
                      "possible": [
                          {
                             "name": lang['Add New'],
                             "value": ""
                          },
                          {
                             "name": lang['Accounts'],
                             "optgroup": []
                          },
                      ]
                  },
               ]
           },
           "Preset": {
              "name": lang["Account"],
              "color": "green",
              "info": [
                 {
                     "fieldType": "btn",
                     "attribute": `type="button" style="display:none"`,
                     "class": `btn-danger delete`,
                     "btnContent": `<i class="fa fa-trash"></i> &nbsp; ${lang.Delete}`,
                 },
                 {
                     "name": "username",
                     "field": lang.Name,
                     "example": lang.Name,
                 },
                 {
                     "name": "password",
                     "field": lang.Password,
                     "example": lang.Password,
                     "fieldType": "password",
                 },
                 {
                    "name": "permissionSet",
                    "field": lang['Permissions'],
                    "fieldType": "select",
                    "possible": [
                        {
                           "name": lang.Default,
                           "value": "",
                           "info": lang.Default
                        },
                        {
                            "name": lang['Saved Permissions'],
                            "optgroup": []
                        }
                    ]
                 },
             ]
          }
        }
    }
}
