
class PolymerUtils {

    static isUndefined(obj) {
        return typeof obj === "undefined";
    }

    static isNotUndefined(obj) {
        return typeof obj !== "undefined";
    }

    static isUndefinedOrNull(obj) {
        return typeof obj === "undefined" || obj === null;
    }


    static getElementById(id) {
        return document.getElementById(id);
    }

    static getElementsByClassName(className, root) {
        if (PolymerUtils.isUndefined(root)) {
            document.getElementsByClassName(className);
        } else {
            root.getElementsByClassName(className);
        }
    }

    static querySelector(selectors) {
        return document.querySelector(selectors);
    }

    static querySelectorAll(selectors) {
        return document.querySelectorAll(selectors);
    }


    static show(id) {
        PolymerUtils.addStyle(id, display, "inline");
    }

    static hide(id) {
        PolymerUtils.addStyle(id, display, "none");
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
        if (PolymerUtils.isUndefinedOrNull(key)) {
            let el = PolymerUtils.getElementById(id);
            if (PolymerUtils.isUndefinedOrNull(el)) {
                el.setAttribute(key, value);
            }
        }
    }

    static removeAttribute(id, key) {
        if (PolymerUtils.isUndefinedOrNull(key)) {
            let el = PolymerUtils.getElementById(id);
            if (PolymerUtils.isUndefinedOrNull(el)) {
                el.removeAttribute(key);
            }
        }
    }

}