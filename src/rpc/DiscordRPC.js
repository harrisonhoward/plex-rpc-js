const DISCORD_RPC = require("discord-rpc");
DISCORD_RPC.register("814789808849289227");

module.exports = class DiscordRPC {
    constructor() {
        this.RPC = new DISCORD_RPC.Client({ transport: "ipc" });
        this.RPC.login({ clientId: "814789808849289227" }).catch(console.error);
        this.currentActivity = false;
        this.ready = false;
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
        return new Promise(resolve => {
            const intervalID = setInterval(() => {
                if (this.ready == true) {
                    clearInterval(intervalID);
                    resolve(this);
                }
            }, 500);
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
        }
    }
}