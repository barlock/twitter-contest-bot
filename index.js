var kefir = require("kefir"),
    twitter = require("./lib/twitter"),

    MAX_ARRAY = 3000000,
    RATE_LIMIT_EXCEEDED_TIMEOUT = 1000 * 60 * 15, 	// 15 minutes
    RATE_LIMIT = 180,
    previouslyFoundTweets = [],
    searchPool = kefir.pool(),
    contestPool = kefir.pool();

function addToFoundTweets (tweet) {
    previouslyFoundTweets.push(tweet.id_str);

    if (previouslyFoundTweets.length >= MAX_ARRAY) {
        previouslyFoundTweets = previouslyFoundTweets(MAX_ARRAY / 2, MAX_ARRAY);
    }
}

function filterNonContests (tweet) {
    var text = tweet.text.toLowerCase(),
        letItThrough =
        !text.match(/rt @?\w+:/) &&
        !text.match(/rt @?\w+/) &&
        !text.match(/^rt:/) &&
        !text.match(/^rt\s"/) &&
        !text.match(/^@\s?\w+/) &&
        !text.match(/^\w+:/) &&
        !text.match(/^"/) &&
        !text.match(/^i've entered/) &&
        !text.match(/^i just entered/) &&
        !text.match("vote") &&
        !tweet.retweeted;

    if(!letItThrough) {
        addToFoundTweets(tweet);
    }

    return letItThrough;
}

function filterRetweets (tweet) {
    if (tweet.retweeted_status) {
        addToFoundTweets(tweet);
        searchPool.plug(kefir.constant(tweet.retweeted_status));
    }

    if (tweet.quoted_status) {
        addToFoundTweets(tweet);
        searchPool.plug(kefir.constant(tweet.quoted_status));
    }

    return !tweet.retweeted_status &&
        !tweet.quoted_status;
}

function filterPreviouslyFoundTweets (tweet) {
    return previouslyFoundTweets.indexOf(tweet.id_str) === -1;
}

function enterContest (tweet) {
    console.log(`Retweeting ${tweet.id_str}`);
    return twitter.retweet(tweet.id_str)
        .onValue(tweet => {
            var retweet = tweet.retweeted_status,
                text = retweet.text.toLowerCase();

            addToFoundTweets(tweet);

            if (text.match(/fav|like/)) {
                console.log(`Favoriting ${retweet.id_str}`);
                twitter.favorite(retweet.id_str);
            }

            if (text.match(/follow|f\+rt|flw/)) {
                console.log(`Following ${retweet.user.id_str}`);
                twitter.follow(retweet.user.id_str);
            }
        })
}

function searchStream (type) {
    return twitter
        .search({
            q: "retweet to win -vote -filter:retweets OR RT to win -vote -filter:retweets",
            result_type: type,
            count: 100
        })
        .flatten();
}

contestPool.plug(twitter
    .tweetStream("retweet win, rt win, retweet enter, rt enter"));

//contestPool.plug(kefir.interval(searchStream("popular")));

// Fetch these tweets
searchPool
    .throttle(RATE_LIMIT_EXCEEDED_TIMEOUT / RATE_LIMIT)
    .flatMap(tweet => {
        return twitter.getTweet(tweet.id_str);
    })
    .onValue(tweet => {
        contestPool.plug(kefir.constant(tweet));
    });

// Enter contests!
contestPool
    .filter(filterPreviouslyFoundTweets)
    .filter(filterRetweets)
    .filter(filterNonContests)
    .onValue(enterContest);
