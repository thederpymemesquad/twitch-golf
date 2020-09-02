class TranslatableText { // not sure why i have this class, i was going to use it, but its a lot eaiser to just use the funcitions below
    constructor(id, fallback) {
        this.id = id; // the translation id to look for
        this.fallback = fallback; // the text that the text will fallback to if it is unable to find a translation
    }

    getTranslatedText(languageData) {
        return _.get(languageData, this.id, this.fallback);
    }
}

TranslatableText.prototype.toString = function() {
    return this.fallback;
}

//function getTranslatedTextWithVariables(id, vars, fallback, langageData, fallbackLang)

function getTranslatedText(id, fallback, languageData, fallbackLang) {
    if (id == null) return fallback;
    let att1 = _.get(languageData, id, null)// == fallback ? "not found" : "translated";
    if (att1 != null) return att1;
    else {
        console.debug("Language was missing " + id + ". using fallback language");
        let att2 = _.get(fallbackLang, id, null);
        if (att2 == null) {
            console.warn("Both the primary languge and the fallback language are missing translation string for " + id);
            if (fallback == null) {console.warn("Fallback string was also not provided!"); return null}
            return fallback;
        }
        return att2;
    }
}

function translateExistingPageElements(lang, fallbacklang) {
    var elements = document.querySelectorAll("*[data-tl]");

    for (let e = 0; e < elements.length; e++) {
        //elements[e].innerHTML = getTranslatedText(elements[e].getAttribute("data-tl"), elements[e].innerHTML, lang)
        //elements[e].innerHTML = getTranslatedText(elements[e].getAttribute("data-tl"), "could not find " + elements[e].getAttribute("data-tl"), lang)
        elements[e].innerHTML = getTranslatedText(elements[e].getAttribute("data-tl"), /*"could not find " +*/ elements[e].getAttribute("data-tl"), lang, fallbacklang);
    }
}