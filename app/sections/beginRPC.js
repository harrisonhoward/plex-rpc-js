const PlexAPI = require("plex-api");
const { WebsocketClient } = require("plex-websocket");

const DiscordRPC = require("../components/DiscordRPC");
const PlexMediaComponent = require("../components/PlexMedia");
const PlexSessionComponent = require("../components/PlexSession");

const prompt = require("../utils/prompt");
const log = require("../utils/log");
const { isEmptyString, isEmptyArray, isNumber, isBoolean, convertToBoolean } = require("../utils/typeCheck");

/**
 * @param {import("../config").CONFIG} CONFIG 
 */
module.exports = async CONFIG => {
    console.clear(); // Clear previous logs
    console.log(
        "Plex Login Information\n" +
        `   Address: ${CONFIG.ADDRESS}\n` +
        `   Username: ${CONFIG.USERNAME}\n` +
        `   Check Users: ${CONFIG.CHECKUSERS.join(", ")}\n` +
        `   HTTPS Enabled: ${CONFIG.HTTPS}\n`
    );

    const PlexClient = new PlexAPI(CONFIG.toPlexAPI());
    /**
     * @type {DiscordRPC}
     */
    let rpc;
    try {
        rpc = await new DiscordRPC().waitForReady();
    } catch (err) {
        console.error(err);
        return;
    }
    log(`Discord RPC took ${rpc.timeToReady / 1000} seconds to connect\n`);

    const PlexMedia = new PlexMediaComponent(PlexClient, CONFIG);
    const PlexSession = new PlexSessionComponent(PlexMedia, rpc, CONFIG);

    log(`Finding server "${CONFIG.ADDRESS}${CONFIG.PORT ? `:${CONFIG.PORT}` : ""}"`);
    PlexClient.query("/").then(async result => {
        log(`Server found "${result.MediaContainer.friendlyName}"\n`);
        log("Connecting to server...");

        const WSClient = new WebsocketClient(PlexClient, PlexSession.onPacket);
        WSClient.websocket.on("connect", () => {
            log("Connected to server\n");
            log("Waiting for media to start playing...\n");
        });
        WSClient.websocket.on("error", err => {
            log("Unexpected connection error");
            console.error(err.stack);
        });

        const currentMedia = await PlexMedia.getMediaSessionFromCONFIG();
        if (currentMedia) {
            PlexSession.currentMedia = currentMedia;
            const mediaActivity = PlexSession.mediaToActivity()
            rpc.setActivity(mediaActivity.activity);
            log(`New session detected - ${mediaActivity.mediaName}`);
        }
    }).catch(err => {
        // If there was an error
        // Ask user to check and re-enter credentials
        log("There was an error connecting to server, check login details");
        console.error(err.stack);
    });
}