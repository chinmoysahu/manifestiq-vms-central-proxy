module.exports = (config,lang) => {
    return {
         "section": "Monitor Map",
         "blocks": {
             "Search Settings": {
                "name": lang["Monitor Map"],
                "color": "blue",
                "noHeader": true,
                "noDefaultSectionClasses": true,
                "info": [
                    {
                        "fieldType": "div",
                        "id": "monitor-map-canvas",
                    }
               ]
           },
        }
      }
}
