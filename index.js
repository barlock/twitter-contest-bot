var config = require("./lib/config"),
    kefir = require("kefir"),
    twitter = require("./lib/twitter"),

    MAX_ARRAY = 3000000,

    API_PERIOD = 1000 * 60 * 15, 	// 15 minutes
    API_LIMIT = 180,

    ONE_DAY = 1000 * 60 * 60 * 24,

    previouslyFoundTweets = [],
    friendList = [],
    searchPool = kefir.pool(),
    contestPool = kefir.pool(),
    newFriendPool = kefir.pool();

function addToFoundTweets (tweet) {
    previouslyFoundTweets.push(tweet.id_str);

    if (previouslyFoundTweets.length >= MAX_ARRAY) {
        previouslyFoundTweets = previouslyFoundTweets(MAX_ARRAY / 2, MAX_ARRAY);
    }
}

function filterNonContests (tweet) {
    var pass = false;

    if (tweet.text) {
        var text = tweet.text.toLowerCase(),
            tweetAge = Date.now() - Date.parse(tweet.created_at);

        pass = tweetAge < config.maxContestAge &&
            !tweet.in_reply_to_status_id &&
            !tweet.in_reply_to_user_id;

        pass = config.blockedPhrases.reduce((pass, phrase) => {
            return pass && !text.match(phrase);
        }, pass);

        pass = pass && !!text.match(/retweet|rt/);

        if (!pass) {
            addToFoundTweets(tweet);
        }
    } else {
        console.log("Found non-tweet");
        console.log(tweet);
    }

    return pass;
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

    return !tweet.retweeted &&
        !tweet.retweeted_status &&
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
                text = retweet.text.toLowerCase(),
                atTags = retweet.text.match(/@(\w)+/g) || [];

            addToFoundTweets(tweet);

            if (text.match(/fav|like/)) {
                console.log(`Favoriting ${retweet.id_str}`);
                twitter.favorite(retweet.id_str);
            }

            if (friendList.indexOf(retweet.user.screen_name) === -1 &&
                text.match(/follow|f\+rt|flw|rt&f|fllw/)) {
                newFriendPool.plug(kefir.constant(retweet.user.screen_name));
            }

            atTags.forEach(screenName => {
                newFriendPool.plug(kefir.constant(screenName));
            })
        })
}

twitter.getFriends()
    .onValue(friends => {
        friendList = friends;
        console.log(`Fetched ${friends.length} friends`);

        contestPool.plug(twitter
            .tweetStream("retweet win, rt win, retweet enter, rt enter"));
    });

// Fetch these tweets
searchPool
    .bufferBy(kefir.interval(API_PERIOD / API_LIMIT))
    .flatMap(tweets => {
        var ids = tweets.map(tweets => {
            return tweets.id_str;
        }).join(",");

        return twitter.lookup(ids);
    })
    .flatten()
    .onValue(tweet => {
        contestPool.plug(kefir.constant(tweet));
    });

// Enter contests!
contestPool
    .filter(filterPreviouslyFoundTweets)
    .filter(filterRetweets)
    .filter(filterNonContests)
    .bufferBy(kefir.interval(ONE_DAY / config.tweetsPerDay))
    .onValue(tweets => {
        var mostRetweets = tweets.reduce((mostRetweeted, tweet) => {
            return tweet.retweet_count > mostRetweeted.retweet_count ?
                tweet : mostRetweeted;
        });

        enterContest(mostRetweets);
    });

newFriendPool
    .flatMap((screenName) => {
        console.log(`Following ${screenName}`);
        return twitter.follow(screenName);
    })
    .onValue(user => {
        friendList.unshift(user.screen_name);

        console.log("New Friend total: ", friendList.length);

        if (friendList.length > config.maxFriends) {
            twitter.unFollow(friendList.pop())
                .onValue(user => {
                    console.log(`unFollowed ${user.screen_name}`);
                    console.log("New Friend total: ", friendList.length);
                })
        }
    });
