module.exports = (config,lang) => {
    return {
         "section": "ONVIF Scanner",
         "blocks": {
             "Search Settings": {
                "name": lang["Scan Settings"],
                "color": "navy",
                "blockquote": lang.ONVIFnote,
                "section-pre-class": "col-md-4",
                "info": [
                    {
                        "field": lang['Server'],
                        "fieldType": "select",
                        "class": "peerConnectKeys_list",
                        "possible": []
                    },
                    {
                       "name": "ip",
                       "field": lang['IP Address'],
                       "description": lang["fieldTextIp"],
                       "example": "10.1.100.1-10.1.100.254",
                    },
                    {
                       "name": "port",
                       "field": lang['Port'],
                       "description": lang.separateByCommasOrRange,
                       "example": "80,7575,8000,8080,8081",
                    },
                    {
                       "name": "user",
                       "field": lang['Camera Username'],
                       "placeholder": "Can be left blank.",
                    },
                    {
                       "name": "pass",
                       "field": lang['Camera Password'],
                       "fieldType": "password",
                    },
                    {
                       "fieldType": "btn-group",
                       "btns": [
                           {
                               "fieldType": "btn",
                               "forForm": true,
                               "class": `btn-block btn-success`,
                               "btnContent": `${lang['Search']}<span class="_loading" style="display:none"> &nbsp; <i class="fa fa-pulse fa-spinner"></i></span>`,
                           },
                           {
                               "fieldType": "btn",
                               "class": `btn-default add-all`,
                               "btnContent": `${lang['Add All']}`,
                           },
                       ],
                    },
               ]
           },
           "Found Devices": {
              "name": lang['Found Devices'],
              "color": "blue",
              "section-pre-class": "col-md-8",
              "info": [
                  {
                      "fieldType": "div",
                      "class": "onvif_result row",
                  }
              ]
          },
          "Other Devices": {
             "name": lang['Other Devices'],
             "color": "danger",
             "section-pre-class": "col-md-12",
             "info": [
                 {
                     "fieldType": "div",
                     "class": "onvif_result_error row",
                 }
             ]
         },
        }
      }
}
