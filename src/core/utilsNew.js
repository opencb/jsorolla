
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

    static getDiskUsage(bytes, numDecimals = 2) {
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
        return moment(date, "YYYYMMDDHHmmss").format(_format);
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

    // ! Deprecated function, do not use
    static notifyError(response) {
        // if (response?.getEvents?.("ERROR")?.length) {
        //     const errors = response.getEvents("ERROR");
        //     errors.forEach(error => {
        //         new NotificationQueue().push(error.name, error.message, "ERROR");
        //     });
        // } else if (response instanceof Error) {
        //     new NotificationQueue().push(response.name, response.message, "ERROR");
        // } else {
        //     new NotificationQueue().push("Generic Error", JSON.stringify(response), "ERROR");
        // }
    }

    // Performs a clone object specified object
    static objectClone(obj) {
        return JSON.parse(JSON.stringify(obj));
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
     * @returns {boolean} true if the oject are equals
     */
    static objectCompare(a, b) {
        if (a && b) {
            const _a = UtilsNew.objectSort(a);
            const _b = UtilsNew.objectSort(b);
            return JSON.stringify(_a) === JSON.stringify(_b);
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

    static encodeObject(obj) {
        return Object.entries(obj).map(([k, v]) => {
            return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        }).join("&");
    }

    /**
     * It merges external filter list with internal one. The resulting section organisation is defined in `external`.
     *
     * @param {Array} internal Sections list containing `filters` as object
     * @param {Array} external Sections list containing `filters` as list of Ids
     * @returns {Array} hydrated array
     */
    static mergeSections(internal, external) {
        // console.log("internal, external", internal, external)

        if (external) {
            // flattening the whole list of filters
            const allFilters = internal.flatMap(section => section.filters);
            const sections = external.map(section => {
                // const internalSection = internal.sections.find(s => s.id === section.id);
                // hydrates all the fields of each external section from the pool of filters.
                const filters = UtilsNew.mergeConfigById(allFilters, section.filters);
                return {...section, filters: filters};
            });
            return sections;
        }
    }

    /**
     * It merges external filter list with internal one.
     * It handles:
     *  - filters components
     *  - canned filters
     *  - detail tabs
     *
     * @param {Array} internal Filter object
     * @param {Array} external Simplified filter object
     * @returns {Object} hydrated array
     */
    static mergeFiltersAndDetails(internal, external) {
        // console.log("internal, external", internal, external);
        let sections = internal.sections;
        let examples = internal.examples;
        const detail = internal.detail;

        if (external?.menu?.sections?.length) {
            sections = UtilsNew.mergeSections(sections, external.menu.sections);
        }
        // merge canned filters
        if (external?.menu?.examples?.length) {
            examples = UtilsNew.mergeExampleFilters(internal.examples, external.menu.examples);
        }

        // merge detail tab
        // it doesn't check for external.details.length and external.hiddenDetails.length because it supports empty array
        if (detail?.items) {
            if (external?.details || external?.hiddenDetails) {
                detail.items = UtilsNew.mergeArray(internal.detail.items, external.details || external.hiddenDetails, !!external.hiddenDetails);
            }
        }
        return {...internal, sections, examples, detail};
    }

    /**
     * Filters internal array items using external array.
     * It either uses external array as list to add or remove items from the resulting array.
     *
     * @param {Array} internal list of objects with IDs.
     * @param {Array} external can be either a plain array of string or an array of object with IDs
     * @param {Boolean} subtractive set true if the external array represents the fields to hide
     * @param {Boolean} externalObject set true if the external list is a list of objects and you want to merge internal and external items together.
     * @returns {Array} resulting array
     */
    static mergeArray(internal, external, subtractive = false, externalObject = false) {

        if (external) {
            if (!subtractive) {
                const results = [];
                external.forEach(c => {
                    const field = internal.find(f => {
                        if (typeof c === "object") {
                            if (!f.id || !c.id) {
                                console.error("fields must have an id to be merged. Check internal and external configuration", f, c);
                            }
                            return f.id === c.id;
                        } else if (typeof c === "string") {
                            return f.id === c;
                        } else {
                            console.error("array format unexpected");
                        }
                    });
                    if (field) {
                        if (externalObject) {
                            results.push({...c, ...field});
                        } else {
                            results.push(field);
                        }
                    } else {
                        // console.error("Field not found", c);
                    }
                });
                return results;
            } else {

                // in case of subtractive settings we only support `external` as plain array of string IDs
                return internal.filter(f => {
                    if (!f.id) {
                        console.error("fields must have an id to be merged", f);
                    }
                    return !~external.indexOf(f.id);
                });
            }
        } else {
            return internal;
        }
    }

    /**
     * NOT used at the moment
     *
     * Hydrates `external` array of objects with `internal` one. The merge is based on id.
     * It acts like a filter for the internal object.
     * If an object with a certain Id is present in the internal array but not in the external, it won't be present in the returning array.
     * The other way around, if an object with a certain Id is present in the external array but not in the internal, it will be added only if `force` flag is true.
     * This is similar to mergeArray. The difference is the resulting items here are merged with the spread operator, the force flag and the subtractive flag.
     *
     * @param {Array} internal list of object with IDs
     * @param {Array} external list of object with IDs
     * @param {Boolean} force  force external object addition even if there is no object with the same id in `internal`
     * @returns {Array} hydrated array
     */
    static mergeConfigArray(internal, external, force = false) {
        // console.log("internal, external", internal, external)
        // it doesn't check for external.length because it supports empty array
        if (external) {
            return external.map(entry => {
                const obj = internal.find(e => entry.id === e.id);
                if (!obj) {
                    // force external entry addition
                    if (force) {
                        return entry;
                    } else {
                        console.error(`Config Merge failed. ${entry.id} not found in internal config`);
                    }
                } else {
                    return {...entry, ...obj};
                }
            });
        }
        console.warn("external config not available");
        return internal;
    }

    /**
     * Hydrates `external` array with `internal` data.
     * `external` is a plain list of IDs.
     *
     * @param {Array} internal Array of objects
     * @param {Array} external Mixed array of IDs or objects (with id property)
     * @param {Boolean} subtractive set true if the external array lists the fields to hide
     * @returns {Array} hydrated array
     */
    static mergeConfigById(internal, external, subtractive = false) {
        // it doesn't check for external.length because it supports empty array
        if (external) {
            if (!subtractive) {
                const section = external.map(o => {
                    const id = typeof o === "object" ? o.id : o; // support both string ID or object
                    const obj = internal.find(e => id === e.id);
                    if (!obj) {
                        console.warn(`Config Merge failed. '${id}' field not found in internal config`);
                        return null;
                    } else {
                        return typeof o === "object" ? {...o, ...obj} : {...obj};
                    }
                });
                return section.filter(s => !!s);
            } else {
                return internal.filter(f => {
                    return !~external.indexOf(f.id);
                });
            }
        }
        console.warn("External config not available. Using default config");
        return internal;
    }

    /**
     * Filters 1D or 2D Bootstrap Table array for columns using the fields in `external` 1D array.
     * At the moment it manages the visibility of the fields at the first level.
     * The fields at the second level are hidden iff the corresponding field at the first level is hidden.
     * At the moment it doesn't handle >2D arrays.
     * // TODO. DONE. add support to hiddenColumns list. (we use clinical-analysis-grid with no action column in individual-browser)
     *
     *
     * @param {Array} internal 1D or 2D array
     * @param {Array} external plain array of strings.
     * @param {Boolean} subtractive set true if the external array lists the fields to hide
     * @returns {Array} filtered array.
     */
    static mergeTable(internal, external, subtractive = false) {
        // single array
        if (external) {
            if (internal instanceof Array && !(internal[0] instanceof Array)) {
                const columns = [];
                if (!subtractive) {
                    external.forEach(c => {
                        const field = internal.find(f => {
                            if (!f.id) {
                                console.error("Column fields must have an id to be merged", f);
                            }
                            return f.id === c;
                        });
                        if (field) {
                            columns.push(field);
                        } else {
                            // console.error("Field not found", c);
                        }
                    });
                    return columns;
                } else {
                    return internal.filter(f => {
                        if (!f.id) {
                            console.error("Column fields must have an id to be merged", f);
                        }
                        return !~external.indexOf(f.id);
                    });
                }

            }
            // double array

            /**
             * the correct indexes for subFields are found with this simple idea:
             * in the first array, each rowspan=x means the second array has x-1 less elements, each colspan=y has y+1 elms.
             */
            if (internal[0] instanceof Array) {
                const result = [[], []];
                let subIndx = 0; // keeps track of the starting index of the elms to add
                const rowSpanCnt = 0;
                internal[0].filter(f => f?.visible !== false).forEach((c, i) => {

                    if (!c.id) {
                        console.error("Column fields must have an id to be merged", c);
                    }
                    if (!subtractive && !!~external.indexOf(c.id) || (subtractive && !~external.indexOf(c.id))) {
                        // debugger
                        result[0].push(c);
                        // rowspan = 1
                        if (c.rowspan !== 2 || !c.rowspan) {
                            // add sub Level
                            const subFields = internal[1].filter(f => f?.visible !== false).slice(subIndx, subIndx + c.colspan);
                            result[1].push(...subFields);
                            // add subIndx the number of elements just added
                            subIndx += c.colspan ? c.colspan : 0;
                        }
                    } else {
                        // increment subIndx in case the `c` (the current internal element) is not present in `external` array.
                        // increment iff if rowspan=1 because otherwise an element on top array has no corresponding elm in the sub array.
                        if (c.rowspan !== 2 || !c.rowspan) {
                            subIndx += c.colspan ? c.colspan : 0;
                        }
                    }
                    // rowSpanCnt += c.rowspan ? c.rowspan-1 : 0;

                });
                return result;
            }
        } else {
            return internal;
        }
    }

    /**
     * It merges objects with the same Ids overwriting internal fields with the external ones.
     * For the rest of object (present EITHER in internal or external arrays) it acts like an outer join.
     * Useful for merging canned filters.
     *
     * @param {Array} internal 1D or 2D array
     * @param {Array} external plain array of strings.
     * @returns {Array} filtered array.
     */
    static mergeExampleFilters(internal, external) {
        if (external?.length) {
            // convert both arrays in map
            const results = [];
            const internalMap = Object.assign({}, ...internal.map(el => ({[el.id]: el})));
            const externalMap = Object.assign({}, ...external.map(el => ({[el.id]: el})));
            for (const [k, v] of Object.entries({...internalMap, ...externalMap})) {
                // element is present in both array or just in external
                if (externalMap[k]) {
                    results.push({...v, ...externalMap[k]});
                } else {
                    // only present in internal
                    results.push(v);
                }
            }
            return results;
        } else {
            return internal;
        }
    }

    /**
     * It filters internal data-form config object with the fields defined in `external` array. Sections are fixed.
     * NOTE very similar logic as mergeFilters() (although here `external` is an array of strings)
     * NOTE this is being used in variant-interpreter-qc-overview for merging settings and internal config despite the fact we don't use data-form.
     *
     * @param {Object} internal data-form config object
     * @param {Array} external plain array of fields to show.
     * @returns {Object} filtered array.
     */
    static mergeDataFormConfig(internal, external) {
        if (external?.length) {
            const sections = internal.sections.map(section => {
                const fields = [];
                for (const ex of external) {
                    const internalField = section.elements.find(c => {
                        if (!c.id) {
                            console.error("Column fields must have an id to be merged", c);
                        }
                        return c.id === ex;
                    });
                    if (internalField) {
                        fields.push({...internalField});
                    } else {
                        // console.warn(`Field "${ex}" not found merging user settings`);
                    }
                }
                return {...section, elements: fields};
            });
            return {...internal, sections};
        }
        return internal;
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

}
