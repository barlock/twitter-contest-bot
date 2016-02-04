# Twitter-Contest-Bot

This is a bot that uses the twitter streaming api to enter contests via retweeting. It follows and favorites if nessisary.

Inspired by http://www.hscott.net/twitter-contest-winning-as-a-service/

##Disclaimer

This bot is written purely for educational purposes. I hold no liability for what you do with this bot or what happens to you by using this bot. Abusing this bot can get you banned from Twitter, so make sure to read up on proper usage of the Twitter API.

##Installation
 * Make sure you have NodeJS up and running
 * `git clone` the repository, or download the zip file and unzip it
 * `npm install` in the directory where you cloned the repository (this is needed for installing dependencies)
 * Export the variables found in `lib/config.js` with your Twitter API Credentials
 * run `node index.js`

## Running on Cloud Foundry

Create a manifest.yml

```yml
---
applications:
  - name: twitter-bot
    env:
      TWITTER_CONSUMER_KEY: <YOUR_TWITTER_CONSUMER_KEY>
      TWITTER_CONSUMER_SECRET: <YOUR_TWITTER_CONSUMER_SECRET>
      TWITTER_ACCESS_TOKEN_KEY: <YOUR_TWITTER_ACCESS_TOKEN_KEY>
      TWITTER_ACCESS_TOKEN_SECRET: <YOUR_TWITTER_ACCESS_TOKEN_SECRET>
```

and

```bash
$ cf push
```

## Licence
The code is open-source and available under the MIT Licence. More details in the LICENCE.md file.
