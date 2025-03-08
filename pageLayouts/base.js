const { config } = require('../libs/config.js')
const lang = require('../libs/language.js')(config)
module.exports = {
    "Side Menu Dashboard Pages": require('./sideMenuDashboardPages.js')(config,lang),
    "Side Menu Super Pages": require('./sideMenuSuperPages.js')(config,lang),
    "Permission Sets": require('./permissionSets.js')(config,lang),
    "User Permissions": require('./userPermissions.js')(config,lang),
    "API Keys For User Permissions": require('./apiKeyFieldsForUserPermissions.js')(config,lang),
    "User Accounts": require('./userAccounts.js')(config,lang),
    "FileBin": require('./fileBin.js')(config,lang),
    "API Keys": require('./apiKeys.js')(config,lang),
    "Timeline": require('./timeline.js')(config,lang),
    "Timelapse": require('./timelapseViewer.js')(config,lang),
    "Logs": require('./logs.js')(config,lang),
    "Monitor Map": require('./monitorMap.js')(config,lang),
    "Region Editor": require('./regionEditor.js')(config,lang),
    "Account Settings": require('./accountSettings.js')(config,lang),
    "Monitor Settings": require('./monitorSettings.js')(config,lang),
    "Monitor Status Codes": require('./monitorStatusCodes.js')(config,lang),
    "Monitor Stream Window": require('./monitorStreamWindow.js')(config,lang),
    "Monitor Settings Additional Input Map": require('./monitorSettingsAdditionalInputMap.js')(config,lang),
    "Monitor Settings Additional Stream Channel": require('./monitorSettingsAdditionalStreamChannel.js')(config,lang),
    "Videos Table": require('./videosTable.js')(config,lang),
    "ONVIF Scanner": require('./onvifScanner.js')(config,lang),
    "ONVIF Device Manager": require('./onvifDeviceManager.js')(config,lang),
    "Event Filters": require('./eventFilters.js')(config,lang),
    "Schedules": require('./schedules.js')(config,lang),
    "Monitor States": require('./monitorStates.js')(config,lang),
    "Sub-Account Manager": require('./subAccountManager.js')(config,lang),
}
