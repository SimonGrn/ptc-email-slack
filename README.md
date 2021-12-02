# PTC Email Notification on Slack

## What is this ?
This is a very small script to send an alert in Slack when the ParisTestConf email account receive
and email. The team doesn't check the email account enough so that was my solution.

There isn't any simple solution to do that without paying a third-party so... here we are.

## How to install
Run `npm install` !

## How to configure
Copy `config.example.js` to `config.js` and replace all values.

## How to use
1. Create a [Slack app](https://api.slack.com/authentication/basics)
2. Get the OAuth token in your [app's management page](https://api.slack.com/apps) (_OAuth & Permissions_ section)
3. Add the OAuth token in the `config.js` file, for the `slack_token` entry

Add your Slack application to your server and the channel you want alerts to be sent to.
Then launch the app regularly (on a cron for example) with `node ./index.js`.