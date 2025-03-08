module.exports = (config,lang) => {
    return {
        "section": "Monitor States",
        "blocks": {
            "Info": {
                "name": lang["Monitor States and Schedules"],
               "color": "blue",
               "section-pre-class": "col-md-12",
               "blockquoteClass": "global_tip",
               "blockquote": lang.MonitorStatesText,
               "info": [
                   {
                      "fieldType": "btn",
                      "attribute": `page-open="schedules"`,
                      "class": `btn-primary`,
                      "btnContent": `<i class="fa fa-clock-o"></i> &nbsp; ${lang["Schedules"]}`,
                   },
               ]
            },
            "Monitor States": {
                noHeader: true,
               "color": "green",
               "section-pre-class": "col-md-6",
               "info": [
                   {
                       "field": lang["Server"],
                       "fieldType": "select",
                       "class": "peerConnectKeys_list",
                       "possible": []
                   },
                   {
                      "id": "monitorStatesSelector",
                      "field": lang["Monitor States"],
                      "fieldType": "select",
                      "possible": [
                          {
                             "name": lang['Add New'],
                             "value": ""
                          },
                          {
                             "name": lang['Saved Presets'],
                             "optgroup": []
                          },
                      ]
                  },
               ]
           },
           "Preset": {
              "name": lang["Preset"],
              "color": "green",
              "section-pre-class": "col-md-6",
              "info": [
                  {
                     "fieldType": "btn",
                     "attribute": `type="submit" style="display:none"`,
                     "class": `btn-danger delete`,
                     "btnContent": `<i class="fa fa-trash"></i> &nbsp; ${lang.Delete}`,
                  },
                  {
                     "name": "name",
                     "field": lang.Name,
                     "description": "",
                     "example": "Motion Off",
                     "possible": ""
                  }
              ]
          },
           "Monitors": {
              "name": lang["Monitors"],
              "color": "green",
              "section-pre-class": "col-md-12",
              "info": [
                  {
                     "fieldType": "btn",
                     "class": `btn-success add-monitor`,
                     "btnContent": `<i class="fa fa-plus"></i> &nbsp; ${lang['Add New']}`,
                  },
                 {
                     "fieldType": "div",
                     id: "monitorStatesMonitors",
                 }
              ]
          },
        }
    }
}
