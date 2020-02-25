import UtilsNew from "../utilsNew.js";


export default class PolymerUtils {

    static isNotEmptyValueById(id) {
        const value = PolymerUtils.getValue(id);
        return typeof value !== 'undefined' && value !== null && value !== '';
    }


    static getValue(id) {
        return PolymerUtils.getPropertyById(id, 'value');
    }

    static setValue(id, value) {
        return PolymerUtils.setPropertyById(id, 'value', value);
    }


    static getElementById(id) {
        return document.getElementById(id);
    }

    static getElementsByClassName(className, element) {
        if (UtilsNew.isUndefined(element)) {
            return document.getElementsByClassName(className);
        }
        // If element is a string we do first a getElementById, if it exist we execute the query
        if (typeof element === 'string') {
            const elem = PolymerUtils.getElementById(element);
            if (elem !== undefined && elem !== null) {
                return element.getElementsByClassName(className);
            }
            // The given element id does not exist
            return undefined;
        }
        // Element exists and it is not a string, it must be a object
        return element.getElementsByClassName(className);
    }

    static querySelector(selectors, element) {
        if (UtilsNew.isUndefinedOrNull(element)) {
            return document.querySelector(selectors);
        }
        // If element is a string we do first a getElementById, if it exist we execute the query
        if (typeof element === 'string') {
            const elem = PolymerUtils.getElementById(element);
            if (elem !== undefined && elem !== null) {
                return elem.querySelector(selectors);
            }
            // The given element id does not exist
            return undefined;
        }
        // Element exists and it is not a string, it must be a object
        return element.querySelector(selectors);
    }

    static querySelectorAll(selectors, element) {
        if (UtilsNew.isUndefinedOrNull(element)) {
            return document.querySelectorAll(selectors);
        }
        // If element is a string we do first a getElementById, if it exist we execute the query
        if (typeof element === 'string') {
            const elem = PolymerUtils.getElementById(element);
            if (elem !== undefined && elem !== null) {
                return elem.querySelectorAll(selectors);
            }
            // The given element id does not exist
            return undefined;
        }
        // Element exists and it is not a string, it must be a object
        return element.querySelectorAll(selectors);
    }

    static getTextOptionSelected(id) {
        if (UtilsNew.isNotUndefinedOrNull(id)) {
            const sel = PolymerUtils.getElementById(id);
            if (UtilsNew.isNotUndefinedOrNull(sel)) {
                return sel.options[sel.selectedIndex].text;
            }
            return undefined;
        }
    }


    static show(id, type = 'block') {
        PolymerUtils.addStyle(id, 'display', type);
    }

    static showByClass(className, type = 'block') {
        PolymerUtils.addStyleByClass(className, 'display', type);
    }

    static hide(id) {
        PolymerUtils.addStyle(id, 'display', 'none');
    }

    static hideByClass(className) {
        PolymerUtils.addStyleByClass(className, 'display', 'none');
    }

    static addClassById(id, className) {
        if (UtilsNew.isNotUndefinedOrNull(id)) {
            return this.addClass(PolymerUtils.getElementById(id), className);
        }
    }

    static addClassByQuerySelector(id, className) {
        if (UtilsNew.isNotUndefinedOrNull(id)) {
            return this.addClass(PolymerUtils.querySelectorAll(id), className);
        }
    }

    static addClass(id, className) {
        if (UtilsNew.isNotUndefinedOrNull(id)) {
            let el;
            if (typeof id === "object") {
                el = id;
            } else {
                if (id.startsWith('.')) {
                    // If starts with a dot then is a class, we use querySelector
                    el = PolymerUtils.querySelector(id);
                } else {
                    // It is an ID
                    el = PolymerUtils.getElementById(id);
                }
            }
            if (Array.isArray(className)) {
                if (!UtilsNew.isUndefinedOrNull(el)) {
                    className.forEach((item) => {
                        el.classList.add(item);
                    });
                }
            } else {
                if (el.length > 1) {
                    el.forEach((item) => {
                        item.classList.add(className);
                    });
                } else {
                    el.classList.add(className);
                }
            }
        }
    }

    static removeClass(id, className) {
        if (UtilsNew.isNotUndefinedOrNull(id)) {
            let el;
            if (id.startsWith('.')) {
                // If starts with a dot then is a class, we use querySelector
                el = PolymerUtils.querySelectorAll(id);
            } else {
                // It is an ID
                el = PolymerUtils.getElementById(id);
            }

            if (Array.isArray(className)) {
                if (UtilsNew.isNotUndefinedOrNull(el)) {
                    className.forEach((item) => {
                        el.classList.remove(item);
                    });
                }
            } else if (UtilsNew.isNotUndefinedOrNull(el.length) && el.length > 1) {
                el.forEach((element) => {
                    element.classList.remove(className);
                });
            } else {
                el.classList.remove(className);
            }
        }
    }

    static toggleClass(id, className) {
        if (UtilsNew.isNotUndefinedOrNull(id)) {
            let el;
            if (id.startsWith('.')) {
                // If starts with a dot then is a class, we use querySelector
                el = PolymerUtils.querySelectorAll(id);
            } else {
                // It is an ID
                el = PolymerUtils.getElementById(id);
            }

            if (Array.isArray(className)) {
                if (UtilsNew.isNotUndefinedOrNull(el)) {
                    className.forEach((item) => {
                        el.classList.toggle(item);
                    });
                }
            } else if (UtilsNew.isNotUndefinedOrNull(el.length) && el.length > 1) {
                el.forEach((element) => {
                    element.classList.toggle(className);
                });
            } else {
                el.classList.toggle(className);
            }
        }
    }


    static removeElement(id) {
        if (UtilsNew.isNotUndefinedOrNull(id)) {
            const el = this.getElementById(id);
            if (UtilsNew.isNotUndefinedOrNull(el)) {
                el.parentNode.removeChild(el);
            }
        }
    }

    static addStyle(id, key, value) {
        if (UtilsNew.isNotUndefinedOrNull(id)) {
            const el = PolymerUtils.getElementById(id);
            if (UtilsNew.isNotUndefinedOrNull(el)) {
                el.style[key] = value;
            }
        }
    }


    static addStyleByClass(className, key, value) {
        if (UtilsNew.isNotUndefinedOrNull(className)) {
            const els = PolymerUtils.getElementsByClassName(className);
            if (UtilsNew.isNotUndefinedOrNull(els)) {
                Array.from(els).forEach((element) => {
                    element.style[key] = value;
                });
            }
        }
    }

    static removeStyle(id, key) {
        if (!UtilsNew.isUndefinedOrNull(id)) {
            const el = PolymerUtils.getElementById(id);
            if (!UtilsNew.isUndefinedOrNull(el)) {
                delete el.style[key];
            }
        }
    }

    static removeStyleByClass(className, key) {
        if (UtilsNew.isNotUndefinedOrNull(className)) {
            const els = PolymerUtils.getElementsByClassName(className);
            if (UtilsNew.isNotUndefinedOrNull(els)) {
                Array.from(els).forEach((element) => {
                    delete element.style[key];
                });
            }
        }
    }

    static setAttribute(id, key, value) {
        if (UtilsNew.isNotUndefinedOrNull(key)) {
            const el = PolymerUtils.getElementById(id);
            if (UtilsNew.isNotUndefinedOrNull(el)) {
                el.setAttribute(key, value);
            }
        }
    }

    static removeAttribute(id, key) {
        if (UtilsNew.isNotUndefinedOrNull(key)) {
            const el = PolymerUtils.getElementById(id);
            if (UtilsNew.isNotUndefinedOrNull(el)) {
                el.removeAttribute(key);
            }
        }
    }

    static removeAttributebyclass(className, key) {
        const els = PolymerUtils.getElementsByClassName(className);

        if (UtilsNew.isNotUndefinedOrNull(key)) {
            if (UtilsNew.isNotUndefinedOrNull(els)) {
                Array.from(els).forEach((element) => {
                    element.removeAttribute(key);
                });
            }
        }
    }

    static innerHTML(id, text) {
        const el = PolymerUtils.getElementById(id);
        if (UtilsNew.isNotUndefinedOrNull(el)) {
            el.innerHTML = text;
        }
    }


    static innerHtmlByClass(className, text) {
        const els = PolymerUtils.getElementsByClassName(className);
        if (UtilsNew.isNotUndefinedOrNull(els)) {
            Array.from(els).forEach((element) => {
                element.innerHTML = text;
            });
        }
    }


    static setPropertyByClassName(className, key, value) {
        const els = PolymerUtils.getElementsByClassName(className);

        if (UtilsNew.isNotUndefinedOrNull(key)) {
            if (UtilsNew.isNotUndefinedOrNull(els)) {
                Array.from(els).forEach((element) => {
                    element[key] = value;
                });
            }
        }
    }

    static setPropertyById(id, key, value) {
        const element = PolymerUtils.getElementById(id);

        if (UtilsNew.isNotUndefinedOrNull(key)) {
            if (UtilsNew.isNotUndefinedOrNull(element)) {
                element[key] = value;
            }
        }
    }

    static getPropertyById(id, key) {
        const element = PolymerUtils.getElementById(id);

        if (UtilsNew.isNotUndefinedOrNull(key)) {
            if (UtilsNew.isNotUndefinedOrNull(element)) {
                return element[key];
            }
        }
    }

    static setAttributeByClassName(className, key, value) {
        const els = PolymerUtils.getElementsByClassName(className);

        if (UtilsNew.isNotUndefinedOrNull(key)) {
            if (UtilsNew.isNotUndefinedOrNull(els)) {
                Array.from(els).forEach((element) => {
                    element.setAttribute(key, value);
                });
            }
        }
    }
}
