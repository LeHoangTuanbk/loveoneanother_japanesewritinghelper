require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
import OpenAI from 'openai';
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
})

const getCompletion = async (prompt, model = "gpt-3.5-turbo", temperature = 0) => {
    let messages = [
        { "role": "system", "content": "You are a helpful assistant. You help Japanese language learners in writing." },
        { "role": "user", "content": prompt }
    ];
    try {
        let response = await openai.chat.completions.create({
            model: model,
            messages: messages,
            temperature: temperature
        })
        console.log(response)
        return response.choices[0].message.content;
    }
    catch (error) {
        console.log(error);
    }
}

const handleExplainGrammar = async (freeText) => {
    let prompt = `Explain ${freeText}in 150 words for English speakers with limited Japanese knowledge. 
    Follow the JSON format with 'Meaning' and 'Usecases', using an array for 'Usecases'. Provide JSON text only, nothing else. 
   `;
    let responseFromOpenAI = await getCompletion(prompt);
    responseFromOpenAI = JSON.parse(responseFromOpenAI);
    console.log(responseFromOpenAI["Meaning"]);
    console.log(responseFromOpenAI["Usecases"]);
    return responseFromOpenAI;
}

const handleRewriteCorrectGrammar = async (freeText) => {
    let prompt = `I will give you text content delimited by {}, you will correct the spelling and grammar mistakes of this text. 
    Keep the meaning the same. Make sure the re-written content's number of words is as close to the original text's number of words as possible. Do not alter the original structure and formatting outlined in any way.
    If the original text has no spelling or grammar mistakes, respond this: "NO_GRAMMATICAL_MISTAKES_FOUND".
    Else if the original text has spelling or grammar mistakes, only correct any spelling or grammar mistakes if necessary, and do not make any unnecessary improvements.

    Now, using the concepts above, fix spelling or grammar mistakes (if any) for the following text. Only give me the output and nothing else. Respond in Japanese:
    {${freeText}}

    Your response: 
   `;
    let responseFromOpenAI = await getCompletion(prompt);
    console.log(responseFromOpenAI);
    return responseFromOpenAI;
}

const handleChangeToCasual = async (freeText) => {
    /*
    1. Casual Tone:
    - 今日、どこ行くの？ (Where are you going today?)
    - 明日、一緒に遊ぼうよ！ (Let's hang out together tomorrow!)

    */
    let prompt = `Change the Japanese text delimited by {} \ 
   into a new text with less formal and casual tone. The answer must be in Japanese. Only give me the output, nothing else.\
   Do not include any unnecessary words. 
   {${freeText}}

   Your answer:
   `;
    let responseFromOpenAI = await getCompletion(prompt);
    // let responseFromOpenAI = {
    //     "text": `Change to casual ${freeText}`
    // };
    console.log(responseFromOpenAI);
    // let responseToUser = {
    //     "text": `H`
    // }
    return responseFromOpenAI;
}

const handleChangeToPolite = async (freeText) => {
    /*
    2. Polite Tone:
    - 今日はどちらへ行かれるのですか？ (Where will you be going today?)
    - 明日、お時間がございましたら、一緒にお出かけしませんか？ (If you have time tomorrow, would you like to go out together?)

    */
    let prompt = `Change the following Japanese text delimited by {} \ 
   into a new text with polite and formal tone. The answer must be in Japanese. Only give me the output, nothing else.\
   Do not include any unnecessary words. 
   {${freeText}}

   Your answer:
   `;
    let responseFromOpenAI = await getCompletion(prompt);
    // let responseFromOpenAI = {
    //     "text": `Change to casual ${freeText}`
    // };
    console.log(responseFromOpenAI);
    // let responseToUser = {
    //     "text": `H`
    // }
    return responseFromOpenAI;
}

const handleChangeToSuperPolite = async (freeText) => {
    /*
    3. Super Polite Tone (Keigo):
    - 本日はいかがなさいますか？ (How are you today?)
    - 明日、お時間をいただけましたら、どうぞよろしくお願いいたします。 (If I may have your time tomorrow, I humbly ask for your consideration.)
    4. Humble Tone (Kenjougo):
    - すみませんが、明日、お時間をいただけましたら、どうぞよろしくお願い申し上げます。 (I apologize for the intrusion, but if I may have your time tomorrow, I humbly ask for your consideration.)
    */
    let prompt = `Change the Japanese text delimited by {} \ 
   into a new text with super polite and super formal tone. Use Keigo and Kenjougo in Japanese as much as possible.\
   The answer must be in Japanese. Only give me the output, nothing else.\
   Do not include any unnecessary words. 
   {${freeText}}

   Your answer:
   `;
    let responseFromOpenAI = await getCompletion(prompt);
    // let responseFromOpenAI = {
    //     "text": `Change to casual ${freeText}`
    // };
    console.log(responseFromOpenAI);
    // let responseToUser = {
    //     "text": `H`
    // }
    return responseFromOpenAI;
}
// handleChangeToPolite("今、時間ある？")
// let a = handleChangeToSuperPolite("今、時間ある？")
// console.log(a);
// let text = `昨日、東京に行きました。`;
// handleRewriteCorrectGrammar(text);
// handleExplainGrammar("the Japanese possessive particle 【の】");
module.exports = {
    handleExplainGrammar: handleExplainGrammar,
    handleRewriteCorrectGrammar: handleRewriteCorrectGrammar,
    handleChangeToCasual: handleChangeToCasual,
    handleChangeToPolite: handleChangeToPolite,
    handleChangeToSuperPolite: handleChangeToSuperPolite
}

