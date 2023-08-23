const handleExplainGrammar = (freeText) => {
    let responseFromOpenAI = {
        "text": `Explain grammar ${freeText}`
    };
    return responseFromOpenAI;
}

const handleRewriteCorrectGrammar = (freeText) => {
    let responseFromOpenAI = {
        "text": `Correct grammar ${freeText}`
    };
    return responseFromOpenAI;
}

const handleChangeToCasual = (freeText) => {
    let responseFromOpenAI = {
        "text": `Change to casual ${freeText}`
    };
    return responseFromOpenAI;
}

const handleChangeToPolite = (freeText) => {
    let responseFromOpenAI = {
        "text": `Change to polite ${freeText}`
    };
    return responseFromOpenAI;
}

const handleChangeToSuperPolite = (freeText) => {
    let responseFromOpenAI = {
        "text": `Change to super polite ${freeText}`
    };
    return responseFromOpenAI;
}

module.exports = {
    handleExplainGrammar: handleExplainGrammar,
    handleRewriteCorrectGrammar: handleRewriteCorrectGrammar,
    handleChangeToCasual: handleChangeToCasual,
    handleChangeToPolite: handleChangeToPolite,
    handleChangeToSuperPolite: handleChangeToSuperPolite
}

