const { WebsocketClient } = require("plex-websocket");
const PlexAPI = require("plex-api");
const DiscordRPC = require("./rpc/DiscordRPC");

const { isEmptyString } = require("./utils/typeCheck");
const getLoginSettings = require("./utils/getLoginDetails");
const objectToPlexDetails = require("./utils/objectToPlexDetails");
const getMediaSession = require("./utils/getMediaSession");
const getMediaSessionFromID = require("./utils/getMediaSessionFromID");
const isStateChanged = require("./utils/isStateChanged");
const mediaToActivity = require("./utils/mediaToActivity");

// Asynchronous tools available
(async () => {
    function resetConsole() {
        console.clear();
        console.log("Type \"exit\" anytime to exit the application\n");
    }
    resetConsole(); // Clear before app start

    /**
     * @typedef {Object} PlexLoginDetails
     * @property {String} address
     * @property {Number} [port]
     * @property {Boolean} https
     * @property {String} username
     * @property {String} token
     * @property {String[]} [checkUsers=[]]
     */

    /**
     * @type {PlexLoginDetails}
     */
    let plexLoginDetails = require("./CONFIG");
    while (isEmptyString(plexLoginDetails.address)
        && isEmptyString(plexLoginDetails.username)
        && isEmptyString(plexLoginDetails.token)) {
        const gatheredLoginDetails = getLoginSettings(plexLoginDetails);
        if (typeof gatheredLoginDetails === "object") {
            plexLoginDetails = gatheredLoginDetails;
        } else {
            resetConsole();
            console.log("INVALID LOGIN INFORMATION, TRY AGAIN");
        }
    }
    // Clear on process
    console.clear();
    console.log(
        "Plex Login Information\n" +
        `   Address: ${plexLoginDetails.address}\n` +
        `   Username: ${plexLoginDetails.username}\n` +
        `   Check Users: ${plexLoginDetails.checkUsers ? plexLoginDetails.checkUsers.join(", ") : ""}\n` +
        `   https: ${plexLoginDetails.https}\n`
    );

    const client = new PlexAPI(objectToPlexDetails(plexLoginDetails));
    const rpc = await new DiscordRPC().waitForReady();
    /**
     * @type {object | false}
     */
    let currentMedia = false;
    let updatedBefore = false;
    /**
     * @type {number | false}
     */
    let stateUpdatedAt = false;

    console.log(`Finding server "${plexLoginDetails.address}${plexLoginDetails.port ? `:${plexLoginDetails.port}` : ""}"`);
    client.query("/").then(async (login) => {
        console.log(`Server found "${login.MediaContainer.friendlyName}"\n`);
        console.log("Connecting to server...");
        const WSClient = new WebsocketClient(client, onPacket);
        WSClient.websocket.on("connect", () => {
            console.log("Connected to server\n");
            console.log("Waiting for media to start playing...\n");
        });
        WSClient.websocket.on("error", err => {
            console.log("Unexpected connection error:\n", err);
        });

        currentMedia = await getMediaSession(client, plexLoginDetails);
        if (currentMedia) {
            rpc.setActivity(mediaToActivity(currentMedia));
        } else {
        }
    });

    async function onPacket(type, data) {
        if (type === WebsocketClient.PACKETTYPES.PLAYING) {
            if (data.PlaySessionStateNotification
                && data.PlaySessionStateNotification.length > 0) {
                const medias = [];
                for (const media of data.PlaySessionStateNotification) {
                    const session = await getMediaSessionFromID(client, media.sessionKey);
                    if (media.state === "stopped"
                        && typeof currentMedia === "object") {
                        if (currentMedia.sessionKey == media.sessionKey) {
                            console.log("Media stopped");
                            currentMedia = false;
                            rpc.clearActivity();
                        }
                    } else if (session) {
                        medias.push(session);
                    }
                }
                for (const user of plexLoginDetails.checkUsers) {
                    for (const media of medias) {
                        if (typeof media.User.title === "string"
                            && media.User.title.toLowerCase() === user.toLowerCase()) {
                            const stateUpdated = isStateChanged(currentMedia, media, stateUpdatedAt);
                            if (stateUpdated) {
                                stateUpdatedAt = Date.now();
                                updatedBefore = false;
                                currentMedia = media;
                                rpc.setActivity(mediaToActivity(currentMedia));
                            } else {
                                if (!updatedBefore) {
                                    updatedBefore = true;
                                    console.log("No session change detected");
                                }
                            }
                            return;
                        }
                    }
                }
            }
        }
    }
})();