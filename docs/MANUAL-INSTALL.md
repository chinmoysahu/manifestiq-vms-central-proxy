# Manual Installation

Don't do this if you did it Automatically!

1. Clone and Run the Installer.

```
git clone https://gitlab.com/Shinobi-Systems/Shinobi-Management-Server
cd Shinobi-Management-Server
npm i
npm i pm2 -g
pm2 index.js --name shinobi_mgmt
```

> **Web Server** default port is `8005`.
> **Peer Server** default port is `8663`.

To change them modify/create the conf.json for the Management Server and change :

```
"webPanelPort": 8005,
"peerPort": 8663
```

2. Add a User to the Management Server (via Terminal). This step is assuming you are already in the `Shinobi-Management-Server` folder.

```
node tools/addNewUser.js username password
```

3. Login to the Superuser panel of your Shinobi server and create a user.
