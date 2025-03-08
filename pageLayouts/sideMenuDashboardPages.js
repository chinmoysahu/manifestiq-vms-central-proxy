module.exports = (config,lang) => {
    return [
      {
          label: lang['Home'],
          tabName: 'home',
          icon: 'home',
          active: true,
      },
      {
          label: lang['Servers'],
          tabName: 'serverCredentials',
          icon: 'server',
      },
      {
          label: lang['User Permissions'],
          tabName: 'userPermissions',
          icon: 'gear',
      },
      {
          label: lang['User Accounts'],
          tabName: 'userAccounts',
          icon: 'users',
      },
      {
          divider: true,
      },
      {
          label: lang['Recent Videos'],
          tabName: 'recentVideos',
          icon: 'calendar',
      },
      {
          label: lang['Live Grid'],
          tabName: 'liveGrid',
          icon: 'th',
          addUl: true,
          ulItems: [
              // {
              //     label: lang['Open Wall Display'],
              //     class: 'open-wallview cursor-pointer',
              //     color: 'blue',
              // },
              {
                  label: lang['Open All Monitors'],
                  class: 'open-all-monitors cursor-pointer',
                  color: 'orange',
              },
              {
                  label: lang['Close All Monitors'],
                  class: 'close-all-monitors cursor-pointer',
                  color: 'red',
              },
              {
                  label: lang['Remember Positions'],
                  class: 'cursor-pointer',
                  attributes: 'shinobi-switch="monitorOrder" ui-change-target=".dot" on-class="dot-green" off-class="dot-grey"',
                  color: 'grey',
              },
              {
                  label: lang['Border Between'],
                  class: 'cursor-pointer',
                  attributes: 'shinobi-switch="liveGridBorderBetween" ui-change-target=".dot" on-class="dot-green" off-class="dot-grey"',
                  color: 'grey',
              },
              {
                  label: lang['Mute Audio'],
                  class: 'cursor-pointer',
                  attributes: 'shinobi-switch="monitorMuteAudio" ui-change-target=".dot" on-class="dot-green" off-class="dot-grey"',
                  color: 'grey',
              },
              {
                  label: lang['Stream in Background'],
                  class: 'cursor-pointer',
                  attributes: 'shinobi-switch="backgroundStream" ui-change-target=".dot" on-class="dot-grey" off-class="dot-green"',
                  color: 'grey',
              },
              {
                  label: lang[`Original Aspect Ratio`],
                  class: 'cursor-pointer',
                  attributes: 'shinobi-switch="dontMonStretch" ui-change-target=".dot" on-class="dot-grey" off-class="dot-green"',
                  color: 'grey',
              },
              ...[1,2,3,4,5].map(gridNumber => {
                  return {
                      label: `${gridNumber} x ${gridNumber}`,
                      class: 'cursor-pointer auto-place-monitors',
                      attributes: `data-number="${gridNumber}"`,
                      color: 'purple',
                  }
              }),
              // {
              //     label: lang[`Hide Detection on Stream`],
              //     class: 'cursor-pointer',
              //     attributes: 'shinobi-switch="dontShowDetection" ui-change-target=".dot" on-class="dot-green" off-class="dot-grey"',
              //     color: 'grey',
              // },
              // {
              //     label: lang[`Alert on Event`],
              //     class: 'cursor-pointer',
              //     attributes: 'shinobi-switch="alertOnEvent" ui-change-target=".dot" on-class="dot-green" off-class="dot-grey"',
              //     color: 'grey',
              // },
              // {
              //     label: lang[`Popout on Event`],
              //     class: 'cursor-pointer',
              //     attributes: 'shinobi-switch="popOnEvent" ui-change-target=".dot" on-class="dot-green" off-class="dot-grey"',
              //     color: 'grey',
              // },
          ]
      },
      {
          label: lang['Monitors'],
          tabName: 'monitorsList',
          icon: 'video-camera',
      },
      {
          label: lang['Timeline'],
          tabName: 'timeline',
          icon: 'barcode',
          addUl: true
      },
      {
          label: lang['Videos'],
          tabName: 'videosTable',
          icon: 'film',
      },
      {
          label: lang['Timelapse'],
          tabName: 'timelapseViewer',
          icon: 'fast-forward',
      },
      {
          label: lang['Monitor Map'],
          tabName: 'monitorMap',
          icon: 'map-marker',
      },
      {
          label: lang['FileBin'],
          tabName: 'fileBin',
          icon: 'file-o',
      },
      {
          divider: true,
      },
      {
          label: lang['Monitor Settings'],
          tabName: 'monitorSettings',
          icon: 'wrench',
          addUl: true
      },
      {
          label: lang['Region Editor'],
          tabName: 'regionEditor',
          icon: 'grav',
      },
      {
          label: lang['Event Filters'],
          tabName: 'eventFilters',
          icon: 'filter',
          addUl: true
      },
      {
          label: lang['Monitor States'],
          tabName: 'monitorStates',
          icon: 'align-right',
      },
      {
          label: lang['Schedules'],
          tabName: 'schedules',
          icon: 'clock-o',
      },
      {
          label: lang['Logs'],
          tabName: 'logs',
          icon: 'exclamation-triangle',
      },
      {
          divider: true,
      },
      {
          label: lang['Account Settings'],
          tabName: 'accountSettings',
          icon: 'user',
          addUl: true
      },
      {
          label: lang['subAccountManager'],
          tabName: 'subAccountManager',
          icon: 'group',
      },
      {
          label: lang['Permission Groups'],
          tabName: 'permissionSets',
          icon: 'group',
      },
      {
          label: lang['API Keys'],
          tabName: 'apiKeys',
          icon: 'key',
      },
      {
          divider: true,
      },
      {
          label: lang['ONVIF Scanner'],
          tabName: 'onvifScanner',
          icon: 'search',
          addUl: true
      },
      {
          label: lang['ONVIF Device Manager'],
          tabName: 'onvifDeviceManager',
          icon: 'opera',
          addUl: true
      },
    ]
}
