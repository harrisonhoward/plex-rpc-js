module.exports = (PlexLogin, plexLoginDetails) => {
    return new Promise((resolve, reject) => {
        PlexLogin.query("/status/sessions").then(result => {
            const data = result.MediaContainer;
            if (data.size <= 0) {
                return resolve(false);
            }
            let match;
            const checkUsers = plexLoginDetails.checkUsers ? [] : [{ username: plexLoginDetails.username, matches: [] }];
            if (plexLoginDetails.checkUsers
                && Array.isArray(checkUsers)) {
                plexLoginDetails.checkUsers.forEach(user => {
                    checkUsers.push({
                        username: user,
                        matches: []
                    });
                });
            }
            if (Array.isArray(data.Metadata)) {
                data.Metadata.forEach(media => {
                    checkUsers.forEach((user, index) => {
                        if (typeof media.User.title === "string"
                            && media.User.title.toLowerCase() === user.username.toLowerCase()) {
                            checkUsers[index].matches.push(media);
                        }
                    });
                });
                checkUsers.forEach(user => {
                    if (user.matches.length > 0) {
                        match = user.matches[0];
                        return;
                    }
                });
                return resolve(match || false);
            }
            return resolve(false);
        }, reject);
    });
};