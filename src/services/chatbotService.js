import request from "request";
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

async function callSendAPI(sender_psid, response) {
    return new Promise(async (resolve, reject) => {
        // Construct the message body
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": response
            }
            await markSeen(sender_psid);
            await sendTypingOn(sender_psid);

            // Send the HTTP request to the Messenger Platform
            await request({
                "uri": "https://graph.facebook.com/v2.6/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {

                if (!err) {
                    resolve('message sent!')
                } else {
                    console.error("Unable to send message:" + err);
                }
            });

        }
        catch (e) {
            reject(e);
        }
    })

}

function sendTypingOn(sender_psid) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": "typing_on"
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {

        if (!err) {
            console.log('Typing on sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

function markSeen(sender_psid) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": "mark_seen"
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {

        if (!err) {
            console.log('Markseen sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

const ATTACHMENT_URL = "https://www.in.nesinc.com/Content/STUDYGUIDE/images/questions/057_03.png"
const getStartTemplateVariable = (sender_psid) => {
    let res = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Test",
                    "subtitle": "Tap a button.",
                    "image_url": ATTACHMENT_URL,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.WEB_VIEW_REQUEST}/${sender_psid}`,
                            "title": "Open webview!",
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true,
                        },
                        {
                            "type": "postback",
                            "title": "Guideline!",
                            "payload": "GUIDELINE",
                        }
                    ],
                }]
            }
        }
    }

    return res;
}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Sender action
            await markSeen(sender_psid);
            await sendTypingOn(sender_psid);
            //Send text responese
            let warning_response = { "text": "Warning: This message is sent by a bot" }
            await callSendAPI(sender_psid, warning_response);

            //Send start template response
            let template_response = getStartTemplateVariable(sender_psid);
            await callSendAPI(sender_psid, template_response);
            //
            // let template_response = getStartedTemplate();
            // await callSendAPI(sender_psid, template_response);
            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
};


let handleGuideline = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Sender action
            await markSeen(sender_psid);
            await sendTypingOn(sender_psid);
            //Send text responese
            await sendAnImage(sender_psid);
            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
};

const CUTE_KITTY_IMAGE = "https://media.tenor.com/6BDywNN7_NgAAAAd/dog-doggo.gif";
let sendAnImage = (sender_psid) => {
    let response = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": CUTE_KITTY_IMAGE,
                "is_reusable": true
            }
        }
    };

    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

let getStartedQuickReplyTemplate = (sender_psid) => {
    let response = {
        "text": "Choose an option!",
        "quick_replies": [
            {
                "content_type": "text",
                "title": "1",
                "payload": "EXPLAIN_GRAMMAR",
            }, {
                "content_type": "text",
                "title": "2",
                "payload": "MAKE_IT_POLITE",
            }, {
                "content_type": "text",
                "title": "3",
                "payload": "MAKE_IT_CASUAL",
            }, {
                "content_type": "text",
                "title": "4",
                "payload": "MAKE_IT_SUPER_POLITE",
            }
        ]
    }
    callSendAPI(sender_psid, response);
}

module.exports = {
    handleGetStarted: handleGetStarted,
    handleGuideline: handleGuideline,
    getStartedQuickReplyTemplate: getStartedQuickReplyTemplate,
    callSendAPI: callSendAPI,
}