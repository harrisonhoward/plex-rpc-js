const DiscordRPC = require("./DiscordRPC");
const { WebsocketClient } = require("plex-websocket");
const MediaModel = require("../models/MediaModel");
const PlexMedia = require("./PlexMedia");
const log = require("../utils/log");

const { isEmptyArray } = require("../utils/typeCheck");

/**
 * @typedef {object} StateChange
 * @property {MediaModel} media
 * @property {string} changeType
 */

/**
 * @typedef {object} MediaActivity
 * @property {string} mediaName
 * @property {object} activity
 */

module.exports = class PlexSession {
    /**
     * @param {PlexMedia} client
     * @param {DiscordRPC} rpc 
     * @param {import("../config").CONFIG} CONFIG 
     */
    constructor(client, rpc, CONFIG) {
        this.client = client;
        this.rpc = rpc;
        this.CONFIG = CONFIG;
        this.currentMedia = undefined;
        this.lastStateUpdate = 0;

        this.onPacket = this.onPacket.bind(this);
    }

    /**
     * Packet function for websocket
     * @param {*} type 
     * @param {*} data 
     */
    async onPacket(type, data) {
        if (type === WebsocketClient.PACKETTYPES.PLAYING) {
            if (data.PlaySessionStateNotification
                && data.PlaySessionStateNotification.length > 0) {
                const medias = [];
                for (const media of data.PlaySessionStateNotification) {
                    const session = await this.client.getMediaSessionFromID(media.sessionKey);
                    if (media.state === "stopped"
                        && this.currentMedia instanceof MediaModel) {
                        if (this.currentMedia.sessionKey === media.sessionKey) {
                            const activity = this.mediaToActivity();
                            log(`Session stopped - ${activity.mediaName}`);
                            this.currentMedia = undefined;
                            this.rpc.clearActivity();
                        }
                    } else if (session) {
                        medias.push(session);
                    }
                }

                const previousCurrentMedia = this.currentMedia;
                /**
                 * @type {StateChange | undefined}
                 */
                let stateMedia;
                // if currentMedia is matched from the packet session
                medias.forEach(media => {
                    if (MediaModel.compareInstances(media, this.currentMedia)) {
                        const isStateChanged = this.isStateChanged(media);
                        if (isStateChanged !== undefined) {
                            stateMedia = isStateChanged;
                            return;
                        }
                    }
                });
                let updatedCurrentMedia;
                if (this.currentMedia) {
                    // Get an updated currentMedia
                    // If currentMedia is not playing, it gets overrided by a playing session
                    updatedCurrentMedia = await this.client.getMediaSessionFromID(this.currentMedia.sessionKey);
                }

                if ((stateMedia === undefined
                    || stateMedia.media.playerState !== "playing")
                    && (!updatedCurrentMedia || updatedCurrentMedia.playerState !== "playing")) {
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

                    medias.forEach(media => {
                        checkUsers.forEach((user, index) => {
                            if (typeof media.userWatching === "string"
                                && media.userWatching.toLowerCase() === user.username.toLowerCase()) {
                                checkUsers[index].matches.push(media);
                            }
                        });
                    });
                    checkUsers.forEach(user => {
                        if (user.matches.length > 0) { // first checkUser has priority
                            const isStateChanged = this.isStateChanged(user.matches[0]);
                            if (isStateChanged !== undefined) {
                                stateMedia = isStateChanged;
                                return;
                            }
                        }
                    });
                }
                if (stateMedia !== undefined) {
                    this.currentMedia = stateMedia.media;
                    const mediaActivity = this.mediaToActivity();

                    switch (stateMedia.changeType) {
                        case "type":
                            log(`Session type changed to ${this.currentMedia.type} - ${mediaActivity.mediaName}`);
                            break;
                        case "playerState":
                            if (this.currentMedia.playerState === "playing") {
                                if (previousCurrentMedia
                                    && MediaModel.compareInstances(this.currentMedia, previousCurrentMedia)) {
                                    log(`Session unpaused - ${mediaActivity.mediaName}`);
                                    break;
                                } else {
                                    log(`New session detected - ${mediaActivity.mediaName}`);
                                    break;
                                }
                            }
                            log(`Session ${this.currentMedia.playerState} - ${mediaActivity.mediaName}`);
                            break;
                        case "viewOffset":
                            log(`Session time changed - ${mediaActivity.mediaName}`);
                            break;
                        default:
                            log(`Session change detected - ${mediaActivity.mediaName}`);
                            break;
                    }
                    this.lastStateUpdate = Date.now();
                    this.rpc.setActivity(mediaActivity.activity);
                }
            }
        }
    }

    /**
     * Check if the state has changed
     * @param {object} nextMedia
     * @returns {StateChange | undefined}
     */
    isStateChanged(nextMedia) {
        let media;
        if (nextMedia instanceof MediaModel) {
            media = nextMedia;
        } else {
            try {
                media = new MediaModel(nextMedia);
            } catch (err) {
                console.log(err);
                return;
            }
        }
        if (this.currentMedia instanceof MediaModel) {
            if (["episode", "movie"].includes(media.type)) {
                // Check the media type (episode and movie) are the same
                if (this.currentMedia.type !== media.type) {
                    return {
                        media,
                        changeType: "type"
                    };
                }
                // Check if the player state (playing, paused, stopped) are the same
                if (this.currentMedia.playerState !== media.playerState) {
                    return {
                        media,
                        changeType: "playerState"
                    };
                }
                if (this.currentMedia.playerState === "playing") {
                    // Check the time difference is greater or less than 30 seconds (Media view-time has changed)
                    const timeDiff = parseInt(this.currentMedia.viewOffset)
                        + (Math.round((Date.now() - this.lastStateUpdate) / 1000) * 1000);
                    if ((timeDiff + 30000) <= parseInt(media.viewOffset)
                        || (timeDiff - 30000) >= parseInt(media.viewOffset)) {
                        return {
                            media,
                            changeType: "viewOffset"
                        };
                    }
                }
            }
        } else {
            return {
                media,
                changeType: "playerState"
            };
        }
    }

    /**
     * Convert the current media to activity
     * @return {MediaActivity}
     */
    mediaToActivity() {
        if (!(this.currentMedia instanceof MediaModel)) {
            throw new Error("There is no current media");
        }

        let mediaName;
        let activity;
        switch (this.currentMedia.type) {
            case "movie": {
                mediaName = `${this.currentMedia.title} (${this.currentMedia.year})`;
                activity = {
                    details: this.currentMedia.title,
                    state: this.currentMedia.year
                };
                break;
            }
            case "episode": {
                mediaName =
                    `${this.currentMedia.title} ` +
                    `(S${this.currentMedia.seasonNum} · E${this.currentMedia.episodeNum} - ${this.currentMedia.episode})`;
                activity = {
                    details: this.currentMedia.title,
                    state: `S${this.currentMedia.seasonNum} · E${this.currentMedia.episodeNum} - ${this.currentMedia.episode}`
                };
                break;
            }
        }
        if (this.currentMedia.playerState === "playing") {
            activity.smallImageKey = "plex-play";
            activity.smallImageText = "Playing";
            activity.startTimestamp = Date.now() - this.currentMedia.viewOffset;
        }
        if (this.currentMedia.playerState === "paused") {
            activity.smallImageKey = "plex-pause";
            activity.smallImageText = "Paused";
        }
        activity.largeImageKey = "plex-large";
        activity.instance = false;
        return {
            mediaName,
            activity
        };
    }
};