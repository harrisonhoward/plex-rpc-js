module.exports = plexLoginDetails => {
    const plex = {
        hostname: plexLoginDetails.address,
        username: plexLoginDetails.username,
        token: plexLoginDetails.token,
        https: plexLoginDetails.https,
        authenticator: plexLoginDetails.authenticator
    };
    if (plexLoginDetails.port) {
        plex.port = plexLoginDetails.port;
    }
    return plex;
};