module.exports = (config,lang) => {
    return {
         "section": "Log Viewer",
         "blocks": {
             "Saved Logs": {
                "name": lang["Logs"],
                "color": "blue",
                "section-pre-class": "search-parent",
                "info": [
                    {
                        "color": "orange",
                        id: "monSectionDetectorMotion",
                        noHeader: true,
                        isSection: true,
                        isFormGroupGroup: true,
                        "section-class": "d-block",
                        "box-wrapper-class": "d-flex flex-row align-items-end",
                        "info": [
                            {
                                "form-group-class": "col",
                                "field": lang["Server"],
                                "fieldType": "select",
                                "class": "peerConnectKeys_list",
                                "possible": []
                            },
                            {
                               "id": "log_monitors",
                               "field": lang["Type"],
                               "fieldType": "select",
                               "form-group-class": "col",
                               "possible": [
                                   {
                                      "name": lang['All Logs'],
                                      "value": "all"
                                   },
                                   {
                                      "name": lang['For Group'],
                                      "value": "$USER"
                                   },
                                   {
                                      "name": lang['System'],
                                      "value": "system"
                                   },
                                   {
                                      "name": lang.Monitors,
                                      "optgroup": []
                                  }
                               ]
                            },
                            {
                               "field": lang['Search'],
                               "class": 'search-controller',
                               "form-group-class": "col",
                            },
                            {
                               "id": "logs_daterange",
                               "field": lang['Date Range'],
                               "form-group-class": "col",
                            },
                            {
                               "fieldType": "div",
                               "class": "col",
                               "info": [
                                   {
                                       "fieldType": "btn",
                                       "class": "btn-success submit",
                                       "forForm": true,
                                       "attribute": `type="button"`,
                                       "btnContent": `${lang['Check']}`,
                                   },
                               ],
                            },
                        ]
                    },
                    {
                        "id": "saved-logs-rows",
                        "fieldType": "table",
                        "class": "table table-striped search-body mt-3 px-3",
                    }
               ]
           },
          //  "Streamed Logs": {
          //     "name": lang['Streamed Logs'],
          //     "color": "green",
          //     "section-pre-class": "col-md-6 search-parent",
          //     "info": [
          //         {
          //            "field": lang['Search'],
          //            "class": 'search-controller',
          //         },
          //         {
          //             "fieldType": "div",
          //             "id": "global-log-stream",
          //             "attribute": `style="max-height: 600px;overflow: auto;"`,
          //             "class": "search-body mt-3",
          //         }
          //     ]
          // },
       }
    }
}
