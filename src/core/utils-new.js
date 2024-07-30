/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import browser from "@babel/plugin-transform-runtime/src/get-runtime-path/browser";

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

    static isError(obj) {
        return obj && Object.prototype.toString.call(obj) === "[object Error]";
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
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
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

    static isEmptyFields(obj, fields) {
        if (fields) {
            return !fields.every(field => this.isNotEmpty(obj[field]));
        }
        return false;
    }

    static isEmptyAllIds(obj, config) {
        // Evaluate with fields has display visible.. it's for dynamic forms
        // const getConfigVisible = this._config.sections?.filter(section =>
        //     FormUtils.getBooleanValue(data, section?.display?.visible));

        if (this.isNotEmpty(obj) && this.isNotEmptyArray(config)) {
            const fields = config.map(section => section.elements
                .filter(elm => elm?.field?.includes("id")))?.flat();

            return !fields.every(item => item.field.includes(".") ? this.isNotEmpty(obj[item.field.split(".")[0]]) : this.isNotEmpty(obj[item.field]));
        }

        return false;
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

    static hasProp(obj, prop) {
        if (UtilsNew.isEmpty(obj)) {
            return false;
        }
        return prop in obj;
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

    static filterKeys(obj, keys) {
        return Object.fromEntries(keys.map(key => [key, obj[key]]));
    }

    static removeArrayByIndex(arr, index) {
        return arr.filter((val, i) => i !== index);
    }

    static removeDuplicates(array, prop) {
        const newArray = [];
        const lookupObject = {};

        for (const i in array) {
            if (Object.prototype.hasOwnProperty.call(array, i)) {
                lookupObject[array[i][prop]] = array[i];
            }
        }

        for (const i in lookupObject) {
            if (Object.prototype.hasOwnProperty.call(lookupObject, i)) {
                newArray.push(lookupObject[i]);
            }
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

    // example: getObjectValue(sample,"processing.product.id","")
    static getObjectValue(obj, props, defaultValue) {
        return props.split(".").reduce((o, p) => o?.[p] ?? defaultValue, obj);
    }

    // example: setObjectValue(sample,'processing.product.id',value)
    static setObjectValue(obj, props, value) {
        props.split(".").reduce((o, p, i) => o[p] = props.split(".").length === ++i ? value : o[p] || {}, obj);
    }

    // 1st approach remove value (recursive way)
    static deleteObjectValue(obj, props) {
        const [head, ...params] = props.split(".");
        if (!params.length) {
            delete obj[head];
        } else {
            UtilsNew.deleteObjectValue(obj[head], params.join("."));
        }
    }

    static draggableModal(self, modalElm) {
        let offset = [0, 0];
        let isDown = false;
        const modalDialog = modalElm.querySelector(".modal-dialog");
        const modalHeader = modalElm.querySelector(".modal-header");
        modalHeader.style.cursor = "move";

        if (modalDialog) {
            modalDialog.style.margin = "0";
            modalDialog.style.left = (window.innerWidth * 0.30) + "px";
            modalDialog.style.top = (window.innerHeight * 0.05) + "px";
        }
        modalHeader.addEventListener("mousedown", e => {
            isDown = true;
            offset = [
                modalDialog.offsetLeft - e.clientX,
                modalDialog.offsetTop - e.clientY
            ];
        }, true);

        modalHeader.addEventListener("mouseup", () => {
            isDown = false;
        }, true);

        modalHeader.addEventListener("mousemove", e => {
            e.preventDefault();
            if (isDown) {
                modalDialog.style.left = (e.clientX + offset[0]) + "px";
                modalDialog.style.top = (e.clientY + offset[1]) + "px";
            }
        }, true);
    }

    // 2nd approach remove value (loop way)
    static deleteObjectValue2(obj, props) {
        const parts = props.split(".");
        const last = parts.pop();
        for (const part of parts) {
            obj = obj[part];
            if (!obj) {
                return;
            }
        }
        delete obj[last];
    }

    static getDiskUsage(bytes, numDecimals = 2, useInternationalSystem = false) {
        if (bytes === 0) {
            return "0 Byte";
        }
        const k = useInternationalSystem ? 1000 : 1024;
        const dm = numDecimals ? numDecimals : 2;
        const sizes = [" Bytes", " KB", " MB", " GB", " TB", " PB", " EB", " ZB", " YB"];
        const sizesBinary = [" Bytes", " KiB", " MiB", " GiB", " TiB", " PiB", " EiB", " ZiB", " YiB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(dm) + (useInternationalSystem ? sizes[i] : sizesBinary[i]);
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
        $("a[tooltip-title], span[tooltip-title]", scope).each(function () {
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
                    at: $(this).attr("tooltip-position-at") ?? "bottom right"
                },
                style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow"},
                // show: {delay: 200},
                show: {
                    delay: 200,
                    event: "click mouseenter"
                },
                hide: {fixed: true, delay: 300}
            });
        });
    }

    static dateFormatter(date, format) {
        const _format = format ? format : "D MMM YYYY";
        const _date = moment(date).isValid() ? moment(date) : moment(date, "YYYYMMDDHHmmss");
        return _date.format(_format);
    }

    static arrayDimension(array) {
        const shape = (array, i) => Array.isArray(array) ? shape(array[0], i + 1) : i;
        return shape(array, 0);
    }

    static renderHTML(html) {
        return document.createRange().createContextualFragment(`${html}`);
    }

    static jobStatusFormatter(status, appendDescription = false) {
        const description = appendDescription && status.description ? `<br>${status.description}` : "";
        // FIXME remove this backward-compatibility check in next v2.3
        const statusId = status.id || status.name;
        switch (statusId) {
            case "PENDING":
            case "QUEUED":
                return `<span class="text-primary"><i class="far fa-clock"></i> ${statusId}${description}</span>`;
            case "RUNNING":
                return `<span class="text-primary"><i class="fas fa-sync-alt anim-rotate"></i> ${statusId}${description}</span>`;
            case "DONE":
                return `<span class="text-success"><i class="fas fa-check-circle"></i> ${statusId}${description}</span>`;
            case "ERROR":
                return `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${statusId}${description}</span>`;
            case "UNKNOWN":
                return `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${statusId}${description}</span>`;
            case "ABORTED":
                return `<span class="text-warning"><i class="fas fa-ban"></i> ${statusId}${description}</span>`;
            case "DELETED":
                return `<span class="text-primary"><i class="fas fa-trash-alt"></i> ${statusId}${description}</span>`;
        }
        return "-";
    }

    // Capitalizes the first letter of a string and lowercase the rest.
    static capitalize = ([first, ...rest]) => first.toUpperCase() + rest.join("").toLowerCase();

    /*
     * This function creates a table (rows and columns) a given Object or array of Objects using the fields provided.
     * Id fields is not defined or empty then it uses the Object keys. Fields can contain arrays and nested arrays.
     */
    static toTableString(objects, fields, transformFields) {
        // eslint-disable-next-line no-param-reassign
        transformFields = transformFields || {};
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
            (objects || []).forEach((object, index) => {
                const row = fields.map(field => {
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
                    // Check for custom field transform
                    if (typeof transformFields?.[field] === "function") {
                        value = transformFields[field](value, object, index);
                    }
                    return value;
                });

                table.push(row);
            });
        }
        return table;
    }

    // Download data in the browser.
    // data can be a string, and arrays of string or an array of arrays
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

    // Download the specified content as a JSON file
    static downloadJSON(data, name) {
        return UtilsNew.downloadData(JSON.stringify(data, null, "    "), name, "application/json");
    }

    static generateFileNameDownload(name, opencgaSession, type) {
        //  "disease_panel_" + this.opencgaSession.project.id + "-" + this.opencgaSession.study.id + moment().format("YYYY-MM-DD") + ".txt"
        return `${name}_${opencgaSession?.project?.id}_${opencgaSession?.study?.id}_${moment().format("YYYY-MM-DD")}.${type}`;
    }

    static range(start, stop, step = 1) {
        return Array.from({length: (stop - start) / step}, (x, i) => (i + start) * step);
    }

    static errorStringify(error) {
        return (err => JSON.stringify(Object.getOwnPropertyNames(Object.getPrototypeOf(err)).reduce(function (accumulator, currentValue) {
            return accumulator[currentValue] = err[currentValue], accumulator;
        }, {})))(error);
    }

    // Performs a clone object specified object
    static objectClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Returns a clone of an object excluding the specified list of keys
     * @param {Object} obj Original object
     * @param {Array} excludedKeys Keys to be excluded
     * @returns {any} Clone of the original object without the specified keys
     */
    static objectCloneExclude(obj, excludedKeys) {
        const clone = UtilsNew.objectClone(obj);
        // for (const key of excludedKeys) {
        //     delete clone[key];
        // }
        for (const key of excludedKeys) {
            const aKey = key.split(".");
            aKey.reduce(
                // eslint-disable-next-line no-param-reassign
                (acc, cv, i) => (i === aKey.length - 1) ? delete acc[cv]: acc[cv],
                clone
            );
        }
        return clone;
    }

    /** Given a key in an object, replaces the value with a new object
     * @param {Object} obj Original object
     * @param {String} replaceKey Key of the value to replace
     * @param {Object} newObj New value for the key
     * @returns {Object} Clone of the original object after the replacement
     */
    static objectCloneReplace(obj, replaceKey, newObj) {
        const clone = UtilsNew.objectClone(obj);
        const aKey = replaceKey.split(".");
        // Fixme, if key is undefined
        aKey.reduce(
            // eslint-disable-next-line no-param-reassign
            (acc, cv, i) => (i === aKey.length - 1) ? acc[cv] = UtilsNew.objectClone(newObj) : acc[cv],
            clone
        );
        return clone;
    }

    /**
     * Returns the object sorted by key in lexicographic order.
     * @param {Object} unordered Unordered object
     * @returns {Object} ordered Ordered object
     */
    static objectSort(unordered) {
        const keys = Object.keys(unordered).sort();
        return Object.assign({}, ...keys.map(k => ({[k]: unordered[k]})));
    }

    /**
     * Compares the objects by key and value (nested object are not supported yet)
     * @param {Object} a First object
     * @param {Object} b Second object
     * @returns {boolean} true if the objects are equals
     */
    static objectCompare(a, b) {
        if (a && b) {
            const _a = JSON.stringify(UtilsNew.objectSort(a));
            const _b = JSON.stringify(UtilsNew.objectSort(b));
            return _a === _b;
        } else {
            return false;
        }
    }

    static isObjectValuesEmpty(obj) {
        return Object.values(obj).every(val => {
            if (val !== null && (typeof val === "object" || Array.isArray(val))) {
                return UtilsNew.isObjectValuesEmpty(val);
            }
            return val === null || UtilsNew.objectCompare(val, {}) || UtilsNew.objectCompare(val, []);
        });
    }

    /**
     * Sort the array by object key or prop
     * @param {Array} arr Array
     * @param {String} prop key or prop the object to sort
     * @returns {Array} return the array sorted
     */
    static sortArrayObj(arr, prop) {
        const _arr = arr;
        if (UtilsNew.isNotEmpty(_arr)) {
            _arr.sort((a, b) =>{
                if (a[prop] < b[prop]) {
                    return -1;
                }

                if (a[prop] > b[prop]) {
                    return 1;
                }

                return 0;
            });
            return _arr;
        }
    }

    /**
     * This function return the object sorted by the keys provided.
     * @param {Object} unordered Unordered object
     * @param {Array} keys ordered keys
     * @param {boolean} addMissingKeys Flag for adding or not keys not present in the array `keys`
     * @returns {Object} ordered Ordered object
     */
    static objectKeySort(unordered, keys, addMissingKeys = false) {
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
        if (addMissingKeys === true && Object.keys(unordered).length !== keys.length) {
            for (const unorderedKey of Object.keys(unordered)) {
                if (!keys.includes(unorderedKey)) {
                    ordered[unorderedKey] = unordered[unorderedKey];
                }
            }
        }
        return ordered;
    }

    static substring(string, maxLength) {
        if (!maxLength) {
            return string;
        }

        if (string?.length > maxLength) {
            return string.substring(0, maxLength) + "...";
        } else {
            return string;
        }
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }

    static encodeObject(obj) {
        return Object.entries(obj).map(([k, v]) => {
            return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        }).join("&");
    }

    static isAppVisible(item, session) {
        switch (item?.visibility) {
            case "public":
                return true;
            case "private":
                return !!session?.token;
            case "none":
                return false;
            default:
                return false;
        }
    }

    static hasVisibleItems(aItems, session) {
        return aItems.some(item => UtilsNew.isAppVisible(item, session));
    }

    static getVisibleItems(aItems, session) {
        return aItems.filter(subItem => UtilsNew.isAppVisible(subItem, session));
    }

    static sort(stringArray) {
        if (stringArray.length > 0) {
            return stringArray.sort((a, b) => {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            });
        }
        return stringArray;
    }

    // split comma with any characters or space
    // [^,]+/g
    // split comma without any characters or space
    // (?:(?!,\S).)+
    static splitByCommas(value) {
        if (!value) {
            return [];
        }
        return value.match(/[^,]+/g);
    }

    static splitByRegex(value, regex) {
        if (!value) {
            return [];
        }
        return value.match(regex);
    }

    // Escape HTML characters from the provided string
    static escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Import file from the specified URL
    // NOTE: in case that the file does not exist, a `null` value will be returned instead of rejecting the promise
    static importFile(url) {
        return window.fetch(url)
            .then(response => response.ok && response.text() || null)
            .catch(() => null);
    }

    // Import a JSON file from the specified url
    static importJSONFile(url) {
        return UtilsNew.importFile(url).then(content => content && JSON.parse(content) || null);
    }

    // Import file from the specified URL
    // NOTE: in case that the file does not exist, a `null` value will be returned instead of rejecting the promise
    static importBinaryFile(url) {
        return window.fetch(url)
            .then(response => response.ok && response.arrayBuffer() || null)
            .catch(() => null);
    }

    // Convert an SVG to PNG
    static convertSvgToPng(svgElement) {
        return new Promise((resolve, reject) => {
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement("canvas");
            canvas.width = svgElement.getAttribute("width");
            canvas.height = svgElement.getAttribute("height");
            const ctx = canvas.getContext("2d");
            const img = document.createElement("img");

            img.setAttribute("src", `data:image/svg+xml;base64,${window.btoa(svgString)}`);
            img.addEventListener("load", () => {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            });
            img.addEventListener("error", e => reject(e));
        });
    }

    // This function returns a positive number when version 2 is bigger
    static compareVersions(version1, version2) {
        // Get the three numbers and remove any version tag
        const [major1, minor1, patch1] = version1.split("-")[0].replace("v", "").split(".");
        const [major2, minor2, patch2] = version2.split("-")[0].replace("v", "").split(".");

        const versionNumber1 = Number.parseInt(major1) * 1000 + Number.parseInt(minor1) * 100 + (Number.parseInt(patch1) || 0);
        const versionNumber2 = Number.parseInt(major2) * 1000 + Number.parseInt(minor2) * 100 + (Number.parseInt(patch2) || 0);
        return versionNumber2 - versionNumber1;
    }

    // It always returns an array
    static getObjectValues(obj, props, defaultValue, results) {
        if (!results) {
            // eslint-disable-next-line no-param-reassign
            results = [];
        }
        const fields = props.split(".");
        if (fields.length === 1) {
            if (obj?.[fields[0]] || defaultValue) {
                results.push(obj?.[fields[0]] ?? defaultValue);
            }
        } else {
            if (obj?.[fields[0]]) {
                if (Array.isArray(obj[fields[0]])) {
                    obj[fields[0]].map(o => this.getObjectValue(o, fields.slice(1).join("."), defaultValue, results));
                } else {
                    this.getObjectValue(obj[fields[0]], fields.slice(1).join("."), defaultValue, results);
                }
            }
        }
        return results;
    }

    // Wrapper around Clipboard API for supporting non secure contexts (HTTP)
    static copyToClipboard(text) {
        return Promise.resolve().then(() => {
            if (window?.navigator?.clipboard?.writeText) {
                return window.navigator.clipboard.writeText(text);
            } else {
                const el = document.createElement("textarea");
                el.value = text;
                el.setAttribute("readonly", "");
                el.style.contain = "strict";
                el.style.position = "absolute";
                el.style.left = "-9999px";

                document.body.appendChild(el);
                el.select();
                const copied = document.execCommand("copy");
                document.body.removeChild(el);

                return copied;
            }
        });
    }

    static commaSeparatedArray(strOrArray) {
        return Array.isArray(strOrArray) ?
            strOrArray :
            (strOrArray || "")
                .split(",")
                .map(item => item.trim())
                .filter(item => !!item);
    }

}
