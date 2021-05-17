const log = require("./log");

module.exports = media => {
    function getStart(viewOffset) {
        return Date.now() - viewOffset;
    }

    const type = media.type;
    switch (type) {
        case "movie": {
            log(`Session updated - ${media.title} (${media.year})`);
            const activity = {
                details: media.title,
                state: media.year,
                largeImageKey: "plex-large",
                instance: false
            };
            if (media.Player.state === "playing") {
                activity.smallImageKey = "plex-play";
                activity.smallImageText = "Playing";
                activity.startTimestamp = getStart(media.viewOffset);
            }
            if (media.Player.state === "paused") {
                activity.smallImageKey = "plex-pause";
                activity.smallImageText = "Paused";
            }
            return activity;
        }
        case "episode": {
            log(`Session updated - ${media.grandparentTitle} (S${media.parentIndex} · E${media.index} - ${media.title})`);
            const activity = {
                details: media.grandparentTitle,
                state: `S${media.parentIndex} · E${media.index} - ${media.title}`,
                largeImageKey: "plex-large",
                instance: false
            };
            if (media.Player.state === "playing") {
                activity.smallImageKey = "plex-play";
                activity.smallImageText = "Playing";
                activity.startTimestamp = getStart(media.viewOffset);
            }
            if (media.Player.state === "paused") {
                activity.smallImageKey = "plex-pause";
                activity.smallImageText = "Paused";
            }
            return activity;
        }
    }
};