export default class UtilsNew {

    static get MESSAGE_SUCCESS() {
        return "success";
    }

    static get MESSAGE_ERROR() {
        return "danger";
    }

    static get MESSAGE_INFO() {
        return "info";
    }

    static get MESSAGE_WARNING() {
        return "warning";
    }

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

    static isEmpty(obj) {
        if (typeof obj === "undefined" || obj === null) {
            return true;
        }

        // obj is an actual Object
        if (typeof obj === "object") {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        } else {
            // obj is a String
            if (typeof obj === "string") {
                return obj === "";
            }
        }
    }

    static isNotEmpty(obj) {
        return !this.isEmpty(obj);
    }

    static isEmptyArray(arr) {
        return typeof arr !== "undefined" && arr !== null && arr.length === 0;
    }

    static isNotEmptyArray(arr) {
        return typeof arr !== "undefined" && arr !== null && arr.length > 0;
    }

    static defaultString(str, str2) {
        return this.isNotEmpty(str) ? str : str2;
    }

    static containsArray(arr, item) {
        if (UtilsNew.isNotEmptyArray(arr) && UtilsNew.isNotUndefinedOrNull(item)) {
            return arr.indexOf(item) > -1;
        }

        return false;
    }

    static removeDuplicates(array, prop) {
        const newArray = [];
        const lookupObject = {};

        for (const i in array) {
            lookupObject[array[i][prop]] = array[i];
        }

        for (const i in lookupObject) {
            newArray.push(lookupObject[i]);
        }
        return newArray;
    }

    static checkPermissions(project) {
        return UtilsNew.isUndefinedOrNull(project) || (UtilsNew.isNotUndefinedOrNull(project) && Object.keys(project).length === 0);
    }

    static isNotEqual(str, str2) {
        return str !== str2;
    }

    static isEqual(str, str2) {
        return str === str2;
    }

    /*  Utils refactoring in progress */

    static randomString(length) {
        let result = "";
        const _length = length || 6;
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < _length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // safe check if the field is an object (NOTE null is an object, the constructor check is not enough)
    static isObject(o) {
        return o != null && o.constructor.name === "Object";
    }

}
