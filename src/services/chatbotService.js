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
                        "type": "postback",
                        "title": "Open webview!",
                        "payload": "EXPLAIN_GRAMMAR",
                    },
                    {
                        "type": "postback",
                        "title": "Guidline!",
                        "payload": "GUIDLINE",
                    }
                ],
            }]
        }
    }
}

let handleGetStarted = (sender_psid) => {
    return new Promise (async (resolve, reject) => {
        try {
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
module.exports = {
    handleGetStarted: handleGetStarted
    
}