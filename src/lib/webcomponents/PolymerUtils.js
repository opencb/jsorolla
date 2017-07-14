class PolymerUtils {

    static isUndefined(obj) {
        return typeof obj === "undefined";
    }

    static isNotUndefined(obj) {
        return typeof obj !== "undefined";
    }

    static isNull(obj) {
        return obj === null;
    }

    static isNotNull(obj) {
        return obj !== null;
    }

    static isUndefinedOrNull(obj) {
        return typeof obj === "undefined" || obj === null;
    }

    static isNotUndefinedOrNull(obj) {
        return typeof obj !== "undefined" && obj !== null;
    }


    static isEmpty(str) {
        return typeof str === "undefined" || str === null || str === "";
    }

    static isNotEmpty(str) {
        return typeof str !== "undefined" && str !== null && str !== "";
    }

    static isEmptyArray(arr) {
        return typeof arr !== "undefined" && arr !== null && arr.length === 0;
    }

    static isNotEmptyArray(arr) {
        return typeof arr !== "undefined" && arr !== null && arr.length > 0;
    }

    static isNotEmptyValueById(id) {
        let value = PolymerUtils.getValue(id);
        return typeof value !== "undefined" && value !== null && value !== "";
    }


    static getValue(id) {
        return PolymerUtils.getPropertyById(id, "value");
    }

    static setValue(id, value) {
        return PolymerUtils.setPropertyById(id, "value", value);

    }


    static getElementById(id) {
        return document.getElementById(id);
    }

    static getElementsByClassName(className, element) {
        if (PolymerUtils.isUndefined(element)) {
            return document.getElementsByClassName(className);
        } else {
            // If element is a string we do first a getElementById, if it exist we execute the query
            if (typeof element === "string") {
                let elem = PolymerUtils.getElementById(element);
                if (elem !== undefined) {
                    return element.getElementsByClassName(className);
                } else {
                    // The given element id does not exist
                    return undefined;
                }
            } else {
                // Element exists and it is not a string, it must be a object
                return element.getElementsByClassName(className);
            }
        }
    }

    static querySelector(selectors, element) {
        if (PolymerUtils.isUndefinedOrNull(element)) {
            return document.querySelector(selectors);
        } else {
            // If element is a string we do first a getElementById, if it exist we execute the query
            if (typeof element === "string") {
                let elem = PolymerUtils.getElementById(element);
                if (elem !== undefined) {
                    return elem.querySelector(selectors);
                } else {
                    // The given element id does not exist
                    return undefined;
                }
            } else {
                // Element exists and it is not a string, it must be a object
                return element.querySelector(selectors);
            }
        }
    }

    static querySelectorAll(selectors, element) {
        if (PolymerUtils.isUndefinedOrNull(element)) {
            return document.querySelectorAll(selectors);
        } else {
            // If element is a string we do first a getElementById, if it exist we execute the query
            if (typeof element === "string") {
                let elem = PolymerUtils.getElementById(element);
                if (elem !== undefined) {
                    return elem.querySelectorAll(selectors);
                } else {
                    // The given element id does not exist
                    return undefined;
                }
            } else {
                // Element exists and it is not a string, it must be a object
                return element.querySelectorAll(selectors);
            }
        }
    }

    static getTextOptionSelected(id) {
        if (PolymerUtils.isNotUndefinedOrNull(id)) {
            let sel = PolymerUtils.getElementById(id);
            if (PolymerUtils.isNotUndefinedOrNull(sel)) {
                return sel.options[sel.selectedIndex].text;
            } else {
                return undefined;
            }
        }
    }


    static show(id, type = "block") {
        PolymerUtils.addStyle(id, "display", type);
    }

    static showByClass(className, type = "block") {
        PolymerUtils.addStyleByClass(className, "display", type);
    }

    static hide(id) {
        PolymerUtils.addStyle(id, "display", "none");
    }

    static hideByClass(className) {
        PolymerUtils.addStyleByClass(className, "display", "none");
    }


    static addClass(id, className) {
        if (PolymerUtils.isNotUndefinedOrNull(id)) {
            let el;
            if (id.startsWith(".")) {
                // If starts with a dot then is a class, we use querySelector
                el = PolymerUtils.querySelector(id);
            } else {
                // It is an ID
                el = PolymerUtils.getElementById(id);
            }

            if (Array.isArray(className)) {
                if (!PolymerUtils.isUndefinedOrNull(el)) {
                    className.forEach(function (item) {
                        el.classList.add(item);
                    });
                }
            } else {
                el.classList.add(className);
            }
        }
    }

    static removeClass(id, className) {
        if (PolymerUtils.isNotUndefinedOrNull(id)) {
            let el;
            if (id.startsWith(".")) {
                // If starts with a dot then is a class, we use querySelector
                el = PolymerUtils.querySelector(id);
            } else {
                // It is an ID
                el = PolymerUtils.getElementById(id);
            }

            if (Array.isArray(className)) {
                if (PolymerUtils.isNotUndefinedOrNull(el)) {
                    className.forEach(function (item) {
                        el.classList.remove(item);
                    });
                }
            } else {
                el.classList.remove(className);
            }
        }
    }


    static removeElement(id) {
        if (PolymerUtils.isNotUndefinedOrNull(id)) {
            let el = this.getElementById(id);
            if (PolymerUtils.isNotUndefinedOrNull(el)) {
                el.parentNode.removeChild(el);
            }
        }
    }

    static addStyle(id, key, value) {
        if (PolymerUtils.isNotUndefinedOrNull(id)) {
            let el = this.getElementById(id);
            if (PolymerUtils.isNotUndefinedOrNull(el)) {
                el.style[key] = value;
            }
        }
    }


    static addStyleByClass(className, key, value) {
        if (PolymerUtils.isNotUndefinedOrNull(className)) {
            let els = this.getElementsByClassName(className);
            if (PolymerUtils.isNotUndefinedOrNull(els)) {
                Array.from(els).forEach(function (element) {
                    element.style[key] = value;
                });
            }
        }
    }

    static removeStyle(id, key) {
        if (!PolymerUtils.isUndefinedOrNull(id)) {
            let el = PolymerUtils.getElementById(id);
            if (!PolymerUtils.isUndefinedOrNull(el)) {
                delete el.style[key];
            }
        }
    }

    static setAttribute(id, key, value) {
        if (PolymerUtils.isNotUndefinedOrNull(key)) {
            let el = PolymerUtils.getElementById(id);
            if (PolymerUtils.isNotUndefinedOrNull(el)) {
                el.setAttribute(key, value);
            }
        }
    }

    static removeAttribute(id, key) {
        if (PolymerUtils.isNotUndefinedOrNull(key)) {
            let el = PolymerUtils.getElementById(id);
            if (PolymerUtils.isNotUndefinedOrNull(el)) {
                el.removeAttribute(key);
            }
        }
    }

    static removeAttributebyclass(className, key) {
        let els = PolymerUtils.getElementsByClassName(className);

        if (PolymerUtils.isNotUndefinedOrNull(key)) {
            if (PolymerUtils.isNotUndefinedOrNull(els)) {
                Array.from(els).forEach(function (element) {
                    element.removeAttribute(key);
                });
            }
        }
    }

    static innerHTML(id, text) {
        let el = PolymerUtils.getElementById(id);
        if (PolymerUtils.isNotUndefinedOrNull(el)) {
            el.innerHTML = text;
        }

    }


    static innerHtmlByClass(className, text) {
        let els = PolymerUtils.getElementsByClassName(className);
        if (PolymerUtils.isNotUndefinedOrNull(els)) {
            Array.from(els).forEach(function (element) {
                element.innerHTML = text;
            });
        }
    }


    static setPropertyByClassName(className, key, value) {
        let els = PolymerUtils.getElementsByClassName(className);

        if (PolymerUtils.isNotUndefinedOrNull(key)) {
            if (PolymerUtils.isNotUndefinedOrNull(els)) {
                Array.from(els).forEach(function (element) {
                    element[key] = value;
                });
            }
        }
    }

    static setPropertyById(id, key, value) {
        let element = PolymerUtils.getElementById(id);

        if (PolymerUtils.isNotUndefinedOrNull(key)) {
            if (PolymerUtils.isNotUndefinedOrNull(element)) {
                element[key] = value;
            }
        }
    }

    static getPropertyById(id, key) {
        let element = PolymerUtils.getElementById(id);

        if (PolymerUtils.isNotUndefinedOrNull(key)) {
            if (PolymerUtils.isNotUndefinedOrNull(element)) {
                return element[key];
            }
        }
    }

    static setAttributeByClassName(className, key, value) {
        let els = PolymerUtils.getElementsByClassName(className);

        if (PolymerUtils.isNotUndefinedOrNull(key)) {
            if (PolymerUtils.isNotUndefinedOrNull(els)) {
                Array.from(els).forEach(function (element) {
                    element.setAttribute(key, value);
                });
            }
        }
    }
}