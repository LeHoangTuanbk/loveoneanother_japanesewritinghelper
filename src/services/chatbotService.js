import request from "request";
require('dotenv').config();
import db from '../models/index';
import openaiAPIService from "./openaiAPIService";

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

let sendHelloResponse = async (sender_psid) => {
    let helloResponse = { "text": "Hello! What can I assist you with today?" };
    await callSendAPI(sender_psid, helloResponse);
}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Send hello message
            await sendHelloResponse(sender_psid);
            //Send options
            await sendMainOptions(sender_psid);
            //Send resolve
            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
};

let sendMainOptions = async (sender_psid) => {
    let options = {
        "text":
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
}

let sendGetStartedQuickReplyTemplate = async (sender_psid) => {
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
    await callSendAPI(sender_psid, response);
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
                "text": "This feature will be implemented in the future!\nPlease restart the conversation to continue!"
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

const handleRequest = async (sender_psid, payload) => {
    //Set responded status in database.
    //If psid doen't exist in db, add new record
    //Otherwise, just update the payload, responded.
    let responseStatus = await db.ResponseStatus.findOne({
        where: {
            psid: sender_psid
        }
    })

    try {
        if (responseStatus === null) {
            let newResponseStatus = {
                psid: sender_psid,
                payload: payload,
                responded: false,
            }
            await db.ResponseStatus.create(newResponseStatus);
        }
        else {
            await db.ResponseStatus.update({
                payload: payload,
                responded: false,
            }, {
                where: {
                    psid: sender_psid
                }
            })
        }
    }
    catch (error) {

    }
    finally {

    }
    //Send notification
    let noficationResponse;

    switch(payload){
        case "EXPLAIN_GRAMMAR":
            noficationResponse = {
                "text": `You requested to explain a Japanese grammar!\n`+
                `Now! Send me the grammar that you would like me to explain. `
            };
            break;
        case "REWRITE_CORRECT_GRAMMAR":
            noficationResponse = {
                "text": `You requested to rewrite paragraph with correct grammar!\n` +
                `Now! Send me the paragraph that you would like me to correct. `
            };
            break;
        case "CHANGE_TO_CASUAL":
            noficationResponse = {
                "text": `You requested to change the paragraph's tone to casual!\n`+
                `Now! Send me the paragraph that you would like me to change.  `
            };
            break;
        case "CHANGE_TO_POLITE":
            noficationResponse = {
                "text": `You requested to change the paragraph's tone to polite!\n`+
                `Now! Send me the paragraph that you would like me to change.  `
            };
            break;
        case "CHANGE_TO_SUPER_POLITE":
            noficationResponse = {
                "text": `You requested to change the paragraph's tone to super polite!\n`+
                `Now! Send me the paragraph that you would like me to change.  `
            };
            break;
        default:
    }

    await callSendAPI(sender_psid, noficationResponse);
    //Will wait for user's text message and handle text messages.
    //And process in the next function 
};

const sendComeBackMainOption = async (sender_psid) => {
    let response = {
        "text": "Tap to comeback to main options!",
        "quick_replies": [
            {
                "content_type": "text",
                "title": "Main options",
                "payload": "MAIN_OPTIONS",
            }
        ]
    }
    await callSendAPI(sender_psid, response);
}

const handleFreeText = async (sender_psid, freeText) => {
    //Check responded status. If responseStatus === null, haven't register infor or responded = true
    //Not response in this case. Only send response if not responded. 
    try {
        let responseStatus = await db.ResponseStatus.findOne({
            where: {
                psid: sender_psid
            }
        })

        if (responseStatus === null || responseStatus.responded === true) {
            let response = {
                "text": `Currently bot can not handle freetext like ${freeText}.Please restart bot, and try to follow bot's instructions.`
            }
            await callSendAPI(sender_psid, response);
        }
        else {
            //Call openAI api here to solve. 
            let payload = responseStatus.payload;
            let requestResponse;
            switch (payload) {
                case "EXPLAIN_GRAMMAR":
                    requestResponse = await openaiAPIService.handleExplainGrammar(freeText);
                    break;
                case "REWRITE_CORRECT_GRAMMAR":
                    requestResponse = await openaiAPIService.handleRewriteCorrectGrammar(freeText);
                    break;
                case "CHANGE_TO_CASUAL":
                    requestResponse = await openaiAPIService.handleChangeToCasual(freeText);
                    break;
                case "CHANGE_TO_POLITE":
                    requestResponse = await openaiAPIService.handleChangeToPolite(freeText);
                    break;
                case "CHANGE_TO_SUPER_POLITE":
                    requestResponse = await openaiAPIService.handleChangeToSuperPolite(freeText);
                    break;
                default:
                    //Will be implemented later. 
            }
            
            await callSendAPI(sender_psid, requestResponse);

            await db.ResponseStatus.update({
                responded: true
            }, {
                where: {
                    psid: sender_psid
                }
            });

            //Need to send do you want to continue using
            //Lazy handling. Just give quickreply to comeback main options. 
            await sendComeBackMainOption(sender_psid);
        }
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    handleGetStarted: handleGetStarted,
    handleRestartConversation: handleRestartConversation,
    handleGuideline: handleGuideline,
    handleOthers: handleOthers,
    handleRequest: handleRequest,
    handleFreeText: handleFreeText,
    sendMainOptions: sendMainOptions
}