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
2. Change to sound more natural to a native Japanese speaker. 
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
        "text": "Now, tap to choose one!",
        "quick_replies": [
            {
                "content_type": "text",
                "title": "1",
                "payload": "EXPLAIN_GRAMMAR",
            }, {
                "content_type": "text",
                "title": "2",
                "payload": "REWRITE_NATURAL_TONE",
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
    //Reset responded status. 
    try {
        await db.ResponseStatus.update({
            responded: true
        }, {
            where: {
                psid: sender_psid
            }
        });
    }
    catch (error) {
        console.log(error);
    }

    await callSendAPI(sender_psid, restartNotificationResponse);
    handleGetStarted(sender_psid);
}

let handleGuideline = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Send text responese
            let welcomeGuidline = {
                "text": `\
Welcome to Love one another - Japanese writing helper! 😎     
                `
            }
            await callSendAPI(sender_psid, welcomeGuidline);

            let ruleGuideline = {
                "text": `\
I want to help you get the most out of your experience with this chatbot. Here are 2 simple rules to you need follow:

👉 Rule 1: Follow the bot's instructions:
Please only interact with the chatbot as instructed. Avoid sending free text or performing actions the bot hasn't asked for.             
👉 Rule 2: Read rule 1 once more.
                `
            }
            await callSendAPI(sender_psid, ruleGuideline);

            let restGuidline = {
                "text": `\
Every now and then, the bot takes a break. (Seriously? Even bot needs rest? 🤔). \
So, if you don't get an instant reply, don't worry! Just give it about 20-30 seconds to wake up and reply.
                `
            }
            await callSendAPI(sender_psid, restGuidline);

            let toneDefinition = {
                "text": `\
Let's dive into some of the tone definitions I had in mind while developing this bot – I believe they will be useful to share them with you. 

😊 1. Change to sound more natural to a native Japanese speaker.       
Natural tone:         
⭕ A natural Japanese sentence is grammatically correct, uses appropriate vocabulary, and follows the standard structure and conventions of the language. It effectively conveys the intended meaning in a way that sounds fluent and idiomatic to native speakers.         
For example:         
おいしい寿司を食べたいです。 (Oishii sushi o tabetai desu.) - "I want to eat delicious sushi."             
❌ Unnatural tone: 
An unnatural Japanese sentence contains grammatical errors, uses inappropriate vocabulary, or deviates significantly from standard language structure. It might sound awkward, confusing, or difficult to understand for native Japanese speakers.
For example:
こんにちは、食べたですか？ (Konnichiwa, tabeta desu ka?) - This sentence mixes up the verb and particle, making it sound strange. A natural version could be こんにちは、もう食べましたか？ (Konnichiwa, mou tabemashita ka?) - "Hello, have you already eaten?"

👨‍👨‍👦‍👦 2. Change to a casual tone.
This tone is informal and relaxed, often used among friends and in informal situations.
For example: 
今日、花火見に行く？ (Kyou, hanabi mi ni iku?) - "Wanna go watch the fireworks today?”

👨‍🏫 3. Change to a polite tone.
This tone is polite and respectful, used in formal situations or when addressing someone you're not very familiar with.
For example: 
申し訳ありませんが、英語で話せますか？ (Moushiwake arimasen ga, Eigo de hanasemasu ka?) - "I'm sorry, but do you speak English?”

👑4. Change to a super polite tone.
This tone is even more formal and respectful, used when addressing someone of higher status or in very formal situations.
For example: 
お忙しい中、お時間をいただきまして誠にありがとうございますした。 (Oisogashii naka, o-jikan o itadakimashite makoto ni arigatou gozaimasu.) - "I sincerely appreciate your time amidst your busy schedule.”            
                `
            }
            await callSendAPI(sender_psid, toneDefinition);

            let thatAll = {
                "text": `That's all! 😄 `
            }
            await callSendAPI(sender_psid, thatAll);

            let endAndLoveMessages = {
                "text": `\
どうぞ、Chatbotを楽しんで使ってくださいね。🤗
愛していますよ。🥰
                `
            }
            await callSendAPI(sender_psid, endAndLoveMessages);
            await sendComeBackMainOption(sender_psid);
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

    switch (payload) {
        case "EXPLAIN_GRAMMAR":
            noficationResponse = {
                "text": `You requested to explain a Japanese grammar!\n` +
                    `Now! Send me the grammar that you would like me to explain.\n ` +
                    `For examle:\nThe Possessive Particle【の】,The Contextual Particle【で】, Past tense【Vた】,... `
            };
            break;
        case "REWRITE_CORRECT_GRAMMAR":
            noficationResponse = {
                "text": `You requested to rewrite paragraph with correct grammar!\n` +
                    `Now! Send me the paragraph that you would like me to correct. `
            };
            break;
        case "REWRITE_NATURAL_TONE":
            noficationResponse = {
                "text": `You requested to rewrite paragraph with a more natural tone to a Japanese speaker!\n` +
                    `Now! Send me the paragraph that you would like me to change. `
            };
            break;
        case "CHANGE_TO_CASUAL":
            noficationResponse = {
                "text": `You requested to change the paragraph's tone to casual!\n` +
                    `Now! Send me the paragraph that you would like me to change.  `
            };
            break;
        case "CHANGE_TO_POLITE":
            noficationResponse = {
                "text": `You requested to change the paragraph's tone to polite!\n` +
                    `Now! Send me the paragraph that you would like me to change.  `
            };
            break;
        case "CHANGE_TO_SUPER_POLITE":
            noficationResponse = {
                "text": `You requested to change the paragraph's tone to super polite!\n` +
                    `Now! Send me the paragraph that you would like me to change.  `
            };
            break;
        default:
            handleOthers(sender_psid, payload);
    }

    await callSendAPI(sender_psid, noficationResponse);
    //Will wait for user's text message and handle text messages.
    //And process in the next function 
};

const sendComeBackMainOption = async (sender_psid) => {
    let response = {
        "text": "Tap 'Main options' to return to the main options and keep using the bot!",
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
                "text": `Currently bot can not handle freetext like ${freeText}.Please restart bot or tap come back to main options to continue.`
            }
            await callSendAPI(sender_psid, response);
            sendComeBackMainOption(sender_psid);
        }
        else {
            //Call openAI api here to solve. 
            let payload = responseStatus.payload;
            let requestToOpenAI;
            let responseNotification;
            switch (payload) {
                case "EXPLAIN_GRAMMAR":
                    await markSeen(sender_psid);
                    await sendTypingOn(sender_psid);
                    requestToOpenAI = await openaiAPIService.handleExplainGrammar(freeText);
                    let grammarMeaning = requestToOpenAI["Meaning"];
                    let useCases = requestToOpenAI["Usecases"];
                    let meaningResponseNotification = {
                        "text": `Thank you for your request. Here is the meaning of ${freeText}:`
                    };
                    await callSendAPI(sender_psid, meaningResponseNotification);
                    let meaningResponse = {
                        "text": grammarMeaning
                    }
                    await callSendAPI(sender_psid, meaningResponse);
                    let forExampleText = {
                        "text": "For example"
                    }
                    await callSendAPI(sender_psid, forExampleText);
                    for (const example of useCases) {
                        let exampleReponse = {
                            "text": example
                        };
                        await callSendAPI(sender_psid, exampleReponse);
                    }

                    break;
                case "REWRITE_CORRECT_GRAMMAR":
                    await markSeen(sender_psid);
                    await sendTypingOn(sender_psid);
                    let responseFromOpenAI = await openaiAPIService.handleRewriteCorrectGrammar(freeText);
                    if (responseFromOpenAI === "NO_GRAMMATICAL_MISTAKES_FOUND") {
                        requestToOpenAI = {
                            "text": "Your Japanese writing is impeccable. I couldn't find any grammatical errors or misspellings."
                        }
                        await callSendAPI(sender_psid, requestToOpenAI);
                        break;
                    }
                    else {
                        requestToOpenAI = {
                            "text": responseFromOpenAI
                        }
                    }

                    responseNotification = {
                        "text": "Here is the text with correct grammar"
                    }

                    //Send notification message
                    await callSendAPI(sender_psid, responseNotification);
                    await callSendAPI(sender_psid, requestToOpenAI);
                    break;
                case "CHANGE_TO_CASUAL":
                    await markSeen(sender_psid);
                    await sendTypingOn(sender_psid);
                    requestToOpenAI = {
                        "text": await openaiAPIService.handleChangeToCasual(freeText)
                    }
                    responseNotification = {
                        "text": "Here is the text after being changed to casual tone"
                    }
                    //Send notification message
                    await callSendAPI(sender_psid, responseNotification);
                    //Send results
                    await callSendAPI(sender_psid, requestToOpenAI);
                    break;

                case "REWRITE_NATURAL_TONE":
                    await markSeen(sender_psid);
                    await sendTypingOn(sender_psid);
                    requestToOpenAI = {
                        "text": await openaiAPIService.handleChangeToNatural(freeText)
                    }
                    responseNotification = {
                        "text": "Here is the text after being changed to natural tone"
                    }
                    //Send notification message
                    await callSendAPI(sender_psid, responseNotification);
                    //Send results
                    await callSendAPI(sender_psid, requestToOpenAI);
                    break;

                case "CHANGE_TO_POLITE":
                    await markSeen(sender_psid);
                    await sendTypingOn(sender_psid);
                    requestToOpenAI = {
                        "text": await openaiAPIService.handleChangeToPolite(freeText)
                    }
                    responseNotification = {
                        "text": "Here is the text after being changed to polite tone"
                    }
                    //Send notification message
                    await callSendAPI(sender_psid, responseNotification);
                    await callSendAPI(sender_psid, requestToOpenAI);
                    break;
                case "CHANGE_TO_SUPER_POLITE":
                    await markSeen(sender_psid);
                    await sendTypingOn(sender_psid);
                    requestToOpenAI = {
                        "text": await openaiAPIService.handleChangeToSuperPolite(freeText)
                    }
                    responseNotification = {
                        "text": "Here is the text after being changed to super polite tone"
                    }
                    //Send notification message
                    await callSendAPI(sender_psid, responseNotification);
                    await callSendAPI(sender_psid, requestToOpenAI);
                    break;
                default:
                //Will be implemented later. 
            }

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