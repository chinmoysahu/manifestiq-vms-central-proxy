module.exports = (s,config,lang,app,io) => {
    s.onFfmpegCameraStringCreation((monitorConfig,ffmpegCommand) => {
        ffmpegCommand.splice(0, 0, `-user-agent '${s.gid(15)}'`);
    })
}
