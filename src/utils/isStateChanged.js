module.exports = (previous, next, stateUpdatedAt) => {
    if (typeof previous === "object") {
        if (previous.type === next.type) {
            if ((next.Player && next.Player.state)
                && previous.Player.state === next.Player.state) {
                if (typeof stateUpdatedAt === "number") {
                    const timeDiff = parseInt(previous.viewOffset)
                        + (Math.round((Date.now() - stateUpdatedAt) / 1000) * 1000);
                    // If the time difference between the last state change is within
                    // 5 seconds then don't change the state
                    // This feature allows you to skip parts of the movie and have it show
                    if (timeDiff === parseInt(next.viewOffset)
                        || (timeDiff + 5000) === parseInt(next.viewOffset)
                        || (timeDiff - 5000) === parseInt(next.viewOffset)) {
                        return false;
                    } else if (previous.viewOffset === next.viewOffset) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }
    }
    if (["episode", "movie"].includes(next.type)) {
        return true;
    }
    return false;
}