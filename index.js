const config = require("./config");
const Imap = require('imap');
const {simpleParser} = require('mailparser');
const fetch = require("node-fetch");


const getEmails = () => {
    try {
        const imap = new Imap(config);
        let yesterday = new Date();
        yesterday = yesterday.setDate(yesterday.getDate() - 1);

        imap.once('ready', () => {
            imap.openBox('INBOX', false, () => {
                imap.search(['UNSEEN', ['SINCE', yesterday]], (err, results) => {
                    const f = imap.fetch(results, {bodies: ''});
                    f.on('message', msg => {
                        msg.on('body', stream => {
                            simpleParser(stream, async (err, parsed) => {
                                console.log(`Retrieved message "${parsed.subject}"`);
                                await postMessage(parsed);
                            });
                        });
                        msg.once('attributes', attrs => {
                            const {uid} = attrs;
                            /*imap.addFlags(uid, ['\\Seen'], () => {
                                // Mark the email as read after reading it
                                console.log(`Message marked as read!`);
                            });*/
                        });
                    });
                    f.once('error', ex => {
                        return Promise.reject(ex);
                    });
                    f.once('end', () => {
                        console.log('Done fetching all messages!');
                        imap.end();
                    });
                });
            });
        });

        imap.once('error', err => {
            console.log(err);
        });

        imap.once('end', () => {
            console.log('Connection ended');
        });

        imap.connect();
    } catch (ex) {
        //console.log('an error occurred');
    }
};

const postMessage = async (message) => {
    let rec_date = new Date(message.date);
    rec_date = rec_date.toLocaleString();
    const payload = {
        channel: config.slack_channel,
        attachments: [
            {
                color: "#11a5aa",
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Nouvel email !*`,
                        },
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Sujet: ${message.subject}*`,
                        },
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: message.text,
                        },
                    },
                    {
                        type: "context",
                        elements: [
                            {
                                type: "mrkdwn",
                                text: `*Expéditeur:* ${message.from.text}`,
                            },
                        ],
                    },
                    {
                        type: "context",
                        elements: [
                            {
                                type: "mrkdwn",
                                text: `*Date:* ${rec_date}`,
                            },
                        ],
                    },
                ],
            },
        ],
    };
    fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": payload.length,
            Authorization: `Bearer ${config.slack_token}`,
            Accept: "application/json",
        },
    })
    .then((res) => {
        if (!res.ok) {
            throw new Error(`Server error ${res.status}`);
        }

        return res.json();
    })
    .catch((error) => {
        console.log(error);
    });
}

getEmails();