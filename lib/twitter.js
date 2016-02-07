var config = require("./config"),
    kefir = require("kefir"),
    Twitter = require("twitter"),
    twitter = new Twitter(config.oauth);

function handleError (error) {
    console.error(error);
}

function unique(array) {
    var unique = [];

    array.forEach(index => {
        if (unique.indexOf(index) === -1) {
            unique.push(index);
        }
    });

    return unique;
}

var api = {
	search: function (params) {
        return kefir
            .fromNodeCallback(done => {
                twitter.get("search/tweets", params, done);
            })
            .onError(handleError)
            .map(result => {
                return result.statuses
            });
    },

	retweet: function (id) {
        return kefir
            .fromNodeCallback(done => {
                return twitter.post(`statuses/retweet/${id}`, {id: id}, done)
            })
            .onError(handleError);
	},

	favorite: function (id) {
        return kefir
            .fromNodeCallback(done => {
                return twitter.post("favorites/create", {id: id}, done)
            })
            .onError(handleError);
	},

	follow: function (screenName) {
        return kefir
            .fromNodeCallback(done => {
                return twitter.post("friendships/create", { "screen_name": screenName}, done)
            })
            .onError(handleError);
	},

    unFollow: function (userId) {
        return kefir
            .fromNodeCallback(done => {
                return twitter.post("friendships/destroy", { "user_id": userId }, done)
            })
            .onError(handleError);
    },

	getBlockedUsers: function () {
        return kefir
            .fromNodeCallback(done => {
                return twitter.get("blocks/list", done);
            })
            .onError(handleError)
            .map(result => {
                return result.users;
            });
	},

    getFriends: function(cursor, friends) {
        var csr = cursor || -1,
            friendNames = friends || [];

        return kefir
            .fromNodeCallback(done => {
                return twitter.get("friends/list", {cursor: csr, count: 200}, done);
            })
            .onError(handleError)
            .flatMap(results => {
                friendNames = unique(friendNames.concat(results.users.map(user => {
                    return user.screen_name;
                })));

                if (results.next_cursor === 0) {
                    return kefir.constant(friendNames);
                } else {
                    return api.getFriends(results.next_cursor, friendNames);
                }
            })
    },

    lookup: function (id) {
        return kefir
            .fromNodeCallback(done => {
                return twitter.get("statuses/lookup", {id: id}, done);
            })
            .onError(handleError)
    },

    tweetStream: function (track) {
        return kefir.stream(emitter => {
            twitter.stream("statuses/filter", {track: track}, stream => {
                stream.on("data", tweet => {
                    emitter.emit(tweet)
                });

                stream.on("error", error => {
                    emitter.error(error);
                })
            })
        })
        .onError(handleError);
    }
};

module.exports = api;
