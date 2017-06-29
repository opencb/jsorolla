
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


    static addClass(id, className) {
        let el = this.getElementById(id)
        if (PolymerUtils.isUndefinedOrNull(el)) {
            el.classList.add(className);
        }
    }

    static removeClass(id, className) {
        let el = this.getElementById(id)
        if (PolymerUtils.isUndefinedOrNull(el)) {
            el.classList.remove(className);
        }
    }

    static addStyle(id, key, value) {
        if (PolymerUtils.isUndefinedOrNull(key)) {
            let el = this.getElementById(id)
            if (PolymerUtils.isUndefinedOrNull(el)) {
                el.style[key] = value;
            }
        }
    }

    static removeStyle(id, key) {
        let el = this.getElementById(id)
        if (PolymerUtils.isUndefinedOrNull(el)) {
            delete el.style[key];
        }
    }

    static setAttribute(id, key, value) {
        if (PolymerUtils.isUndefinedOrNull(key)) {
            let el = this.getElementById(id)
            if (PolymerUtils.isUndefinedOrNull(el)) {
                el.setAttribute(key, value);
            }
        }
    }

    static removeAttribute(id, key) {
        if (PolymerUtils.isUndefinedOrNull(key)) {
            let el = this.getElementById(id)
            if (PolymerUtils.isUndefinedOrNull(el)) {
                el.removeAttribute(key);
            }
        }
    }

}