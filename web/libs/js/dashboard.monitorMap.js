var loadedMap;
$(document).ready(function(){
    var loadedMonitors = {}
    var theBlock = $('#tab-monitorMap')
    var theMap = $('#monitor-map-canvas')
    function loadPopupVideoList(monitor){
        const groupKey = monitor.ke
        const monitorId = monitor.mid
        const peerConnectKey = monitor.peerConnectKey;
        const shinobiServer = loadedShinobiAPI[peerConnectKey]
        shinobiServer.getVideos({
            monitorId: monitorId,
            limit: 10,
        },function(data){
            var videos = data.videos
            var html = ''
            setTimeout(function(){
                var theVideoList = $(`#leaflet-monitor-videos`)
                if(videos.length > 0){
                    theVideoList.css('height','')
                    console.log(2,videos,videos.length)
                    $.each(videos,function(n,video){
                        html += createVideoRow(video,`col-12 mb-2`)
                    })
                }else{
                    theVideoList.css('height','initial')
                    html = `<div class="text-center text-light mb-2">${lang['No Videos Found']}</div>`
                }
                theVideoList.html(html)
            },1000)
        })
    }
    function buildPinPopupHtml(monitor){
        const peerConnectKey = monitor.peerConnectKey;
        const shinobiServer = loadedShinobiAPI[peerConnectKey]
        var embedUrl = shinobiServer.buildEmbedUrl(monitor)
        var html = `
        <div id="leaflet-monitor-block" class="bg-dark" data-peerconnectkey="${monitor.peerConnectKey}" data-mid="${monitor.mid}" data-ke="${monitor.ke}">
            <div><iframe src="${embedUrl}"></iframe></div>
            <div id="leaflet-monitor-videos">
                <div class="text-center text-light" style="padding-top: 75px"><i class="fa fa-3x fa-spinner fa-pulse"></i></div>
            </div>
        </div>
        `
        return html
    }
    function getPinsFromMonitors(){
        var points = []
        var n = 0;
        $.each(loadedMonitors,function(monitorId,monitor){
            var geolocation = monitor.details.geolocation
            var modeIsOn = monitor.mode === 'record' || monitor.mode === 'start'
            var point = {
                coords: [49.2578298 + n,-123.2634732 + n],
                direction: 90,
                fov: 60,
                range: 1,
                title: `${monitor.name} (${monitor.host})`,
                html: buildPinPopupHtml(monitor)
            };
            if(!modeIsOn){

            }else if(geolocation){
                var {
                    lat,
                    lng,
                    zoom,
                    direction,
                    fov,
                    range,
                } = getGeolocationParts(monitor.details.geolocation);
                point.direction = direction
                point.fov = fov
                point.range = range
                point.coords = [lat, lng]
                points.push(point)
            }else{
                n += 0.0001105;
                points.push(point)
            }
        })
        return points
    }
    function plotPinsToMap(pins){
        for (var i = 0; i < pins.length; i++) {
            var pin = pins[i];
            var lat = pin.coords[0];
            var lng = pin.coords[1];
            var html = pin.html;
            L.marker([lat, lng], { title: pin.title }).bindPopup(html).addTo(loadedMap);
            console.log(pin)
            drawMapMarkerFov(loadedMap,{
                lat,
                lng,
                direction: pin.direction,
                fov: pin.fov,
                range: pin.range,
            });
        }
    }
    function loadMap(){
        console.log('Load Map')
        var monitorMapInfo = dashboardOptions().monitorMap || {
            center: { lat:49.2578298, lng:-123.2634732 },
            zoom: 13
        };
        var center = monitorMapInfo.center
        var lat = center.lat
        var lng = center.lng
        var zoom = monitorMapInfo.zoom
        var monitorPins = getPinsFromMonitors()
        loadedMap = L.map('monitor-map-canvas').setView([lat, lng], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(loadedMap);
        loadedMap.on('moveend', function() {
            saveCurrentPosition()
        });
        loadedMap.on('popupopen', function(e) {
            var popup = $('#leaflet-monitor-block')
            var groupKey = popup.attr('data-ke')
            var monitorId = popup.attr('data-mid')
            var peerConnectKey = popup.attr('data-peerconnectkey')
            var monitor = loadedMonitors[monitorId + peerConnectKey]
            console.log(`loading `,monitorId,peerConnectKey,!!monitor)
            loadPopupVideoList(monitor)
        });
        plotPinsToMap(monitorPins)
    }
    function unloadMap(){
        loadedMap.remove();
        loadedMap = null;
    }
    function saveCurrentPosition(){
        var center = loadedMap.getCenter();
        var zoom = loadedMap.getZoom();
        dashboardOptions('monitorMap',{
            center,
            zoom,
        })
    }
    function loadMonitors(){
        loadedMonitors = getLoadedMonitors(false)
    }
    addOnTabOpen('monitorMap', function () {
        loadMonitors()
        loadMap()
    })
    addOnTabReopen('monitorMap', function () {
        loadMonitors()
        loadMap()
    })
    addOnTabAway('monitorMap', function () {
        unloadMap()
    })
})
