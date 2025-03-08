# Monitors

## Viewing Live Streams

You can click the Monitor name in the Side Menu to launch the Live Stream in the Live Grid tab.

The best choice for Live Stream is **Poseidon over Websocket** with **Video Codec** set as **copy**. Audio Codec is disabled by default and must be enabled manually. We recommend setting **Audio Codec** to **AAC**.

If you cannot see the option to set **Connection Type** to Websocket you must toggle **Simple** to **Advanced** in the bottom right corner of the **Monitor Settings** tab.

Poseidon over Websocket will have low latency as well as offer H.265 Playback in Chrome on a Windows 11 Client device.

More Information here : https://hub.shinobi.video/articles/view/DoqdG2mdBsvMctn

## Editing a Monitor (Camera)

You can open the **Monitor Settings** tab then select the Server you want to list Monitors from. Then below that selector you can choose which Monitor to edit.

## Adding a Monitor (Camera)

**Adding them with ONVIF Scanner**

You can open the **ONVIF Scanner** tab then select the Server that you want to Scan from and Add to. Input the IP Address Range to scan and put the Camera(s) Username and Password. Port can be left blank.

Example IP Range : `10.0.0.1-10.0.1.254`

**Manually Adding them**

You can open the **Monitor Settings** tab then select the Server you want to add Monitors to. Then below that selector you can choose **Add New**. This will clear the form of any previously selected Monitors to prepare it for adding a new one with default settings.

> By default the options are geared for an H.264 stream coming from the camera. Just change the **Stream Type** to Poseidon and **Connection Type** to Websocket to set it for an H.265 stream.

## Moving a Monitor to another server

Open the **Monitors** tab. Select the Monitors you wish to Move then in the bottom right corner open the menu and select **Move**. A confirmation window will appear allowing you to choose which server to move them to.

The **Move** feature will **NOT** move recorded footage to the other server AND will **delete** any footage saved on the Server that it will be moved from.

## Deleting a Monitor

Similar to the **Move** feature, open the **Monitors** tab and select the Monitors you want to delete. Then in the bottom right menu select **Delete**.
