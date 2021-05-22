const PlexAPI = require("plex-api");
const MediaModel = require("../models/MediaModel");
const { isEmptyArray } = require("../utils/typeCheck");

module.exports = class PlexMedia {
    /**
     * @param {PlexAPI} client 
     * @param {import("../config").CONFIG} CONFIG 
     */
    constructor(client, CONFIG) {
        this.client = client;
        this.CONFIG = CONFIG;
    }

    /**
     * Use the CONFIG to find a users session
     * @param {MediaModel} currentMedia The active media being displayed
     * @returns {Promise<MediaModel>}
     */
    getMediaSessionFromCONFIG(currentMedia) {
        return new Promise((resolve, reject) => {
            this.client.query("/status/sessions").then(result => {
                const data = result.MediaContainer;
                if (data.size <= 0) {
                    return resolve(false);
                }
                /**
                 * @type {MediaModel | undefined}
                 */
                let mediaMatch;

                const checkUsers = (isEmptyArray(this.CONFIG.CHECKUSERS) // If CHECKUSERS is empty, use the username
                    ? [{ username: this.CONFIG.USERNAME, matches: [] }]
                    : []);
                if (Array.isArray(this.CONFIG.CHECKUSERS)) { // Convert all users
                    this.CONFIG.CHECKUSERS.forEach(user => {
                        checkUsers.push({
                            username: user,
                            matches: []
                        });
                    });
                }

                if (Array.isArray(data.Metadata)) {
                    // If currentMedia is matched return that
                    data.Metadata.forEach(mediaData => {
                        let media;
                        try {
                            media = new MediaModel(mediaData);
                            if (MediaModel.compareInstances(media, currentMedia)) {
                                mediaMatch = media;
                                return;
                            }
                        } catch (err) {
                        }
                    });
                    if (mediaMatch === undefined
                        || mediaMatch.data.Player.state !== "playing") {
                        data.Metadata.forEach(media => {
                            checkUsers.forEach((user, index) => {
                                if (typeof media.User.title === "string"
                                    && media.User.title.toLowerCase() === user.username.toLowerCase()) {
                                    checkUsers[index].matches.push(media);
                                }
                            });
                        });
                        checkUsers.forEach(user => {
                            if (user.matches.length > 0) { // first checkUser has priority
                                mediaMatch = new MediaModel(user.matches[0]);
                                return;
                            }
                        });
                    }
                    return resolve(mediaMatch || false);
                }
                return resolve(false);
            });
        });
    }

    /**
     * Use the Session Key to find a media session
     * @param {*} sessionKey
     * @returns {MediaModel}
     */
    getMediaSessionFromID(sessionKey) {
        return new Promise((resolve, reject) => {
            this.client.query("/status/sessions").then(result => {
                const data = result.MediaContainer;
                if (data.size <= 0) {
                    return resolve(false);
                }
                let mediaMatch;

                if (Array.isArray(data.Metadata)) {
                    data.Metadata.forEach(mediaData => {
                        if (mediaData.sessionKey == sessionKey) {
                            try {
                                mediaMatch = new MediaModel(mediaData);
                                return;
                            } catch (err) {
                            }
                        }
                    });
                    return resolve(mediaMatch || false);
                }
                return resolve(false);
            });
        });
    }
};