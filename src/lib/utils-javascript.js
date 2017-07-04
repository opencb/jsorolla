class UtilsJavascript {
    static _getElementById(id) {
        if (id != "undefined" && id) {
            return document.getElementById(id);
        }
    }

    static _setAttribute(element, attribute, value) {
        if (element != "undefined" && element) {
            element.setAttribute(attribute, value);
        }
    }
}