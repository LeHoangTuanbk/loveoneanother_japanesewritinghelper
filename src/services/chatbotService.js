import request from "request";
require('dotenv').config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

function callSendAPI(sender_psid, response) {
    // Construct the message body
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
const getStartTemplateVariable = {
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
                        "url": `${process.env.WEB_VIEW_REQUEST}`,
                        "title": "Open webview!",
                        "webview_height_ratio": "full",
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

let handleGetStarted = (sender_psid) => {
    return new Promise (async (resolve, reject) => {
        try {
            //Sender action
            await markSeen(sender_psid);
            await sendTypingOn(sender_psid);
            //Send text responese
            let warning_response = {"text": "Warning: This message is sent by a bot"}
            await callSendAPI(sender_psid, warning_response);
            
            //Send start template response
            let template_response = getStartTemplateVariable;
            await callSendAPI(sender_psid, template_response);
            //
            // let template_response = getStartedTemplate();
            // await callSendAPI(sender_psid, template_response);
            resolve('done');
        } catch(e) {
            reject(e);
        }
    })
};



let getStartedTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Test template",
                    "subtitle": "Choose a option that I can help you.",
                    "image_url": ATTACHMENT_URL,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Explain a grammar!",
                            "payload": "EXPLAIN_GRAMMAR",
                        },
                        {
                            "type": "postback",
                            "title": "Correct mistakes!",
                            "payload": "CORRECT_MISTAKES",
                        },
                        {
                            "type": "postback",
                            "title": "Change tone to polite!",
                            "payload": "CHANGE_TO_POLITE_TONE",
                        },
                        {
                            "type": "postback",
                            "title": "Guiline!",
                            "payload": "GUIDLINE",
                        }
                    ],
                }]
            }
        }
    }

    return response;
}

let handleGuideline = (sender_psid) => {
    return new Promise (async (resolve, reject) => {
        try {
            //Sender action
            await markSeen(sender_psid);
            await sendTypingOn(sender_psid);
            //Send text responese
            await sendAnImage(sender_psid);
            resolve('done');
        } catch(e) {
            reject(e);
        }
    })
};

const CUTE_KITTY_IMAGE = "https://media.tenor.com/6BDywNN7_NgAAAAd/dog-doggo.gif";
let sendAnImage = (sender_psid) => {
    let response = {
        "attachment":{
          "type":"image", 
          "payload":{
            "url": CUTE_KITTY_IMAGE, 
            "is_reusable":true
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
    handleGuideline: handleGuideline,
    
}