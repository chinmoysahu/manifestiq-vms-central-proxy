module.exports = (config,lang) => {
    return {
        "section": "FileBin",
        "blocks": {
            "Search Settings": {
               "name": lang["Search Settings"],
               "color": "green",
               "section-pre-class": "col-md-4",
               "info": [
                   {
                       "field": lang["Server"],
                       "fieldType": "select",
                       "class": "peerConnectKeys_list",
                       "possible": []
                   },
                   {
                       "field": lang["Monitor"],
                       "fieldType": "select",
                       "class": "monitors_list",
                       "possible": []
                   },
                   {
                       "class": "date_selector",
                       "field": lang.Date,
                   },
                   {
                      "fieldType": "btn-group",
                      "btns": [
                          {
                              "fieldType": "btn",
                              "class": `btn-success fill refresh-data mb-3`,
                              "icon": `refresh`,
                              "btnContent": `${lang['Refresh']}`,
                          }
                      ],
                   },
                   {
                       "fieldType": "div",
                       "id": "fileBin_preview_area",
                       "divContent": ""
                   }
              ]
          },
          "FileBin": {
              noHeader: true,
             "section-pre-class": "col-md-8",
             "info": [
                 {
                     "fieldType": "table",
                     "attribute": `data-classes="table table-striped"`,
                     "id": "fileBin_draw_area",
                     "divContent": ""
                 }
             ]
         },
       }
    }
}
