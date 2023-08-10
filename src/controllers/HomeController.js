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
function handleMessage(sender_psid, received_message) {
    let response;

    // Checks if the message contains text
    if (received_message.text) {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        response = {
            "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
        }
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

    // Send the response message
    callSendAPI(sender_psid, response);

}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    switch (payload) {
        case "yes":
            response = { "text": "Thanks!" };
            break;
        case "no":
            response = { "text": "Oops, try sending another image." };
            break;

        case "RESTART_CONVERSATION":
            await chatbotService.handleGetStarted(sender_psid);
            response = { "text": "You requested restart conversation!"};
            break;
        case "GET_STARTED":
            await chatbotService.handleGetStarted(sender_psid);
            response = { "text": "Hello! What can I help you with today?" };
            break;

        case "GUIDELINE":
            await chatbotService.handleGuideline(sender_psid);
            break;
        default:
            response = { "text": `Oops! I don't know how to response with ${payload}. Please try another action!` };
    }

    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);

}

// Sends response messages via the Send API
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
                        "title": "Restart conversation.",
                        "payload": "RESTART_CONVERSATION"
                    },
                    {
                        "type": "web_url",
                        "title": "Report bugs",
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

module.exports = {
    setupProfile: setupProfile,
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
    setupPersistentMenu: setupPersistentMenu,
}