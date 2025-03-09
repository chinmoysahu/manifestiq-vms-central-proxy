# Shinobi Management-Central

## Installing the Management Server

This method will also ask you to create a user. You will be asked to create a user at the end of the installation.

By default it will install to `/home/mgmt`.

```
apt install curl -y
sh <(curl -s https://cdn.shinobi.video/apps/downloadAndInstallMgmtServer.sh)
```

However you can tell it to install at a different location by including an absolute path at the end of the command as shown below.

```
sh <(curl -s https://cdn.shinobi.video/apps/downloadAndInstallMgmtServer.sh) /home/mgmt2
```

2. Login to the Superuser panel of your Shinobi server and create a user, If one already exists you do not need to do this. This will be used by the Management Server.

## Updating the Management Server

Run the installer again. Remember to include the installation path if you installed at a different location.

```
sh <(curl -s https://cdn.shinobi.video/apps/downloadAndInstallMgmtServer.sh) /home/mgmt2
```

## Connect a Shinobi Server to the Management Server

> This assumes you will have one account created in the Superuser panel. This account will be automatically accessed by the Management Server. The Management Server will also have complete access to the Superuser panel.

1. Login to the Shinobi Superuser panel

> Edit Shinobi Server Configuration in Superuser panel. Add the following parameter.

```
"enableMgmtConnect": true,
```

2. Restart Shinobi and refresh the page.

> Open Controls and Logs tab and Restart Core. Then refresh the page. Now the Central Management tab will be enabled in the Superuser panel.

3. Fill the two fields

- **Server URL** : The IP Address of your Managment Server. Ensure port 8663 is available on this server.
- **P2P API Key** : This is gotten from your Shinobi Shop account. Review our Easy Remote Access guidelines for more information on getting one.

4. Save and your Shinobi server should appear in your Management Server's interface.

## Alternate Pairing Method

1. Shinobi Server must have the following parameters added before following this method.

```
"enableMgmtConnect": true,
```

2. Restart Shinobi and refresh the page.

> Open Controls and Logs tab and Restart Core. Then refresh the page. Now the Central Management tab will be enabled in the Superuser panel.

3. Login to the Management Server and navigate to the Servers tab and click Plus (+) icon and fill the pairing form.

- **Shinobi Server IP** : IP of the Shinobi server.
- **P2P API Key** : This is gotten from your Shinobi Shop account. Review our Easy Remote Access guidelines for more information on getting one.
- **Management Server IP** : The address of your Management server. This can be left blank to automatically use the value shown within it.

4. Save. You should now see the Server Connected.

## Management Server Usage Information

Review the `docs` folder of this repository.

- MENU.md
    - General Information about Menu items seen in the Dashboard once logged in.
- MOUNT.md
    - Information about how to setup a CIFS Mount to use for recorded footage.
- MONITORS.md
    - Viewing Live Streams
    - Editing a Monitor (Camera)
    - Adding a Monitor (Camera)
    - Moving a Monitor to another server
    - Deleting a Monitor
- RECORDINGS.md
    - Information about how to review recorded footage.

- MANUAL-INSTALL.md
    - Steps to install the Management Server without the Automatic installation method.