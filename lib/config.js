module.exports = {
    oauth: {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    },
    maxArray: 3000000, // Roughly 100mb
    maxFriends: 1337,
    tweetsPerDay: 900,
    maxContestAge: (1000 * 60 * 60 * 24) * 2,  // 2 Days
    blockedPhrases: [
        /rt @?\w+:/,
        /rt @?\w+/,
        /^rt:/,
        /^rt\s"/,
        /^@\s?\w+/,
        /^\w+:/,
        /^"/,
        /^i've entered/,
        /^i just entered/,
        /^i want/,
        /^help me/,
        "vote",
        "notifications",
        "proof"
    ]
};
