# Mounts

> Information about setting up a Mount and setting Shinobi to record or upload to it.

# Creating a Mount on the Shinobi Server

Using the **Mount Manager** you can setup a CIFS mount. Provide the following details to update the `/etc/fstab` of the Shinobi Server.

| Field Name   | Description                                                                                  | Example Value                                    |
|--------------|----------------------------------------------------------------------------------------------|------------------------------------------------|
| **Source**   | The network address of the shared folder or resource to mount.                               | `//192.168.1.200/shared/folder`               |
| **Mount Path** | The local directory where the shared folder will be mounted.                                | `/mnt/newmount`                                |
| **Mount Type** | The type of filesystem or protocol used to mount the shared folder. Currently only CIFS is supported.                         | `CIFS`                                         |
| **Options**   | Additional options for mounting, such as authentication details, permissions, and encoding. | `username=username,password=password,rw,iocharset=utf8,file_mode=0777,dir_mode=0777 0 0` |


# Backup to Mounted Drive Storage (Recommended)

Within the Account Settings you may setup the **Mounted Drive Storage** section to save to the created mount whenever a local video is finished Recording.

| Field Name              | Description                                                                 | Example Value      |
|-------------------------|-----------------------------------------------------------------------------|--------------------|
| **Autosave**            | Specifies whether changes should be saved to the Mounted Drive.                  | `Yes`              |
| **Mount Point**         | The directory where the mounted drive is accessible.                       | `/mnt/yourdrive`   |
| **Save Links to Database** | Specifies whether to allow managing the Videos with the Shinobi database as well as view them from the interface and Shinobi API.                     | `Yes`              |
| **Use Max Storage Amount** | Indicates whether a maximum storage limit should be enforced. When the max is reached the oldest will be deleted.              | `No`               |
| **Max Storage Amount**  | The maximum amount of storage space allowed (in MB).                       | `10000`            |
| **Save Directory**      | The directory where data will be saved within the Mount Point.                                    | `/`                |

# Saved Directly to the Mount Point

Within the Mount Manager there is a listing of all your Mount Points. Click the button titled "videosDir" (Green button with a Download Icon) to set the primary storage location to use this Mount Point.

It is recommended that you have a stable network connection between Shinobi Server and Mount Point to ensure that the CIFS mount does not disconnect. In the event this occurs Shinobi will be to save directly to the Shinobi server at that provided Path. It is recommended to use the **Backup to Mount** method.

Additionally you should only change this directory pointer when Shinobi is not actively recording. You can prevent this by turning adding `"safeMode": true,` in the Configuration of the Shinobi Server and restarting it, this can be done in **Controls and Logs** tab. Then once the Mount changes are complete you can remove it and restart Shinobi once more.
