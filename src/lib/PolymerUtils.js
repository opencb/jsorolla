class PolymerUtils {
    static isUndefined(obj) {
        return typeof obj === "undefined";
    }

    static isNotUndefined(obj) {
        return typeof obj !== "undefined";
    }

    static isUndefinedOrNull(obj) {
        return PolymerUtils.isUndefined(obj) || obj === null;
    }

    static isUndefinedOrEmpty(obj) {
        return PolymerUtils.isUndefined(obj) || obj === '';
    }


    static getElementById(id) {
        return document.getElementById(id);
    }

    static getElementsByClassName(className, root) {
        if (PolymerUtils.isUndefined(root)) {
           return  document.getElementsByClassName(className);
        } else {
            return root.getElementsByClassName(className);
        }
    }

    static querySelector(selectors, element) {
        if (PolymerUtils.isUndefinedOrNull(element)) {
            return document.querySelector(selectors);
        }else{
            return element.querySelector(selectors);
        }

    }

    static querySelectorAll(selectors, element) {
        if (PolymerUtils.isUndefinedOrNull(element)) {
            return document.querySelectorAll(selectors);
        }else{
            return element.querySelectorAll(selectors);
        }
    }


    static show(id) {
        PolymerUtils.addStyle(id, "display", "block");
    }

    static hide(id) {
        PolymerUtils.addStyle(id, "display", "none");
    }

    static addClass(id, className) {
        if (PolymerUtils.isUndefinedOrNull(id)) {
            let el;
            if (id.startsWith(".")) {
                // If starts with a dot then is a class, we use querySelector
                el = PolymerUtils.querySelector(id);
            } else {
                // It is an ID
                el = PolymerUtils.getElementById(id);
            }

            if (PolymerUtils.isUndefinedOrNull(el)) {
                el.classList.add(className);
            }
        }
    }

    static removeClass(id, className) {
        if (PolymerUtils.isUndefinedOrNull(id)) {
            let el;
            if (id.startsWith(".")) {
                // If starts with a dot then is a class, we use querySelector
                el = PolymerUtils.querySelector(id);
            } else {
                // It is an ID
                el = PolymerUtils.getElementById(id);
            }

            if (PolymerUtils.isUndefinedOrNull(el)) {
                el.classList.remove(className);
            }
        }
    }

    static addStyle(id, key, value) {
        if (PolymerUtils.isUndefinedOrNull(key)) {
            let el = this.getElementById(id);
            if (PolymerUtils.isUndefinedOrNull(el)) {
                el.style[key] = value;
            }
        }
    }

    static removeStyle(id, key) {
        let el = PolymerUtils.getElementById(id);
        if (PolymerUtils.isUndefinedOrNull(el)) {
            delete el.style[key];
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
                Array.from(els).forEach(function(element){
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
                els.forEach(function(element){
                    element.setAttribute(key, value);
                });
            }
        }
    }
}