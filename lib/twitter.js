var config = require("./config"),
    kefir = require("kefir"),
    Twitter = require("twitter"),
    twitter = new Twitter(config.twitter);

function handleError (error) {
    console.log(error);
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

	follow: function (userId) {
        return kefir
            .fromNodeCallback(done => {
                return twitter.post("friendships/create", { "user_id": userId}, done)
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

    getTweet: function (id) {
        return kefir
            .fromNodeCallback(done => {
                return twitter.get("statuses/show", {id: id}, done)
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
