const { config } = require('./config.js')
const lang = require('./language.js')(config)
const pageLayouts = require(`../pageLayouts/base.js`)
module.exports = pageLayouts;
