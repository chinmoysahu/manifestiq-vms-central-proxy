const fs = require('fs');
const express = require('express')
module.exports = async (s,config,lang,app,io) => {
    s.customAutoLoad = {
        pages: [],
        PageBlocks: [],
        LibsJs: [],
        LibsCss: [],
        AssetsJs: [],
        AssetsCss: [],
    }
    const runningInstallProcesses = {}
    const modulesBasePath = __dirname + '/customAutoLoad/'
    const extractNameFromPackage = (filePath) => {
        const filePathParts = filePath.split('/')
        const packageName = filePathParts[filePathParts.length - 1].split('.')[0]
        return packageName
    }
    const getModulePath = (name) => {
        return modulesBasePath + name + '/'
    }
    const getModule = (moduleName) => {
        const modulePath = modulesBasePath + moduleName
        const stats = fs.lstatSync(modulePath)
        const isDirectory = stats.isDirectory()
        const newModule = {
            name: moduleName,
            path: modulePath + '/',
            size: stats.size,
            lastModified: stats.mtime,
            created: stats.ctime,
            isDirectory: isDirectory,
        }
        if(isDirectory){
            var hasInstaller = false
            if(!fs.existsSync(modulePath + '/index.js')){
                hasInstaller = true
                newModule.noIndex = true
            }
            if(fs.existsSync(modulePath + '/package.json')){
                hasInstaller = true
                newModule.properties = getModuleProperties(moduleName)
            }else{
                newModule.properties = {
                    name: moduleName
                }
            }
            newModule.hasInstaller = hasInstaller
        }else{
            newModule.isIgnitor = (moduleName.indexOf('.js') > -1)
            newModule.properties = {
                name: moduleName
            }
        }
        return newModule
    }
    const getModules = (asArray) => {
        const foundModules = {}
        fs.readdirSync(modulesBasePath).forEach((moduleName) => {
            foundModules[moduleName] = getModule(moduleName)
        })
        return asArray ? Object.values(foundModules) : foundModules
    }
    const getModuleProperties = (name) => {
        const modulePath = getModulePath(name)
        const propertiesPath = modulePath + 'package.json'
        const properties = fs.existsSync(propertiesPath) ? s.parseJSON(fs.readFileSync(propertiesPath)) : {
            name: name
        }
        return properties
    }
    const loadModule = (shinobiModule) => {
        const moduleName = shinobiModule.name
        console.log(`Loading Module : ${moduleName}`)
        var customModulePath = modulesBasePath + '/' + moduleName
        if(shinobiModule.isIgnitor){
            try{
                require(customModulePath)(s,config,lang,app,io)
            }catch(err){
                console.log('Failed to Load Module : ' + moduleName)
                console.log(err)
            }
        }else if(shinobiModule.isDirectory){
            try{
                require(customModulePath)(s,config,lang,app,io)
                fs.readdir(customModulePath,function(err,folderContents){
                    folderContents.forEach(function(name){
                        switch(name){
                            case'web':
                                var webFolder = s.checkCorrectPathEnding(customModulePath) + 'web/'
                                fs.readdir(webFolder,function(err,webFolderContents){
                                    webFolderContents.forEach(function(name){
                                        switch(name){
                                            case'assets':
                                            case'libs':
                                            case'pages':
                                                if(name === 'libs'){
                                                    app.use('/libs',express.static(webFolder + '/libs'))
                                                }else if(name === 'assets'){
                                                    app.use('/assets',express.static(webFolder + '/assets'))
                                                }
                                                var libFolder = webFolder + name + '/'
                                                fs.readdir(libFolder,function(err,webFolderContents){
                                                    webFolderContents.forEach(function(libName){
                                                        var thirdLevelName = libFolder + libName
                                                        switch(libName){
                                                            case'js':
                                                            case'css':
                                                            case'blocks':
                                                                fs.readdir(thirdLevelName,function(err,webFolderContents){
                                                                    webFolderContents.forEach(function(filename){
                                                                        if(!filename)return;
                                                                        var fullPath = thirdLevelName + '/' + filename
                                                                        if(name === 'libs'){
                                                                            switch(libName){
                                                                                case'js':
                                                                                    s.customAutoLoad['LibsJs'].push(filename)
                                                                                break;
                                                                                case'css':
                                                                                    s.customAutoLoad['LibsCss'].push(filename)
                                                                                break;
                                                                            }
                                                                        }else if(name === 'assets'){
                                                                            switch(libName){
                                                                                case'js':
                                                                                    s.customAutoLoad['AssetsJs'].push(filename)
                                                                                break;
                                                                                case'css':
                                                                                    s.customAutoLoad['AssetsCss'].push(filename)
                                                                                break;
                                                                            }
                                                                        }else if(name === 'pages' && libName === 'blocks'){
                                                                            s.customAutoLoad['PageBlocks'].push(fullPath)
                                                                        }
                                                                    })
                                                                })
                                                            break;
                                                            case'tabs':
                                                                if(libName.indexOf('.ejs') > -1){
                                                                    s.customAutoLoad.pages.push(thirdLevelName)
                                                                }
                                                            break;
                                                        }
                                                    })
                                                })
                                            break;
                                        }
                                    })
                                })
                            break;
                        }
                    })
                })
            }catch(err){
                console.log('Failed to Load Module : ' + moduleName)
                console.log(err)
            }
        }
    }
    const initializeAllModules = async () => {
        fs.readdir(modulesBasePath,function(err,folderContents){
            if(!err && folderContents.length > 0){
                getModules(true).forEach((shinobiModule) => {
                    if(shinobiModule.properties.disabled){
                        return;
                    }
                    loadModule(shinobiModule)
                    s.reloadLanguages()
                    s.reloadDefinitions()
                })
            }else{
                fs.mkdir(modulesBasePath,() => {})
            }
        })
    }
    // Initialize Modules on Start
    await initializeAllModules();
}
