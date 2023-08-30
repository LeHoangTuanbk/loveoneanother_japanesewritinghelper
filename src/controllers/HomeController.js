require('dotenv').config();
import request from "request"
import chatbotService from "../services/chatbotService";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

let getHomePage = (req, res) => {
    return res.render("homepage.ejs");
};

let postWebhook = (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Get the webhook event. entry.messaging is an array, but 
            // will only ever contain one event, so we get index 0

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

}

let getWebhook = (req, res) => {

    let VERIFY_TOKEN = process.env.VERIFY_TOKEN
    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            // Respond with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}

// Handles messages events
async function handleMessage(sender_psid, received_message) {
    // let response;

    // Checks if the message contains text
    if (received_message.quick_reply && received_message.quick_reply.payload) {
        let payload = received_message.quick_reply.payload
        switch (payload) {
            case "EXPLAIN_GRAMMAR":
            case "REWRITE_NATURAL_TONE":
            case "CHANGE_TO_CASUAL":
            case "CHANGE_TO_POLITE":
            case "CHANGE_TO_SUPER_POLITE":
                await chatbotService.handleRequest(sender_psid, payload);
                break;
            
            case "MAIN_OPTIONS":
                await chatbotService.sendMainOptions(sender_psid);
                break;

            default:
                //Will implement later. 
                // let response = {
                //     "text": `You sent the payload: nothing".`
                // }
                console.log("Can't handle quick replied payload");

        }
        return;
    }
    if (received_message.text) {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        await chatbotService.handleFreeText(sender_psid,received_message.text);

    } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    switch (payload) {
        case "RESTART_CONVERSATION":
            await chatbotService.handleRestartConversation(sender_psid);
            break;

        case "GET_STARTED":
            await chatbotService.handleGetStarted(sender_psid);
            break;

        case "GUIDELINES":
            await chatbotService.handleGuideline(sender_psid);
            break;

        default:
            await chatbotService.handleOthers(sender_psid, payload);
    }
    // Send the message to acknowledge the postback
}

let setupProfile = async (req, res) => {
    //Call Facebook profile api
    let request_body = {
        "greeting": [
            {
                "locale": "default",
                "text": "Hello {{user_first_name}}!"
            }
        ]
        // "get_started": {"payload": "GET_STARTED"},
        // "whitelisted_domains":["https://dawn-brook-301.fly.dev/"]
    }

    // Send the HTTP request to the Messenger Platform
    await request({
        "uri": `https://graph.facebook.com/v17.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body);
        if (!err) {
            console.log('Set up profile sucessfully!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
    res.sendStatus(200).send("Set up user profile sucessfully!");
}

let setupPersistentMenu = async (req, res) => {
    //Call Facebook profile api
    let request_body = {
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "postback",
                        "title": "Restart the conversation",
                        "payload": "RESTART_CONVERSATION"
                    },
                    {
                        "type": "postback",
                        "title": "Show guidelines",
                        "payload": "GUIDELINES"
                    },
                    {
                        "type": "web_url",
                        "title": "Report bugs to developer",
                        "url": "https://www.facebook.com/lehoang.tuanbk",
                        "webview_height_ratio": "full"
                    }
                ]
            }
        ]
    };

    // Send the HTTP request to the Messenger Platform
    await request({
        "uri": `https://graph.facebook.com/v17.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body);
        if (!err) {
            console.log('Set up persistent menu sucessfully!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });

    res.send("Set up user persistent menu sucessfully!");
};

let handleRequestForm = (req, res) => {
    let senderID = req.params.senderID;
    let facebookAppId = process.env.facebookAppId;
    return res.render("requestForm.ejs", {
        senderID: senderID,
        facebookAppId: facebookAppId,
    });
}

let handleRequestFormData = async (req, res) => {
    try {
        // let customerName = "";
        // if (req.body.customerName === "") {
        //     customerName = "Empty";
        // } else customerName = req.body.customerName;

        // I demo response with sample text
        // you can check database for customer order's status

        let response1 = {
            "text": `---Info about your lookup order---
            \nInput text: ${req.body.text}
            `
        };

        // let response2 = templateMessage.setInfoOrderTemplate();
        //Need to refactor in the future abot send message. 

        await chatbotService.callSendAPI(req.body.psid, response1);
        // await chatbotService.sendMessage(req.body.psid, response2);

        return res.status(200).json({
            message: "ok"
        });
    } catch (e) {
        return res.status(500).json({ message: "Internal server" });
    }
}

import db from '../models/index';
const testDB = async (req, res) => {
    let data = await db.ResponseStatus.findAll();
    return res.send(data);
}

module.exports = {
    setupProfile: setupProfile,
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
    setupPersistentMenu: setupPersistentMenu,
    handleRequestForm: handleRequestForm,
    handleRequestFormData: handleRequestFormData,
    testDB: testDB,
}