module.exports = (config,lang) => {
    return [
      {
          label: lang['Mount Manager'],
          tabName: 'superMountManager',
          icon: 'hdd-o',
      },
      {
          label: lang['Controls and Logs'],
          tabName: 'superSystemControl',
          icon: 'bars',
      }
    ]
}
