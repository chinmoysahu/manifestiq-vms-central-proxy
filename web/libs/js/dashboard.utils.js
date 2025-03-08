var userAgent = navigator.userAgent;
var isAppleDevice = userAgent.match(/(iPod|iPhone|iPad)/)||(navigator.userAgent.match(/(Safari)/)&&!navigator.userAgent.match('Chrome'));
var isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))
var isChromiumBased = userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR') || userAgent.includes('Brave');

function correctIPv6Url(url) {
    const ipv6Pattern = /^(http:\/\/|https:\/\/|ws:\/\/|wss:\/\/)(?!\[)([0-9a-fA-F:]+)(:\d+)/;
    if (ipv6Pattern.test(url)) {
        return url.replace(ipv6Pattern, (match, protocol, address, port) => {
            return `${protocol}[${address}]${port}`;
        });
    }
    return url;
}
function jsonToBlock(theJson, style){
    var html = ''
    if(theJson instanceof Object){
        html += `<ul style="${style ? style : ''}">`
        $.each(theJson,function(key,value){
            html += `<li><b>${key}</b> : ${jsonToBlock(value)}</li>`;
        })
        html += '</ul>'
    }else{
        html += `<span>${theJson}</span>`
    }
    return html
}
function dashboardOptions(r,rr,rrr){
    if(!rrr){rrr={};};if(typeof rrr === 'string'){rrr={n:rrr}};if(!rrr.n){rrr.n='ShinobiMgmtOptions_'+location.host}
    ii={o:localStorage.getItem(rrr.n)};try{ii.o=JSON.parse(ii.o)}catch(e){ii.o={}}
    if(!ii.o){ii.o={}}
    if(r&&rr&&!rrr.x){
        ii.o[r]=rr;
    }
    switch(rrr.x){
        case 0:
            delete(ii.o[r])
        break;
        case 1:
            delete(ii.o[r][rr])
        break;
    }
    localStorage.setItem(rrr.n,JSON.stringify(ii.o))
    return ii.o
}
function timeAgo(date) {
    const now = new Date();
    const secondsPast = (now.getTime() - (new Date(date)).getTime()) / 1000;
    if(secondsPast < 60) {
        return parseInt(secondsPast) + ' seconds ago';
    }
    if(secondsPast < 3600) {
        return parseInt(secondsPast / 60) + ' minutes ago';
    }
    if(secondsPast < 86400) {
        return parseInt(secondsPast / 3600) + ' hours ago';
    }
    return parseInt(secondsPast / 86400) + ' days ago';
}
function getDayOfWeek(date) {
  const days = [lang.Sunday, lang.Monday, lang.Tuesday, lang.Wednesday, lang.Thursday, lang.Friday, lang.Saturday];
  return days[date.getDay()];
}
function stringToColor(str) {
    let blueColors = [
        '#00BFFF', // Deep Sky Blue
        '#1E90FF', // Dodger Blue
        '#00F5FF', // Turquoise Blue
        '#00D7FF', // Electric Blue
        '#00C2FF', // Bright Cerulean
        '#00A9FF', // Vivid Sky Blue
        '#0099FF', // Blue Ribbon
        '#007FFF', // Azure Radiance
        '#0066FF', // Blue Dianne
        '#0055FF', // Electric Ultramarine
        '#0044FF', // Rich Electric Blue
        '#0033FF', // Medium Electric Blue
        '#0022FF', // Bright Blue
        '#0011FF', // Vivid Blue
        '#0000FF'  // Pure Blue
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return blueColors[Math.abs(hash) % blueColors.length];
}
function getTimeBetween(start, end, percent) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const difference = endDate - startDate;
    const time = new Date(startDate.getTime() + difference * percent / 100);
    return time;
}
function formattedTime(time,twelveHourClock,utcConvert){
    var theMoment = moment(time)
    if(utcConvert)theMoment = theMoment.clone().utc()
    return theMoment.format(twelveHourClock ? 'hh:mm:ss A YYYY-MM-DD' : 'HH:mm:ss YYYY-MM-DD')
}
function durationBetweenTimes(start,end){
    var duration = moment.duration(moment(end).diff(moment(start)));
    var hours = duration.asMinutes().toFixed(0);
    return hours
}
function formattedTimeForFilename(time,utcConvert,timeFormat){
    var theMoment = moment(time)
    if(utcConvert)theMoment = theMoment.clone().utc()
    return theMoment.format(timeFormat ? timeFormat : 'YYYY-MM-DDTHH:mm:ss')
}
function getDisplayDimensions(videoElement) {
  var actualVideoWidth = videoElement.videoWidth;
  var actualVideoHeight = videoElement.videoHeight;
  var elementWidth = videoElement.offsetWidth;
  var elementHeight = videoElement.offsetHeight;
  var actualVideoAspect = actualVideoWidth / actualVideoHeight;
  var elementAspect = elementWidth / elementHeight;
  var displayWidth, displayHeight;
  if (actualVideoAspect > elementAspect) {
    displayWidth = elementWidth;
    displayHeight = elementWidth / actualVideoAspect;
  } else {
    displayHeight = elementHeight;
    displayWidth = elementHeight * actualVideoAspect;
  }
  return {
    videoWidth: displayWidth,
    videoHeight: displayHeight,
  };
}
function featureIsActivated(showNotice){
    if(userHasSubscribed){
        return true
    }else{
        if(showNotice){
            new PNotify({
                title: lang.activationRequired,
                text: lang.featureRequiresActivationText,
                type: 'warning'
            })
        }
        return false
    }
}
function alphabetizeArray(theArray){
    return theArray.sort(function( a, b ) {
        const aName = (a.name || a).toLowerCase()
        const bName = (b.name || b).toLowerCase()
        if ( aName < bName ){
            return -1;
        }
        if ( aName > bName ){
            return 1;
        }
        return 0;
    });
}
function createOptionHtml(options){
    return `<option ${options.selected ? 'selected' : ''} value="${options.value}">${options.label || options.name}</option>`
}
function loadDateRangePicker(dateSelector,options){
    dateSelector.daterangepicker(Object.assign({
        startDate: moment().subtract(moment.duration("24:00:00")),
        endDate: moment().add(moment.duration("24:00:00")),
        timePicker: true,
        locale: {
            format: 'YYYY/MM/DD hh:mm:ss A'
        }
    },options || {},{ onChange: undefined }), options.onChange)
}
function setPromiseTimeout(timeoutAmount){
    return new Promise((resolve) => {
        setTimeout(resolve,timeoutAmount)
    })
}
function convertKbToHumanSize(theNumber){
    var amount = theNumber / 1048576
    var unit = amount / 1000 >= 1000 ? 'TB' : amount >= 1000 ? 'GB' : 'MB'
    var number = (amount / 1000 >= 1000 ? amount / 1000000  : amount >= 1000 ? amount / 1000 : amount).toFixed(2)
    return `${number} ${unit}`
}
function setPreviewedVideoHighlight(buttonEl,tableEl){
    tableEl.find('tr').removeClass('bg-gradient-blue')
    buttonEl.parents('tr').addClass('bg-gradient-blue')
}
function notifyIfActionFailed(data){
    if(data.ok === false){
        new PNotify({
            title: lang['Action Failed'],
            text: data.msg,
            type: 'danger'
        })
    }
}
function downloadFile(href,filename) {
    return new Promise((resolve, reject) => {
        fetch(href)
        .then(resp => resp.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const b = document.createElement('a');
            b.style.display = 'none';
            b.href = url;
            b.setAttribute("download", filename)
            b.download = filename;
            document.body.appendChild(b);
            b.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(b);
            resolve()
        })
        .catch(reject);
    })
}
function liveStamp(){
    var allLiveStampable = $('.livestamp')
    allLiveStampable.each(function(){
        var el = jQuery(this)
        var time = el.attr('title')
        if(!time){
            return
        };
        el.toggleClass('livestamp livestamped')
            .attr('title',formattedTime(time))
            .livestamp(time);
    })
    return allLiveStampable
}
function safeJsonParse(string){
    if(string instanceof Object){
        return string
    }else{

    }
    var newObject = {}
    try{
        newObject = JSON.parse(string)
    }catch(err){
        return string;
    }
    return newObject
}
function prettyPrint(string){
    return JSON.stringify(string,null,3)
}
function copyToClipboard(str){
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}
function stringContains(find,string,toLowerCase){
    var newString = string + ''
    if(toLowerCase)newString = newString.toLowerCase()
    return newString.indexOf(find) > -1
}
function getUrlProtocol(urlString){
    let modifiedUrlString = `${urlString}`.split('://')
    const originalProtocol = `${modifiedUrlString[0]}`
    return originalProtocol
}
function modifyUrlProtocol(urlString,newProtocol){
    let modifiedUrlString = `${urlString}`.split('://')
    const originalProtocol = `${modifiedUrlString[0]}`
    modifiedUrlString[0] = newProtocol;
    modifiedUrlString = modifiedUrlString.join('://')
    return modifiedUrlString
}
function getUrlParts(urlString){
    const originalProtocol = getUrlProtocol(urlString)
    const modifiedUrlString = modifyUrlProtocol(urlString,'http')
    const url = new URL(modifiedUrlString)
    const data = {}
    $.each(url,function(key,value){
        data[key] = value
    });
    data.href = `${urlString}`
    data.origin = modifyUrlProtocol(data.origin,originalProtocol)
    data.protocol = `${originalProtocol}:`
    delete(data.toString)
    delete(data.toJSON)
    return data
}
function addCredentialsToUrl(streamUrl,username,password){
    const urlParts = streamUrl.split('://')
    return [urlParts[0],'://',`${username}:${password}@`,urlParts[1]].join('')
}
function mergeConcattedJsonString(textData){
    return textData.replace(/[\r\n]/gm, '').replace('}{',',')
}
function buildOptions(field,possiblities){
    if(!field)console.error('field',field)
    var fieldElement = ''
    possiblities.forEach(function(option){
        if(option.optgroup){
            fieldElement += '<optgroup label="' + option.name + '">'
            fieldElement += buildOptions(field,option.optgroup)
            fieldElement += '</optgroup>'
        }else{
            var selected = ''
            if(option.value === field.default){
              selected = 'selected'
            }
            fieldElement += '<option value="' + option.value + '" ' + selected + '>' + option.name + '</option>'
        }
    })
    return fieldElement
}
function drawBlock(theBlock) {
    let html = '';

    // // Evaluate any conditional rendering
    // if (theBlock.evaluation && !eval(theBlock.evaluation)) {
    //     return '';
    // }

    let attributes = [];
    let styles = [];
    let sectionClass = [];
    let headerTitle = theBlock.headerTitle || lang[theBlock.name] || theBlock.name;

    if (theBlock.hidden === true) {
        styles.push('display:none');
    }
    if (theBlock.style) {
        styles.push(theBlock.style);
    }
    if (theBlock.isSection === true) {
        attributes.push('section');
    }
    if (theBlock.attribute) {
        attributes.push(theBlock.attribute);
    }
    if (!theBlock.noId && !theBlock.id && theBlock.name) {
        var userSettingsId = theBlock.name.replace(/[^a-zA-Z ]/g, '').replace(/ /g, '');
        theBlock.id = userSettingsId;
    }
    if (theBlock.id) {
        attributes.push(`id="${theBlock.id}"`);
    }
    if (theBlock.color) {
        sectionClass.push(theBlock.color);
    }
    if (theBlock['section-class']) {
        sectionClass.push(theBlock['section-class']);
    }

    if (theBlock.isAdvanced) {
        html += '<div class="h_us_input h_us_advanced" style="display:none">';
    }

    if (theBlock['section-pre-pre-class']) {
        html += `<div class="${theBlock['section-pre-pre-class']}">`;
    }
    if (theBlock['section-pre-class']) {
        html += `<div class="${theBlock['section-pre-class']}">`;
    }

    let elementTag = theBlock.isForm ? 'form' : 'div';

    html += `<${elementTag} ${attributes.join(' ')} style="${styles.join(';')}" class="${!theBlock.noDefaultSectionClasses ? 'card form-group-group p-3 mb-3 shadow' : ''} ${sectionClass.join(' ')}">`;

    if (!theBlock['noHeader']) {
        let noToggleHeader = theBlock.headerButtons || (theBlock.headerTitle && (theBlock.headerTitle.includes('<a ') || theBlock.headerTitle.includes('<button '))) ? 'no-toggle-header' : '';
        html += `<h4 class="form-section-header ${noToggleHeader} cursor-pointer mb-3 pb-3 border-bottom-dotted border-color-${theBlock.color || 'dark'} ${theBlock.headerClass || ''}">${headerTitle}`;

        if (theBlock.headerButtons) {
            html += '<div class="pull-right">';
            theBlock.headerButtons.forEach(function (button) {
                html += `<a class="btn btn-success btn-xs ${button.class || ''}">`;
                if (button.icon) {
                    html += `<i class="fa fa-${button.icon}"></i>`;
                }
                if (button.text) {
                    html += button.text;
                }
                html += '</a>';
            });
            html += '</div>';
        }
        html += '</h4>';
    }

    html += `<div class="box-wrapper ${theBlock['box-wrapper-class'] || ''}" style="${theBlock['box-wrapper-style'] || ''}">`;

    if (theBlock['input-mapping']) {
        html += `
        <div class="form-group-group btn-default card shadow mb-2" style="display:none" input-mapping="${theBlock['input-mapping']}">
            <h5 class="card-body d-flex flex-row m-0">
                <div class="flex-grow-1">
                    ${lang['Input Feeds Selected']}
                </div>
                <div>
                    <a class="btn btn-success btn-sm add_map_row"><i class="fa fa-plus-square-o"></i></a>
                </div>
            </h5>
            <div class="card-footer pb-0 choices"></div>
        </div>`;
    }

    if (theBlock.blockquote) {
        html += `<blockquote class="${theBlock.blockquoteClass || ''}">
            ${theBlock.blockquote}
        </blockquote>`;
    }

    if (theBlock.blocks) {
        theBlock.blocks.forEach(function (block) {
            html += drawBlock(block);
        });
    }

    if (theBlock.info) {
        function drawInfoItem(field) {
            let evaluation = `${field.evaluation || ''}`;

            if (field.ejs) {
                // Handle included EJS files if necessary
            } else if (field.isFormGroupGroup === true) {
                html += drawBlock(field);
            } else {
                if (field.notForSubAccount === true) {
                    var notForSubAccount = '!details.sub';
                    if (!field.evaluation) {
                        evaluation = notForSubAccount;
                    } else {
                        evaluation += ' && ' + notForSubAccount;
                    }
                }
                // if (evaluation && !eval(evaluation)) {
                //     return;
                // }

                var hidden = '';
                if (field.hidden === true) {
                    hidden = 'style="display:none"';
                }
                var fieldClass = [];
                var attributes = [];

                if (field.name && field.name.includes('=')) {
                    attributes.push(field.name);
                } else if (field.name) {
                    attributes.push(`name="${field.name}"`);
                }
                if (field.placeholder || field.default) {
                    attributes.push(`placeholder="${field.placeholder || field.default}"`);
                } else if (field.example) {
                    attributes.push(`placeholder="Example: ${field.example}"`);
                }
                if (field.default) {
                    attributes.push(`data-default="${field.default}"`);
                }
                if (field.attribute) {
                    attributes.push(field.attribute);
                }
                if (field.selector) {
                    attributes.push(`selector="${field.selector}"`);
                }
                if (field.styles || field.style) {
                    attributes.push(`style="${field.styles || field.style}"`);
                }
                if (field.id) {
                    attributes.push(`id="${field.id}"`);
                }
                if (field.class) {
                    fieldClass.push(field.class);
                }
                var possibilities = field.possible || [];
                var fieldType = field.fieldType || 'text';
                var fieldElement = '';
                var preFill = field.preFill || '';

                switch (fieldType) {
                    case 'btn-group':
                        let fieldBtnContent = '';
                        field.btns.forEach((btn) => {
                            let btnClass = [];
                            let btnAttributes = [];
                            const btnBaseElement = btn.forForm || field.forForm ? 'button' : 'a';
                            if (btn.class) {
                                btnClass.push(btn.class);
                            }
                            if (btn.attribute) {
                                btnAttributes.push(btn.attribute);
                            }
                            fieldBtnContent += `<${btnBaseElement} class="btn ${btnClass.join(' ')}" ${btnAttributes.join(' ')}>${btn.icon ? `<i class="fa fa-${btn.icon}"></i> ` : ''}${btn.btnContent}</${btnBaseElement}>`;
                        });
                        fieldElement = `<div class="btn-group ${field.normalWidth ? '' : 'btn-group-justified'} ${fieldClass.join(' ')}" ${attributes.join(' ')}>${fieldBtnContent}</div>`;
                        break;
                    case 'btn':
                        var baseElement = field.forForm ? 'button' : 'a';
                        fieldElement = `<${baseElement} class="btn btn-block ${fieldClass.join(' ')}" ${attributes.join(' ')}>${field.btnContent}</${baseElement}>`;
                        break;
                    case 'ul':
                        fieldElement = `<ul ${attributes.join(' ')} class="${fieldClass.join(' ')}"></ul>`;
                        break;
                    case 'div':
                        fieldElement = `<div ${attributes.join(' ')} class="${fieldClass.join(' ')}">${field.divContent || ''}`;
                        break;
                    case 'script':
                        fieldElement = `<script ${attributes.join(' ')} ${field.src ? `src="${window.libURL}/${field.src}"` : ''}>${field.scriptContent || ''}</script>`;
                        break;
                    case 'html':
                        fieldElement = `${field.html}`;
                        break;
                    case 'img':
                        fieldElement = `<img ${attributes.join(' ')} class="${fieldClass.join(' ')}" src="${window.libURL}/${field.src}">`;
                        break;
                    case 'iconCard':
                        fieldElement = `<div ${attributes.join(' ')} class="card mb-3 border-0 ${fieldClass.join(' ')}">
                            <div class="card-body">
                                <h6 class="card-title text-white">${field.label}</h6>
                                <div class="row">
                                    <h3 class="col-md-6 text-white">${field.text}</h3>
                                    <h3 class="col-md-6 text-right text-muted" style="opacity:0.8"><i class="fa fa-2x fa-${field.icon}"></i></h3>
                                </div>
                            </div>
                        </div>`;
                        break;
                    case 'indicatorBar':
                        const numberOfBars = field.bars || 1;
                        fieldElement = `<div ${attributes.join(' ')} id="indicator-${field.id || field.name}" class="mb-2 ${fieldClass.join(' ')}">
                            <div class="d-flex flex-row text-white mb-1">
                                <div class="pr-2">
                                    <i class="fa fa-${field.icon}"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <small>${field.label}</small>
                                </div>
                                <div>
                                    <small class="indicator-percent ${field.indicatorPercentClass || ''}"><i class="fa fa-spinner fa-pulse"></i></small>
                                </div>
                            </div>
                            <div>
                                <div class="progress">`;
                        for (let i = 0; i < numberOfBars; i++) {
                            fieldElement += `<div title="${field[`title${i}`] || ''}" class="progress-bar progress-bar-${field[`color${i}`] || field.color || 'warning'}" role="progressbar" style="width: ${field[`percent${i}`] || field.percent || '0'}%;"></div>`;
                        }
                        fieldElement += `</div>
                            </div>
                        </div>`;
                        break;
                    case 'form':
                        fieldElement = `<form ${attributes.join(' ')} class="${fieldClass.join(' ')}"></form>`;
                        break;
                    case 'table':
                        fieldElement = `<table ${hidden} ${attributes.join(' ')} class="${fieldClass.join(' ')}"><tbody></tbody></table>`;
                        break;
                    case'checkBoxTable':
                          function drawTableRow(item, startTr = true, endTr = true, padHeader = false){
                              var html = ''
                              if(item.optgroup){
                                  const numberOfItems = item.optgroup.length - 1;
                                  html += `<tr><td class="fs-4 ${padHeader ? 'pt-5' : ''}"><b>${item.name}</b></td><td></td><td></td><td></td></tr>`
                                  html += item.optgroup.map((innerItem, n) => {
                                      const firstInRow = n % 2 == 0;
                                      return drawTableRow(innerItem,firstInRow, !firstInRow || numberOfItems === n)
                                  }).join('')
                              }else{
                                  html += `${startTr ? '<tr>' : ''}<td class="text-start col-md-3 ${!startTr ? 'pl-3' : ''}">${item.label}</td><td class="text-end col-md-3 ${startTr ? `pr-3" style="border-right:1px solid` : ''}"><input ${item.name ? `${item.key ? item.key : 'name'}="${item.name}"` : ''} class="form-check-input no-abs" type="checkbox" value="1"></td>${endTr ? '</tr>' : ''}`
                              }
                              return html
                          }
                          fieldElement = `<table ${hidden} ${attributes.join(' ')} class="${fieldClass.join(' ')}"><tbody>
                              ${(field.possible || []).map((item, n) => drawTableRow(item, null, null, n !== 0)).join('')}
                          </tbody></table>`
                          break;
                    case 'number':
                        if (field.numberMin) {
                            attributes.push(`min="${field.numberMin}"`);
                        }
                        if (field.numberMax) {
                            attributes.push(`max="${field.numberMax}"`);
                        }
                        fieldElement = `<input type="number" class="form-control ${fieldClass.join(' ')}" ${attributes.join(' ')}>`;
                        break;
                    case 'password':
                        fieldElement = `<input type="password" class="form-control ${fieldClass.join(' ')}" ${attributes.join(' ')}>`;
                        break;
                    case 'text':
                        fieldElement = `<input class="form-control ${fieldClass.join(' ')}" ${attributes.join(' ')} value="${preFill}">`;
                        break;
                    case 'range':
                        fieldElement = `<input type="range" class="form-range ${fieldClass.join(' ')}" ${attributes.join(' ')} min="${field.min}" max="${field.max}">`;
                        break;
                    case 'textarea':
                        fieldElement = `<textarea class="form-control ${fieldClass.join(' ')}" ${attributes.join(' ')}></textarea>`;
                        break;
                    case 'select':
                        fieldElement = `<select class="form-control ${fieldClass.join(' ')}" ${attributes.join(' ')}>`;
                        fieldElement += buildOptions(field, possibilities);
                        fieldElement += '</select>';
                        break;
                }

                if (field['form-group-class-pre-pre-layer']) {
                    html += `<div class="${field['form-group-class-pre-pre-layer']}">`;
                }
                if (field['form-group-class-pre-layer']) {
                    html += `<div class="${field['form-group-class-pre-layer']}">`;
                }
                if (field['isAdvanced']) {
                    html += '<div class="h_us_input h_us_advanced" style="display:none">';
                }

                if (
                    ['ul', 'div', 'script', 'img', 'html', 'iconCard', 'indicatorBar', 'cardBlock', 'btn', 'btn-group', 'table', 'checkBoxTable', 'form'].includes(fieldType)
                ) {
                    html += fieldElement;
                    if (fieldType === 'div') {
                        if (field.info) {
                            field.info.forEach(drawInfoItem);
                        }
                        html += `</div>`;
                    }
                } else {
                    html += `<div ${hidden} ${field.uiVisibilityConditions ? `visibility-conditions="${field.uiVisibilityConditions}"` : ''} class="form-group ${field['form-group-class'] || ''}" ${field['form-group-attribute'] || ''}>`;
                    html += `<div><label>${field.field}</label></div>`;
                    html += `<div class="mb-2"><span>`;
                    if (field.description) {
                        html += `<small>${field.description}</small>`;
                    }
                    html += `</span></div>`;
                    html += `<div>${fieldElement}</div>`;
                    html += `</div>`;
                }

                if (field['isAdvanced']) {
                    html += '</div>';
                }
                if (field['form-group-class-pre-layer']) {
                    html += '</div>';
                }
                if (field['form-group-class-pre-pre-layer']) {
                    html += '</div>';
                }
            }
        }
        theBlock.info.forEach(drawInfoItem);
    }

    html += '</div>';
    html += `</${elementTag}>`;

    if (theBlock['section-pre-class']) {
        html += '</div>';
    }
    if (theBlock['section-pre-pre-class']) {
        html += '</div>';
    }
    if (theBlock.isAdvanced) {
        html += '</div>';
    }

    return html;
}
function setSubmitButton(editorForm,text,icon,toggle){
    var submitButtons = editorForm.find('[type="submit"]').prop('disabled',toggle)
    submitButtons.html(`<i class="fa fa-${icon}"></i> ${text}`)
}
function debugLog(...args){
    console.log(...args)
}
function getAllSectionsFromDefinition(definitionsBase){
    var sections = {}
    var addSection = function(section,parentName){
        sections[section.id + section.name] = {
            name: section.name,
            id: section.id,
            color: section.color,
            parentName: parentName
        }
        if(section.info){
            $.each(section.info,function(m,block){
                if(block.isFormGroupGroup === true){
                    addSection(block,section.name)
                }
            })
        }
        if(section.blocks){
            $.each(section.blocks,function(m,block){
                addSection(block,section.name)
            })
        }
    }
    $.each(definitionsBase.blocks,function(n,section){
        addSection(section)
    })
    return sections
}
var redAlertNotices = {};
function redAlertNotify({ title, text, type }) {
    try{
        var redAlertNotice = redAlertNotices[title];
        if (redAlertNotice) {
            redAlertNotice.update({
                title: title,
                text: text,
                type: type,
                hide: false,
                delay: 30000
            });
        } else {
            redAlertNotices[title] = new PNotify({
                title: title,
                text: text,
                type: type,
                hide: false,
                delay: 30000
            });
            redAlertNotices[title].on('close', function() {
                redAlertNotices[title] = null;
            });
        }
    }catch(err){
        console.log(err)
    }
}
function parseDiskUsePercent(diskUsed,diskLimit){
    return parseFloat((diskUsed/diskLimit)*100).toFixed(1)+'%'
}
jQuery.fn.scrollTo = function(elem, speed) {
    var $this = jQuery(this);
    var $this_top = $this.offset().top;
    var $this_bottom = $this_top + $this.height();
    var $elem = jQuery(elem);
    var $elem_top = $elem.offset().top;
    var $elem_bottom = $elem_top + $elem.height();

    if ($elem_top > $this_top && $elem_bottom < $this_bottom) {
        // in view so don't do anything
        return;
    }
    var new_scroll_top;
    if ($elem_top < $this_top) {
        new_scroll_top = {scrollTop: $this.scrollTop() - $this_top + $elem_top};
    } else {
        new_scroll_top = {scrollTop: $elem_bottom - $this_bottom + $this.scrollTop()};
    }
    $this.animate(new_scroll_top, speed === undefined ? 100 : speed);
    return this;
};
function getChangedObjectValues(obj1, obj2) {
    if (Object.keys(obj1).length === 0) {
        return obj2;
    }

    const changes = {};

    function compare(obj1, obj2, changes) {
        for (const key in obj1) {
            if (obj1.hasOwnProperty(key)) {
                if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
                    if (!arraysEqual(obj1[key], obj2[key])) {
                        changes[key] = obj2[key];
                    }
                } else if (typeof obj1[key] === 'object' && obj1[key] !== null) {
                    if (typeof obj2[key] === 'object' && obj2[key] !== null) {
                        const nestedChanges = {};
                        compare(obj1[key], obj2[key], nestedChanges);
                        if (Object.keys(nestedChanges).length > 0) {
                            changes[key] = nestedChanges;
                        }
                    } else {
                        changes[key] = obj2[key];
                    }
                } else if (obj1[key] !== obj2[key]) {
                    changes[key] = obj2[key];
                }
            }
        }
    }

    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    compare(obj1, obj2, changes);
    return changes;
}

function areObjectsTheSame(a, b) {
  if (a === b) return true
  if (a == null || b == null || typeof a !== typeof b) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    const aSorted = [...a].sort()
    const bSorted = [...b].sort()
    for (let i = 0; i < aSorted.length; i++) {
      if (!areObjectsTheSame(aSorted[i], bSorted[i])) return false
    }
    return true
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false
      if (!areObjectsTheSame(a[key], b[key])) return false
    }
    return true
  }
  return false
}
function fullScreenInit(target){
    if (target.requestFullscreen) {
      target.requestFullscreen();
    } else if (target.mozRequestFullScreen) {
      target.mozRequestFullScreen();
    } else if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
}
