const DISCORD_RPC = require("discord-rpc");
DISCORD_RPC.register("895282820417724456");

module.exports = class DiscordRPC {
    constructor() {
        this.RPC = new DISCORD_RPC.Client({ transport: "ipc" });
        this.RPC.login({ clientId: "895282820417724456" }).catch(console.error);
        this.currentActivity = false;
        this.ready = false;
        this.timeToReady = 0;
        this.RPC.on("ready", () => {
            this.ready = true;
        });

        this.waitForReady = this.waitForReady.bind(this);
        this.setActivity = this.setActivity.bind(this);
        this.clearActivity = this.clearActivity.bind(this);
    }

    /**
     * @returns {Promise<DiscordRPC>}
     */
    waitForReady() {
        const intervalMS = 250;
        return new Promise((resolve, reject) => {
            const intervalID = setInterval(() => {
                this.timeToReady += intervalMS;
                if (this.ready == true) {
                    clearInterval(intervalID);
                    resolve(this);
                } else if (this.timeToReady === 10000) {
                    reject(new Error("Failed to connect to Discord RPC"));
                }
            }, intervalMS);
        });
    }

    setActivity(activity) {
        try {
            this.RPC.setActivity(activity);
            this.currentActivity = activity;
        } catch (err) {
            console.error(err);
        }
    }

    clearActivity() {
        if (this.currentActivity) {
            this.RPC.clearActivity();
            this.currentActivity = undefined;
        }
    }
};
