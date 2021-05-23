const { isEmptyString, isEmptyArray, isNumber, isBoolean, convertToBoolean } = require("../utils/typeCheck");

module.exports = class MediaModel {
    /**
     * @param {object} data 
     */
    constructor(data) {
        this.data = data;
        if (isEmptyString(data.type)) {
            throw new Error("data.type is undefined");
        }
        this.type = data.type;
        this.playerState = data.Player ? data.Player.state : undefined;
        this.addedAt = data.addedAt;
        this.updatedAt = data.updatedAt;
        this.contentRating = data.contentRating;
        this.duration = data.duration;
        this.ratingKey = data.ratingKey;
        this.sessionKey = data.sessionKey;
        this.studio = data.studio;
        this.summary = data.summary;
        this.tagline = data.tagline;
        this.viewOffset = data.viewOffset;
        this.year = data.year;
        this.userWatching = data.User ? data.User.title : undefined;
        this.sessionID = data.Session ? data.Session.id : undefined;
        if (data.type === "movie") {
            this.title = data.title;
        } else if (data.type === "episode") {
            this.title = data.grandparentTitle;
            this.episode = data.title;
            this.episodeNum = data.index;
            this.season = data.parentTitle;
            this.seasonNum = data.parentIndex;
        } else {
            throw new Error("data.type is not \"movie\" or \"episode\"");
        }
    }

    /**
     * @param {MediaModel} media 
     * @param {MediaModel} mediaToMatch 
     */
    static compareInstances(media, mediaToMatch) {
        if (media instanceof MediaModel
            && mediaToMatch instanceof MediaModel) {
            if (media.type === "movie"
                && mediaToMatch.type === "movie") {
                if (media.title === mediaToMatch.title
                    && media.year === mediaToMatch.year
                    && media.userWatching === mediaToMatch.userWatching) {
                    return true;
                }
            } else if (media.type === "episode"
                && mediaToMatch.type === "episode") {
                if (media.title === mediaToMatch.title
                    && media.episodeNum === mediaToMatch.episodeNum
                    && media.seasonNum === mediaToMatch.seasonNum
                    && media.year === mediaToMatch.year
                    && media.userWatching === mediaToMatch.userWatching) {
                    return true;
                }
            }
        }
        return false;
    }
}
