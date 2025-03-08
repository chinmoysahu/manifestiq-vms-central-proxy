module.exports = (config,lang) => {
    return {
        "section": "Videos Table",
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
                        "id": "videosTable_tag_search",
                        "field": lang["Search Object Tags"],
                        "example": "person",
                    },
                    {
                        "class": "date_selector",
                        "field": lang.Date,
                    },
                    {
                        id: 'videosTable_cloudVideos',
                        field: lang['Video Set'],
                        default: 'local',
                        "fieldType": "select",
                        possible: [{
                                "name": lang.Local,
                                "value": "local"
                            },
                            {
                                "name": lang.Archive,
                                "value": "archive"
                            },
                            {
                                "name": lang.Cloud,
                                "value": "cloud"
                            },
                        ]
                    },
                    {
                        "fieldType": "btn-group",
                        "btns": [{
                            "fieldType": "btn",
                            "class": `btn-success fill refresh-data mb-3`,
                            "icon": `refresh`,
                            "btnContent": `${lang['Refresh']}`,
                        }, ],
                    },
                    {
                        "fieldType": "div",
                        "id": "videosTable_preview_area",
                        "divContent": ""
                    },
                ]
            },
            "theTable": {
                noHeader: true,
                "section-pre-class": "col-md-8",
                "info": [{
                    "fieldType": "table",
                    "attribute": `data-classes="table table-striped"`,
                    "id": "videosTable_draw_area",
                    "divContent": ""
                }]
            },
        }
    }
}
