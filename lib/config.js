module.exports = {
    oauth: {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    },
    maxArray: 3000000, // Roughly 100mb
    maxFriends: process.env.MAX_FRIENDS || 1337,
    tweetsPerDay: process.env.MAX_TWEETS__PER_DAY || 900,
    maxContestAge: process.env.MAX_CONTEST_AGE || (1000 * 60 * 60 * 24),  // 24 hours
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
        "proof",
        "question",
        "£"
    ]
};
