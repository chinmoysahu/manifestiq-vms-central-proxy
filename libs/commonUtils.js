const async = require("async");
const fetch = require("node-fetch");
const mergeDeep = function(...objects) {
  const isObject = obj => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      }
      else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      }
      else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}
const getBuffer = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const buffer = await response.buffer();
        return buffer;
    } catch (error) {
        console.error(`Error fetching buffer from URL ${url}:`, error);
        throw error;
    }
};
const crypto = require('crypto')
function addCredentialsToUrl(options){
    const streamUrl = options.url
    const username = options.username
    const password = options.password
    const urlParts = streamUrl.split('://')
    return [urlParts[0],'://',`${username}:${password}@`,urlParts[1]].join('')
}
function generateId(x){
    if(!x){x=10};var t = "";var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < x; i++ )
        t += p.charAt(Math.floor(Math.random() * p.length));
    return t;
}
async function fetchGet(url, params) {
    const urlObj = new URL(url);
    urlObj.search = new URLSearchParams(params);

    const response = await fetch(urlObj, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

async function fetchPost(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    return response.json();
}

function generateMD5(theString) {
    let hash = crypto.createHash('md5').update(theString).digest("hex")
    return hash;
}

module.exports = {
    fetchGet,
    fetchPost,
    generateId,
    generateMD5,
    addCredentialsToUrl,
    getBuffer: getBuffer,
    mergeDeep: mergeDeep,
    validateIntValue: (value) => {
        const newValue = !isNaN(parseInt(value)) ? parseInt(value) : null
        return newValue
    },
    arrayContains: (query,theArray) => {
        var foundQuery = false
        theArray.forEach((value) => {
            if(value.indexOf(query) > -1)foundQuery = true
        })
        return foundQuery
    },
    createQueue: (timeoutInSeconds, queueItemsRunningInParallel) => {
        return async.queue(function(action, callback) {
            setTimeout(function(){
                action(callback)
            },timeoutInSeconds * 1000 || 1000)
        },queueItemsRunningInParallel || 3)
    },
    createQueueAwaited: (timeoutInSeconds, queueItemsRunningInParallel) => {
        return async.queue(function(action, callback) {
            setTimeout(function(){
                action().then(callback)
            },timeoutInSeconds * 1000 || 1000)
        },queueItemsRunningInParallel || 3)
    },
    copyObject: (obj) => {
        return Object.assign({},obj)
    },
    stringContains: (find,string,toLowerCase) => {
        var newString = string + ''
        if(toLowerCase)newString = newString.toLowerCase()
        return newString.indexOf(find) > -1
    },
    stringToSqlTime: (value) => {
        newValue = new Date(value.replace('T',' '))
        return newValue
    },
    queryStringToObject: (string) => {
        const newObject = {}
        string.split('&').forEach((piece) => {
            const parts = piece.split('=')
            const key = parts[0]
            const value = parts[1]
            newObject[key] = value
        })
        return newObject
    },
    createQueryStringFromObject: (theObject) => {
       const string = []
       const keys = Object.keys(theObject)
       keys.forEach((key) => {
          const value = theObject[key]
          if(value)string.push(`${key}=${value}`)
       })
       return string.join('&')
    }

}
