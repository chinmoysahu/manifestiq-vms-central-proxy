# Menu

> Information about the Menu items of the Shinobi Management Server.

- Dashboard
    - Home
        - Displays Day Cards like the normal Shinobi interface. (Currently not implemented)
    - Servers
        - Displays all Shinobi servers connected to the Management Server.
    - Monitors
        - Displays all Cameras from all Shinobi Servers.
    - Videos
        - Allows selecting a server to review recorded videos in a table format.
    - Timeline
        - Allows selecting a server to review recorded videos in a seamless fashion.
    - Live Grid
        - Allows viewing the Live Streams from cameras connected to any of the Shinobi Servers.
    - Account Settings
        - The Account Settings of the Account used by the Management Server when accessing data from the Shinobi Server.
        - Allows setting up Backup storage locations like the Mounts created in the Mount Manager or something like Amazon S3.
    - Monitor Settings
        - Allows Editing a Camera from any of your Shinobi Servers.
    - Region Editor
        - Allows setting intrusion zones for Cameras.
    - ONVIF Scanner
        - To add Cameras it allows scanning the network for any of the Shinobi Servers.
- Shinobi : Superuser
    - Mount Manager
        - Allows setting up CIFS mounts on the Shinobi server
        - Allows setting them to be the primary recording location.
            - You may set up the Mounts as a Backup location from **Account Settings** instead of using them as the primary recording location.
    - Controls and Logs
        - Displays Shinobi server Information from Superuser panel.
        - Posts Shinobi System Logs
        - Allows Deleting Logs, Restarting the Core, Updating Shinobi, and Flushing System Logs from the Shinobi Daemon.
- Tabs
    - When opening a Video it will appear here so that when navigated to another tab you may quickly return to it.
- Monitors
    - Listing of Monitors. Clicking one will open the Live Stream of the Camera upon the Live Grid.
