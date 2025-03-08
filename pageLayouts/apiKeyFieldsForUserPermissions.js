module.exports = (config,lang) => {
    const {
        yesNoPossibility,
    } = require('./fieldValues.js')(config,lang);
    return {
        "section": "API Keys",
        "blocks": {
            "Add New": {
               "name": `<span class="title">${lang['Add New']}</span>`,
               "color": "forestgreen",
               "isSection": true,
               "section-class": "search-parent api-key-section",
               "id":"apiKeySectionAddNew",
               "info": [
                   {
                      "id": "apiKey_permissions",
                      "field": lang['Permissions'],
                      "class": "mb-3",
                      "fieldType": "checkBoxTable",
                      "possible": [
                          {
                              name: '',
                              optgroup: [
                                  {
                                      name: lang['Can Authenticate Websocket'],
                                      value: 'auth_socket',
                                  },
                                  {
                                      name: lang['Can Create API Keys'],
                                      value: 'create_api_keys',
                                  },
                                  {
                                      name: lang['Can Change User Settings'],
                                      value: 'edit_user',
                                  },
                                  {
                                      name: lang['Can Edit Permissions'],
                                      value: 'edit_permissions',
                                  },
                                  {
                                      name: lang['Can Get Monitors'],
                                      value: 'get_monitors',
                                  },
                                  {
                                      name: lang['Can Edit Monitors'],
                                      value: 'edit_monitors',
                                  },
                                  {
                                      name: lang['Can Control Monitors'],
                                      value: 'control_monitors',
                                  },
                                  {
                                      name: lang['Can Get Logs'],
                                      value: 'get_logs',
                                  },
                                  {
                                      name: lang['Can View Streams'],
                                      value: 'watch_stream',
                                  },
                                  {
                                      name: lang['Can View Snapshots'],
                                      value: 'watch_snapshot',
                                  },
                                  {
                                      name: lang['Can View Videos'],
                                      value: 'watch_videos',
                                  },
                                  {
                                      name: lang['Can Delete Videos'],
                                      value: 'delete_videos',
                                  },
                              ].map(item => {return { label: item.name, name: item.value, key: 'apiKey-permissions-allowed' }})
                          }
                      ]
                   },
                   {
                      "name": "detail=monitorsRestricted",
                      "field": lang['Restricted Monitors'],
                      "default": "1",
                      "fieldType": "select",
                      "selector": "h_apiKey_monitorsRestricted",
                      // "notForSubAccount": true,
                      "possible": yesNoPossibility,
                   },
                   {
                       "field": lang.Monitors,
                       "form-group-class": "h_apiKey_monitorsRestricted_input h_apiKey_monitorsRestricted_1",
                       "placeholder": lang.Search,
                       "class": "search-controller",
                   },
                   {
                       id: "apiKeys_monitors",
                       "fieldType": "table",
                       "class": "search-body monitors_table h_apiKey_monitorsRestricted_input h_apiKey_monitorsRestricted_1",
                   },
               ]
           },
      }
   }
}
