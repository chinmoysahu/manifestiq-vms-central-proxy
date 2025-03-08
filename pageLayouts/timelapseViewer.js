module.exports = (config,lang) => {
    return {
        "section": "Timelapse",
        "blocks": {
            "Search Settings": {
               "name": lang["Search Settings"],
               "color": "green",
               "section-pre-class": "col-md-4",
               isFormGroupGroup: true,
               "noHeader": true,
               "noDefaultSectionClasses": true,
               "info": [
                   {
                      isFormGroupGroup: true,
                      "noHeader": true,
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
                              "id": "timelapsejpeg_date",
                              "field": lang.Date,
                          },
                          {
                              "id": "timelapseJpegFps",
                              "field": lang["Frame Rate"],
                              "fieldType": "range",
                              "min": "1",
                              "max": "30",
                          },
                          {
                             "fieldType": "btn-group",
                             "class": "mb-3",
                             "btns": [
                                 {
                                     "fieldType": "btn",
                                     "class": `btn-primary playPause playPauseText`,
                                     "btnContent": `<i class="fa fa-play"></i> ${lang['Play']}`,
                                 },
                                 {
                                     "fieldType": "btn",
                                     "class": `btn-secondary download_mp4`,
                                     "btnContent": `${lang['Download']}`,
                                 },
                             ],
                         },
                         {
                            "fieldType": "btn-group",
                            "btns": [
                                {
                                    "fieldType": "btn",
                                    "class": `btn-success fill refresh-data mb-3`,
                                    "icon": `refresh`,
                                    "btnContent": `${lang['Refresh']}`,
                                },
                            ],
                         },
                     ]
                   },
                   {
                      isFormGroupGroup: true,
                      "headerTitle": `
                        <a class="btn btn-danger btn-sm delete-selected-frames">${lang['Delete selected']}</a>
                        <a class="btn btn-primary btn-sm zip-selected-frames">${lang['Zip and Download']}</a>
                        <div class="pull-right">
                            <input type="checkbox" class="form-check-input select-all">
                        </div>`,
                      "info": [
                          {
                              "fieldType": "form",
                              "class": "frameIcons mt-3 mb-0 row scroll-style-6",
                          }
                     ]
                   }
              ]
          },
          "Watch": {
              noHeader: true,
             "color": "blue",
             style: 'padding:0!important',
             "section-pre-class": "col-md-8",
             "info": [
                 {
                     "fieldType": "div",
                     "class": "playBackView",
                     "divContent": "<img>"
                 }
             ]
         },
       }
     }
}
