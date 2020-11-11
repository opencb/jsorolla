import {NotificationQueue} from "./webcomponents/Notification.js";

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
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < _length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // safe check if the field is an object (NOTE null is an object, the constructor check is not enough)
    static isObject(o) {
        return o != null && o.constructor.name === "Object";
    }

    static getDiskUsage(bytes, numDecimals) {
        if (bytes === 0) {
            return "0 Byte";
        }
        const k = 1000;
        const dm = numDecimals ? numDecimals : 2;
        const sizes = [" Bytes", " KB", " MB", " GB", " TB", " PB", " EB", " ZB", " YB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
    }

    static getDatetime(timestamp) {
        function pad2(n) { // always returns a string
            return (n < 10 ? "0" : "") + n;
        }
        const date = timestamp ? new Date(timestamp) : new Date();
        return date.getFullYear() +
            pad2(date.getMonth() + 1) +
            pad2(date.getDate()) +
            pad2(date.getHours()) +
            pad2(date.getMinutes()) +
            pad2(date.getSeconds());
    }

    static initTooltip(scope) {
        $("a[tooltip-title]", scope).each(function () {
            $(this).qtip({
                content: {
                    title: $(this).attr("tooltip-title"),
                    text: $(this).attr("tooltip-text")
                },
                // jQuery UI Position plugin
                position: {
                    target: "mouse",
                    adjust: {x: 2, y: 2, mouse: false},
                    my: $(this).attr("tooltip-position-my") ?? "top left",
                    at: $(this).attr("tooltip-position-at") ?? "bottom right"},
                style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow"},
                show: {delay: 200},
                hide: {fixed: true, delay: 300}
            });
        });
    }

    static dateFormatter(date, format) {
        const _format = format ? format : "D MMM YYYY";
        return moment(date, "YYYYMMDDHHmmss").format(_format);
    }

    static arrayDimension(array) {
        const shape = (array, i) => Array.isArray(array) ? shape(array[0], i+1) : i;
        return shape(array, 0);
    }

    static renderHTML(html) {
        return document.createRange().createContextualFragment(`${html}`);
    }

    static jobStatusFormatter(status) {
        switch (status) {
            case "PENDING":
            case "QUEUED":
            case "REGISTERING":
            case "UNREGISTERED":
                return `<span class="text-primary"><i class="far fa-clock"></i> ${status}</span>`;
            case "RUNNING":
                return `<span class="text-primary"><i class="fas fa-sync-alt anim-rotate"></i> ${status}</span>`;
            case "DONE":
                return `<span class="text-success"><i class="fas fa-check-circle"></i> ${status}</span>`;
            case "ERROR":
                return `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${status}</span>`;
            case "UNKNOWN":
                return `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${status}</span>`;
            case "ABORTED":
                return `<span class="text-warning"><i class="fas fa-ban"></i> ${status}</span>`;
            case "DELETED":
                return `<span class="text-primary"><i class="fas fa-trash-alt"></i> ${status}</span>`;
        }
        return "-";
    }


    /*
     * This function creates a table (rows and columns) a given Object or array of Objects using the fields provided.
     * Id fields is not defined or empty then it uses the Object keys. Fields can contain arrays and nested arrays.
     */
    static toTableString(objects, fields) {
        const table = [];
        if (objects) {
            // Make sure objects is an array
            if (!Array.isArray(objects)) {
                objects = [objects];
            }

            // Use Object keys as default
            if (!fields || fields.length === 0) {
                fields = Object.keys(objects[0]);
            }

            // Print headers and get the rows and columns
            table.push(fields);
            for (const object of objects) {
                const row = [];
                for (const field of fields) {
                    let value;
                    const subfields = field.split(".");
                    // Check if subfields are arrays, eg. samples.id
                    if (subfields.length > 1) {
                        // Get the last subfield which is an array
                        for (let i = 0; i < subfields.length - 1; i++) {
                            value = subfields.slice(0, i + 1).reduce((res, prop) => res?.[prop], object);
                            if (!Array.isArray(value)) {
                                break;
                            }
                        }
                        // Check if any subfield was an array
                        if (Array.isArray(value)) {
                            value = value.map(val => val[subfields[subfields.length - 1]]).join(",");
                        } else {
                            value = subfields.reduce((res, prop) => res?.[prop], object);
                        }
                    } else {
                        value = subfields.reduce((res, prop) => res?.[prop], object);
                    }
                    row.push(value);
                }
                table.push(row);
            }
        }
        return table;
    }

    /*
     * Download data in the browser.
     * data can be a string, and arrays of string or an array of arrays
     */
    static downloadData(data, filename, mimeType = "application/json") {
        // data can be a string, and arrays of string or an array of arrays
        let dataString = data;
        if (Array.isArray(data)) {
            if (Array.isArray(data[0])) {
                dataString = data.map(row => row.join("\t")).join("\n");
            } else {
                dataString = data.join("\n");
            }
        }

        // Build file and anchor link
        const blob = new Blob([dataString], {type: mimeType});
        const file = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = file;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
        }, 0);
    }

    static range(start, stop, step = 1) {
        return Array.from({length: (stop - start) / step}, (x, i) => (i + start) * step);
    }

    static ErrorStringify(error) {
        return (err => JSON.stringify(Object.getOwnPropertyNames(Object.getPrototypeOf(err)).reduce(function (accumulator, currentValue) {
            return accumulator[currentValue] = err[currentValue], accumulator;
        }, {})))(error);
    }

    static notifyError(response) {
        if (response?.getEvents?.("ERROR")?.length) {
            const errors = response.getEvents("ERROR");
            errors.forEach(error => new NotificationQueue().push(error.name, error.message, "ERROR"));
        } else if (response instanceof Error) {
            new NotificationQueue().push(response.name, response.message, "ERROR");
        } else {
            new NotificationQueue().push("Generic Error", JSON.stringify(response), "ERROR");
        }
    }

    /**
     * This function return the object sorted by the keys provided.
     * @param unordered object
     * @param keys ordered keys
     * @param addMissingKeys keys
     * @returns Ordered object
     */
    static objectKeySort(unordered, keys, addMissingKeys) {
        if (!unordered) {
            console.log("Parameter unordered is not valued: ", unordered);
            return null;
        }

        if (!keys || keys.length === 0) {
            console.log("Parameter keys is undefined or empty: ", keys);
            return unordered;
        }

        const ordered = {};
        for (const key of keys) {
            if (typeof unordered[key] !== "undefined") {
                ordered[key] = unordered[key];
            }
        }
        // We check if there is any other unordered key not present in the keys array
        if (addMissingKeys && Object.keys(unordered).length !== keys.length) {
            for (const unorderedKey of Object.keys(unordered)) {
                if (!keys.includes(unorderedKey)) {
                    ordered[unorderedKey] = unordered[unorderedKey];
                }
            }
        }
        return ordered;
    }

    static substring(string, maxLength) {
        if (typeof maxLength === "undefined") {
            return string;
        }

        if (string && string.length > maxLength) {
            return string.substring(0, maxLength) + "...";
        }
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }

}
