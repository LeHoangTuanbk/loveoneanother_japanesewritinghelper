import request from "request";
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

async function callSendAPI(sender_psid, response) {
    return new Promise(async (resolve, reject) => {
        // Construct the message body
        try {
            await markSeen(sender_psid);
            await sendTypingOn(sender_psid);

            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": response
            }
            
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

// const ATTACHMENT_URL = "https://www.in.nesinc.com/Content/STUDYGUIDE/images/questions/057_03.png"
// const getStartTemplateVariable = (sender_psid) => {
//     let res = {
//         "attachment": {
//             "type": "template",
//             "payload": {
//                 "template_type": "generic",
//                 "elements": [{
//                     "title": "Test",
//                     "subtitle": "Tap a button.",
//                     "image_url": ATTACHMENT_URL,
//                     "buttons": [
//                         {
//                             "type": "web_url",
//                             "url": `${process.env.WEB_VIEW_REQUEST}/${sender_psid}`,
//                             "title": "Open webview!",
//                             "webview_height_ratio": "tall",
//                             "messenger_extensions": true,
//                         },
//                         {
//                             "type": "postback",
//                             "title": "Guideline!",
//                             "payload": "GUIDELINE",
//                         }
//                     ],
//                 }]
//             }
//         }
//     }

//     return res;
// }

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Sender action
            // await markSeen(sender_psid);
            // await sendTypingOn(sender_psid);
            //Send hello message
            let helloResponse = { "text": "Hello! What can I assist you with today?" };
            await callSendAPI(sender_psid, helloResponse);

            //Send options
            let options = {"text":
`Here are some options that I can assist you with.

1. Explain a Japanese grammar. 
2. Rewrite the paragaph with correct grammar. 
3. Change to a casual tone. 
4. Change to a polite tone.
5. Change to a super polite tone. 
                `
            }

            await callSendAPI(sender_psid, options)

            //Send quick replies
            await sendGetStartedQuickReplyTemplate(sender_psid)
            
            //Send resolve
            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
};

let sendGetStartedQuickReplyTemplate = (sender_psid) => {
    let response = {
        "text": "Now, choose one!",
        "quick_replies": [
            {
                "content_type": "text",
                "title": "1",
                "payload": "EXPLAIN_GRAMMAR",
            }, {
                "content_type": "text",
                "title": "2",
                "payload": "REWRITE_CORRECT_GRAMMAR",
            }, {
                "content_type": "text",
                "title": "3",
                "payload": "CHANGE_TO_CASUAL",
            }, {
                "content_type": "text",
                "title": "4",
                "payload": "CHANGE_TO_POLITE",
            },
            {
                "content_type": "text",
                "title": "5",
                "payload": "CHANGE_TO_SUPER_POLITE",
            }
        ]
    }
    callSendAPI(sender_psid, response);
}

let handleRestartConversation = async (sender_psid) => {
    let restartNotificationResponse = { "text": "You requested to restart the conversation!" };
    await callSendAPI(sender_psid, restartNotificationResponse);
    handleGetStarted(sender_psid);
}

let handleGuideline = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Send text responese
            let guidelineResponse = {
                "text":"This feature will be implemented in the future!\nPlease restart the conversation to continue!"
            }
            // await sendAnImage(sender_psid);
            await callSendAPI(sender_psid, guidelineResponse);
            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
};

const handleOthers = async (sender_psid, payload) => {
    let unknownResponse = { "text": `Oops! I don't know how to response with ${payload}. Please try another action!` };
    await callSendAPI(sender_psid, unknownResponse);
    
}
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

module.exports = {
    handleGetStarted: handleGetStarted,
    handleRestartConversation: handleRestartConversation,
    handleGuideline: handleGuideline,
    handleOthers: handleOthers,
}