module.exports = (PlexLogin, sessionKey) => {
    return new Promise((resolve, reject) => {
        PlexLogin.query("/status/sessions").then(result => {
            const data = result.MediaContainer;
            if (data.size <= 0) {
                return resolve(false);
            }
            let match;
            if (Array.isArray(data.Metadata)) {
                data.Metadata.forEach(media => {
                    if (media.sessionKey == sessionKey) {
                        match = media;
                        return;
                    }
                });
                return resolve(match || false);
            }
            return resolve(false);
        }, reject);
    });
};