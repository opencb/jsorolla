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

    static isNotUndefinedOrEmptyArray(obj) {
        return typeof obj !== "undefined" && obj !== null && obj.length > 0;
    }

    static isEmpty(str) {
        return typeof str === "undefined" || str === null || str === "";
    }

    static isNotEmpty(str) {
        return typeof str !== "undefined" && str !== null && str !== "";
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

    static getElementsByClassName(className, root) {
        if (PolymerUtils.isUndefined(root)) {
            return document.getElementsByClassName(className);
        } else {
            return root.getElementsByClassName(className);
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
                    // the given element id does not exist
                    return undefined;
                }
            } else {
                // element exists and it is not a string, it must be a object
                return element.querySelector(selectors);
            }
        }
    }

    static querySelectorAll(selectors, element) {
        if (PolymerUtils.isUndefinedOrNull(element)) {
            return document.querySelectorAll(selectors);
        }  else {
            // If element is a string we do first a getElementById, if it exist we execute the query
            if (typeof element === "string") {
                let elem = PolymerUtils.getElementById(element);
                if (elem !== undefined) {
                    return elem.querySelectorAll(selectors);
                } else {
                    // the given element id does not exist
                    return undefined;
                }
            } else {
                // element exists and it is not a string, it must be a object
                return element.querySelectorAll(selectors);
            }
        }
    }

    static getTextOptionSelected(id) {
        if (PolymerUtils.isNotUndefinedOrNull(id)) {
            var sel = PolymerUtils.getElementById(id);
            if (PolymerUtils.isNotUndefinedOrNull(sel)) {
                var text = sel.options[sel.selectedIndex].text;
                return text;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }


    static show(id, type) {
        if (PolymerUtils.isNotUndefinedOrNull(type)) {
            PolymerUtils.addStyle(id, "display", type);
        } else {
            PolymerUtils.addStyle(id, "display", "block");
        }
    }

    static showByClass(className, type) {
        if (PolymerUtils.isNotUndefinedOrNull(type)) {
            PolymerUtils.addStyleByClass(className, "display", type);
        } else {
            PolymerUtils.addStyleByClass(className, "display", "block");

        }
    }

    static hide(id) {
        PolymerUtils.addStyle(id, "display", "none");
    }

    static hideByClass(className) {
        PolymerUtils.addStyleByClass(className, "display", "none");
    }

    static addClass(id, className) {
        if (!PolymerUtils.isUndefinedOrNull(id)) {
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
        if (!PolymerUtils.isUndefinedOrNull(id)) {
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
                        el.classList.remove(item);
                    });
                }
            } else {
                el.classList.remove(className);
            }
        }
    }

    static removeElement(id) {
        if (!PolymerUtils.isUndefinedOrNull(id)) {
            let el = this.getElementById(id);
            if (!PolymerUtils.isUndefinedOrNull(el)) {
                el.parentNode.removeChild(el);
            }
        }
    }

    static addStyle(id, key, value) {
        if (!PolymerUtils.isUndefinedOrNull(id)) {
            let el = this.getElementById(id);
            if (!PolymerUtils.isUndefinedOrNull(el)) {
                el.style[key] = value;
            }
        }
    }


    static addStyleByClass(className, key, value) {
        if (!PolymerUtils.isUndefinedOrNull(className)) {
            let els = this.getElementsByClassName(className);
            if (!PolymerUtils.isUndefinedOrNull(els)) {
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
        if (!PolymerUtils.isUndefinedOrNull(key)) {
            let el = PolymerUtils.getElementById(id);
            if (!PolymerUtils.isUndefinedOrNull(el)) {
                el.setAttribute(key, value);
            }
        }
    }

    static removeAttribute(id, key) {
        if (!PolymerUtils.isUndefinedOrNull(key)) {
            let el = PolymerUtils.getElementById(id);
            if (!PolymerUtils.isUndefinedOrNull(el)) {
                el.removeAttribute(key);
            }
        }
    }

    static removeAttributebyclass(className, key) {
        let els = PolymerUtils.getElementsByClassName(className);

        if (!PolymerUtils.isUndefinedOrNull(key)) {
            if (!PolymerUtils.isUndefinedOrNull(els)) {
                Array.from(els).forEach(function (element) {
                    element.removeAttribute(key);
                });
            }
        }
    }

    static innerHTML(id, text) {
        let el = PolymerUtils.getElementById(id);
        if (!PolymerUtils.isUndefinedOrNull(el)) {
            el.innerHTML = text;
        }

    }


    static setPropertyByClassName(className, key, value) {
        let els = PolymerUtils.getElementsByClassName(className);

        if (!PolymerUtils.isUndefinedOrNull(key)) {
            if (!PolymerUtils.isUndefinedOrNull(els)) {
                Array.from(els).forEach(function (element) {
                    element[key] = value;
                });
            }
        }
    }

    static setPropertyById(id, key, value) {
        let element = PolymerUtils.getElementById(id);

        if (!PolymerUtils.isUndefinedOrNull(key)) {
            if (!PolymerUtils.isUndefinedOrNull(element)) {
                element[key] = value;
            }
        }
    }

    static getPropertyById(id, key) {
        let element = PolymerUtils.getElementById(id);

        if (!PolymerUtils.isUndefinedOrNull(key)) {
            if (!PolymerUtils.isUndefinedOrNull(element)) {
                return element[key];
            }
        }
    }

    static setAttributeByClassName(className, key, value) {
        let els = PolymerUtils.getElementsByClassName(className);

        if (!PolymerUtils.isUndefinedOrNull(key)) {
            if (!PolymerUtils.isUndefinedOrNull(els)) {
                Array.from(els).forEach(function (element) {
                    element.setAttribute(key, value);
                });
            }
        }
    }
}