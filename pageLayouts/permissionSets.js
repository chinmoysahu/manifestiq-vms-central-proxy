module.exports = (config,lang) => {
    const yesNoPossibility = [
        { "name": lang.No, "value": "0" },
        { "name": lang.Yes, "value": "1" }
    ];
    return {
        "section": "User Permissions",
        "blocks": {
            "Permissions": {
                noHeader: true,
               "color": "green",
               "info": [
                   {
                       "field": lang["Server"],
                       "fieldType": "select",
                       "class": "peerConnectKeys_list",
                       "possible": []
                   },
                   {
                      "id": "permissionSetsSelector",
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
                    "name": "detail=allmonitors",
                    "field": lang['All Monitors and Privileges'],
                    "default": "0",
                    "fieldType": "select",
                    "selector": "h_perm_allmonitors",
                    "possible": yesNoPossibility
                 },
                 {
                    "name": "detail=monitor_create",
                    "field": lang['Can Create and Delete Monitors'],
                    "default": "0",
                    "fieldType": "select",
                    "possible": yesNoPossibility
                 },
                 {
                    "name": "detail=user_change",
                    "field": lang['Can Change User Settings'],
                    "default": "0",
                    "fieldType": "select",
                    "possible": yesNoPossibility
                 },
                 {
                    "name": "detail=view_logs",
                    "field": lang['Can View Logs'],
                    "default": "0",
                    "fieldType": "select",
                    "possible": yesNoPossibility
                 },
                 {
                    "name": "detail=edit_permissions",
                    "field": lang['Can Edit Permissions'],
                    "default": "0",
                    "fieldType": "select",
                    "possible": yesNoPossibility
                 }
             ]
          },
           "Monitors": {
              noHeader: true,
              "section-class": "search-parent",
              "color": "green",
              "info": [
                 {
                     "field": lang.Monitors,
                     "placeholder": lang.Search,
                     "class": "search-controller",
                 },
                 {
                     "fieldType": "table",
                     "class": "search-body",
                     id: "permissionSets_monitors",
                 },
             ]
          },
        }
    }
}
