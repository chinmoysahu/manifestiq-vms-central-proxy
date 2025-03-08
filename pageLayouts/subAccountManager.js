module.exports = (config,lang) => {
    return {
        "section": "Sub-Account Manager",
        "blocks": {
            "Sub-Accounts": {
               "name": lang['Sub-Accounts'],
               "color": "orange",
               "isSection": true,
               "id":"monSectionAccountList",
               "info": [
                   {
                       "field": lang["Server"],
                       "fieldType": "select",
                       "class": "peerConnectKeys_list",
                       "possible": []
                   },
                   {
                       "fieldType": "div",
                       id: "subAccountsList",
                   }
               ]
            },
            // "Currently Active": {
            //    "name": lang['Currently Active'],
            //    "section-pre-class": "col-md-6 search-parent",
            //    "color": "green",
            //    "isSection": true,
            //    "info": [
            //        {
            //           "field": lang['Search'],
            //           "class": 'search-controller',
            //        },
            //        {
            //            "fieldType": "div",
            //            "class": "search-body",
            //            "id": "currently-active-users",
            //            "attribute": `style="max-height: 400px;overflow: auto;"`,
            //        }
            //    ]
            // },
            "Account Information": {
               "name": lang['Account Information'],
               "color": "blue",
               "isSection": true,
               "isForm": true,
               "id":"monSectionAccountInformation",
               "info": [
                   {
                       hidden: true,
                      "name": "uid",
                      "field": "UID",
                      "fieldType": "text"
                   },
                   {
                      "name": "mail",
                      "field": lang.Email,
                      "fieldType": "text",
                      "default": "",
                      "possible": ""
                   },
                   {
                      "name": "pass",
                      "field": lang.Password,
                      "fieldType": "password",
                      "default": "",
                      "possible": ""
                   },
                   {
                      "name": "password_again",
                      "field": lang['Password Again'],
                      "fieldType": "password",
                      "default": "",
                      "possible": ""
                   },
                   {
                       forForm: true,
                      "fieldType": "btn",
                      "attribute": `type="reset"`,
                      "class": `btn-default reset-form`,
                      "btnContent": `<i class="fa fa-undo"></i> &nbsp; ${lang['Clear']}`,
                   },
                   {
                      "fieldType": "btn",
                      "class": `btn-success submit-form`,
                      "btnContent": `<i class="fa fa-plus"></i> &nbsp; ${lang['Add New']}`,
                   },
                   {
                       hidden: true,
                      "name": "details",
                      "preFill": "{}",
                   },
               ]
           },
           "Account Privileges": {
              "name": lang['Account Privileges'],
              "color": "red",
              "isSection": true,
              "id":"monSectionAccountPrivileges",
              "info": [
                  {
                     "name": "detail=permissionSet",
                     "field": lang['Permission Group'],
                     "default": "",
                     "description": lang.fieldTextPermissionGroup,
                     "fieldType": "select",
                     "selector": "h_perm_permissionSet",
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
                  {
                     "name": "detail=allmonitors",
                     "field": lang['All Monitors and Privileges'],
                     "default": "0",
                     "fieldType": "select",
                     "selector": "h_perm_allmonitors",
                     "possible": [
                         {
                            "name": lang.No,
                            "value": "0"
                         },
                         {
                            "name": lang.Yes,
                            "value": "1"
                         }
                     ]
                  },
                  {
                     "name": "detail=monitor_create",
                     "field": lang['Can Create and Delete Monitors'],
                     "default": "0",
                     "fieldType": "select",
                     "possible": [
                         {
                            "name": lang.No,
                            "value": "0"
                         },
                         {
                            "name": lang.Yes,
                            "value": "1"
                         }
                     ]
                  },
                  {
                     "name": "detail=user_change",
                     "field": lang['Can Change User Settings'],
                     "default": "0",
                     "fieldType": "select",
                     "possible": [
                         {
                            "name": lang.No,
                            "value": "0"
                         },
                         {
                            "name": lang.Yes,
                            "value": "1"
                         }
                     ]
                  },
                  {
                     "name": "detail=view_logs",
                     "field": lang['Can View Logs'],
                     "default": "0",
                     "fieldType": "select",
                     "possible": [
                         {
                            "name": lang.No,
                            "value": "0"
                         },
                         {
                            "name": lang.Yes,
                            "value": "1"
                         }
                     ]
                  },
                  {
                     "name": "detail=landing_page",
                     "field": lang['Landing Page'],
                     "default": "",
                     "fieldType": "select",
                     "possible": [
                         {
                            "name": lang.Default,
                            "value": ""
                         },
                         {
                            "name": lang.Timelapse,
                            "value": "timelapse"
                         }
                     ]
                  },
              ]
           },
           "Monitors": {
              noHeader: true,
              "section-class": "search-parent h_perm_allmonitors_input h_perm_allmonitors_1",
              "color": "green",
              "info": [
                 {
                     "field": lang.Monitors,
                     "placeholder": lang.Search,
                     "class": "search-controller",
                 },
                 {
                     "fieldType": "btn",
                     "class": `btn-success submit-form`,
                     "btnContent": `<i class="fa fa-plus"></i> &nbsp; ${lang['Add New']}`,
                 },
                 {
                     "fieldType": "table",
                     "class": "search-body",
                     id: "sub_accounts_permissions",
                 },
             ]
          },
       }
   }
}
