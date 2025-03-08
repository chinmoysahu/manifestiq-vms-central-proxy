module.exports = (config,lang) => {
    return {
       "section": "Account Settings",
       "blocks": {
           "Page Control": {
             "noHeader": true,
             "color": "blue",
             "info": [
                 {
                     "field": lang['Server'],
                     "fieldType": "select",
                     "class": "peerConnectKeys_list",
                     "possible": []
                 }
              ]
          },
          "Profile": {
             "name": lang.Profile,
             "color": "grey",
             "info": [
                {
                   "name": "mail",
                   "field": lang.Email,
                   "description": lang["fieldTextMail"],
                   "default": "",
                   "example": "ccio@m03.ca",
                   "possible": ""
                },
                {
                   "name": "pass",
                   "field": lang.Password,
                   "fieldType": "password",
                   "description": lang["fieldTextPass"],
                   "fieldType": "password",
                   "default": "",
                   "example": "",
                   "possible": ""
                },
                {
                   "name": "password_again",
                   "field": lang["Password Again"],
                   "fieldType": "password",
                   "description": lang["fieldTextPasswordAgain"],
                   "default": "",
                   "example": "",
                   "possible": ""
                },
                {
                   "attribute": `size-adjust='[detail="size"]'`,
                   "field": lang["Max Storage Amount"],
                   "description": lang["fieldTextSize"],
                   "default": "10 GB",
                },
                {
                    hidden: true,
                   "name": "detail=size",
                   "field": lang["Max Storage Amount"],
                   "description": lang["fieldTextSize"],
                   "default": "10000",
                   "example": "600000",
                   "possible": "Up to 95% of your maximum storage space if only one master account exists.",
                   // "notForSubAccount": true,
                },
                {
                   "name": "detail=size_video_percent",
                   "field": lang["Video Share"],
                   "description": lang["fieldTextSizeVideoPercent"],
                   "default": "90",
                   // "notForSubAccount": true,
                },
                {
                   "name": "detail=size_timelapse_percent",
                   "field": lang["Timelapse Frames Share"],
                   "description": lang["fieldTextSizeTimelapsePercent"],
                   "default": "5",
                   // "notForSubAccount": true,
                },
                {
                   "name": "detail=size_filebin_percent",
                   "field": lang["FileBin Share"],
                   "description": lang["fieldTextSizeFilebinPercent"],
                   "default": "5",
                   // "notForSubAccount": true,
                },
                {
                    hidden:true,
                   "name": "detail=addStorage",
                   "default": "{}",
                   // "notForSubAccount": true,
                },
                {
                    "fieldType": 'div',
                    "id": "add_storage_max_amounts"
                },
                {
                   "name": "detail=days",
                   "field": lang["Number of Days to keep"] + ' ' + lang['Videos'],
                   "description": lang["fieldTextDays"],
                   "default": "5",
                   "example": "30",
                   "possible": "",
                   // "notForSubAccount": true,
                },
                {
                   "name": "detail=event_days",
                   "field": lang["Number of Days to keep"] + ' ' + lang['Events'],
                   "description": lang["fieldTextEventDays"],
                   "default": "10",
                   "example": "30",
                   "possible": "",
                   // "notForSubAccount": true,
                },
                {
                   "name": "detail=timelapseFrames_days",
                   "field": lang["Number of Days to keep"] + ' ' + lang['Timelapse'],
                   "description": lang["fieldTextEventDays"],
                   "default": "60",
                   // "notForSubAccount": true,
                },
                {
                   "name": "detail=log_days",
                   "field": lang["Number of Days to keep"] + ' ' + lang['Logs'],
                   "description": lang["fieldTextLogDays"],
                   "default": "10",
                   "example": "30",
                   "possible": "",
                   // "notForSubAccount": true,
               },
              {
                  "name": "detail=audio_delay",
                  "field": lang["Alert Sound Delay"],
                  "description": lang["fieldTextAudioDelay"],
                  "default": "1",
              },
              {
                  "name": "detail=event_mon_pop",
                  "field": lang["Popout Monitor on Event"],
                  "description": lang["fieldTextEventMonPop"],
                  "default": "en_CA",
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
               }
             ]
          },
          "Uploaders": {
              "name": lang['Uploaders'],
              id: 'UploadersContainer',
              noDefaultSectionClasses: true,
              noHeader: true
          },
          "Live Grid": {
             "name": lang['Live Grid'],
             "color": "navy",
             "info": [
                 {
                     "field": lang['Force Monitors Per Row'],
                     attribute:'localStorage="montage_use"',
                     selector:'st_force_mon_rows',
                     "description": "",
                     "default": "0",
                     "example": "",
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
                     "field": lang['Monitors per row'],
                     "form-group-class":"st_force_mon_rows_input st_force_mon_rows_1",
                     attribute:'localStorage="montage"',
                     "placeholder": "3",
                 },
                 {
                       "field": lang.hlsOptions,
                       "name": "localStorage=hlsOptions",
                       fieldType:"textarea",
                       "placeholder": "{}",
                 },
             ]
         }
       }
   }
}
