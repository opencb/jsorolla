/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html} from "lit";
import LitUtils from "../utils/lit-utils.js";
import "../forms/data-form.js";

/*
 * This component takes a sampleID OR an array of files to render VCF INFO filters from the study configuration
 */
export default class VariantFileInfoFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            sampleId: {
                type: String
            },
            files: {
                type: Array
            },
            fileData: {
                type: String
            },
            visibleCallers: {
                type: Array,
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    _init() {
        this.fileDataQuery = {};
        this.callerParamTypeToDataForm = {
            "NUMERIC": "input-number",
            "CATEGORICAL": "select",
            "BOOLEAN": "checkbox",
        };

        this.fileDataSeparator = ",";
        this.callers = [];
        this.visibleCallers = null;
    }

    #encodeCallerId(name) {
        return name.replaceAll(".", "___");
    }

    #decodeCallerId(name) {
        return name.replaceAll("___", ".");
    }

    update(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        if (changedProperties.has("files")) {
            this.filesObserver();
        }
        if (changedProperties.has("fileData")) {
            this.fileDataObserver();
        }
        super.update(changedProperties);
    }

    sampleIdObserver() {
        if (this.sampleId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.files().search({sampleIds: this.sampleId, format: "VCF", study: this.opencgaSession.study.fqn})
                .then(fileResponse => {
                    this.files = fileResponse.response[0].results;
                })
                .catch(response => {
                    console.error(`An error occurred fetching files for sample: ${this.sampleId}`, response);
                });
        }
    }

    filesObserver() {
        // Get all caller IDs and map them to the file objects
        this.callerIdToFile = {};
        this.fileNameToCallerId = {};
        for (const file of this.files) {
            // If software.name does not exist then we use file.name
            const softwareName = this.#encodeCallerId(file.software?.name ? file.software.name.toLowerCase() : file.name);
            this.callerIdToFile[softwareName] = file;
            this.fileNameToCallerId[file.name] = softwareName;
        }

        // Generate a map of all INFO fields to the callerIds, fileIds and the description2
        const infoFieldToBasicInfo = {"PASS": []}; // PASS is always there
        this.files.forEach(file => {
            // Add PASS automatically to all files
            infoFieldToBasicInfo["PASS"].push({
                fileName: file.name,
                callerId: this.fileNameToCallerId[file.name],
                description: "PASS variant"
            });

            // Add the other fields to the files where they exist
            file.attributes.variantFileMetadata.header.complexLines
                .filter(line => line.key === "INFO")
                .forEach(line => {
                    if (!infoFieldToBasicInfo[line.id]) {
                        infoFieldToBasicInfo[line.id] = [];
                    }

                    infoFieldToBasicInfo[line.id].push({
                        fileName: file.name,
                        callerId: this.fileNameToCallerId[file.name],
                        description: line.description
                    });
                });
        });

        // Check if variantCallers have been configured
        const studyInternalConfiguration = this.opencgaSession?.study?.internal?.configuration;
        const variantCallersWithInfoField = studyInternalConfiguration?.clinical?.interpretation?.variantCallers
            ?.filter(vc => vc.dataFilters.findIndex(filter => !filter.source || filter.source === "FILE") !== -1);
        const variantCallers = [];

        // 1. Check if variant callers configuration is defined
        if (variantCallersWithInfoField?.length > 0) {
            const indexedCustomFields = {};
            if (studyInternalConfiguration?.variantEngine?.sampleIndex?.fileIndexConfiguration?.customFields) {
                for (const customField of studyInternalConfiguration.variantEngine.sampleIndex.fileIndexConfiguration.customFields) {
                    if (customField.source === "FILE") {
                        indexedCustomFields[customField.key] = customField;
                    }
                }
            }

            // Add caller INDEXED-FILE filters from study configuration
            for (const variantCaller of variantCallersWithInfoField) {
                if (this.callerIdToFile?.[variantCaller.id]) {
                    const _dataFilters = [];
                    for (const dataFilter of variantCaller.dataFilters) {
                        // Make sure that only FILE filters are added
                        // Check if dataFilter are indexed
                        if (dataFilter?.source === "FILE" && indexedCustomFields[dataFilter.id]) {
                            const _dataFilter = {...dataFilter};
                            const indexedCustomField = indexedCustomFields[_dataFilter.id];

                            // Check if field id is FILTER and has only PASS value
                            if (_dataFilter.id === "FILTER") {
                                if (_dataFilter.allowedValues?.length > 0) {
                                    if (_dataFilter.allowedValues?.length === 1 && _dataFilter.allowedValues[0] === "PASS") {
                                        _dataFilter.name = "PASS";
                                        _dataFilter.type = "BOOLEAN";
                                    } else {
                                        // Check if the variant caller defines a allowedValues, if yes we must use it
                                        _dataFilter.allowedValues = dataFilter.allowedValues;
                                        _dataFilter.multiple = true;
                                        _dataFilter.maxOptions = 5;
                                    }
                                } else {
                                    // We use the default configuration
                                    _dataFilter.allowedValues = indexedCustomField.values;
                                }
                            } else {
                                if (indexedCustomField.type.startsWith("RANGE_")) {
                                    _dataFilter.comparators = indexedCustomField.type === "RANGE_LT" ? ["<", ">="] : [">", "<="];
                                    _dataFilter.allowedValues = indexedCustomField.thresholds;
                                } else {
                                    // Categorical: check if the variant caller defines a allowedValues, if yes we must use it
                                    if (dataFilter.allowedValues?.length > 0) {
                                        _dataFilter.allowedValues = dataFilter.allowedValues;
                                    } else {
                                        _dataFilter.allowedValues = indexedCustomField.values;
                                    }
                                }
                            }

                            _dataFilters.push(_dataFilter);
                        }
                    }

                    // If at least one FILE filter has been found
                    if (_dataFilters.length > 0) {
                        variantCallers.push({
                            ...variantCaller,
                            dataFilters: _dataFilters,
                            fileId: this.callerIdToFile[variantCaller.id]?.name
                        });
                    }
                }
            }
        } else {
            // 2. If not variantCallers configuration exist we can check for the indexed custom fields in the sample index.
            //      Example:
            //      "customFields": [
            //          {
            //              "source": "FILE",
            //              "key": "FILTER",
            //              "type": "CATEGORICAL",
            //              "values": [
            //                  "PASS"
            //              ],
            //              "nullable": true
            //          },
            //          {
            //              "source": "FILE",
            //              "key": "ASMD",
            //              "type": "RANGE_LT",
            //              "thresholds": [
            //                  20,
            //                  30,
            //                  250,
            //                  300
            //              ],
            //              "nullable": true
            //          }
            //      ]
            if (studyInternalConfiguration?.variantEngine?.sampleIndex?.fileIndexConfiguration?.customFields) {
                const callerToDataFilters = {};
                for (const customField of studyInternalConfiguration.variantEngine.sampleIndex.fileIndexConfiguration.customFields) {
                    // At the moment we support all FILE fields but QUAL, since the values do not follow any standard
                    if (customField.source === "FILE" && customField.key !== "QUAL") {
                        let fieldName, fieldType, fieldValues, fieldComparators;
                        let multiple = false;
                        let maxOptions = 1;

                        // Check if field id is FILTER and has only PASS value
                        if (customField.key === "FILTER") {
                            if (customField.values?.length === 1 && customField.values[0] === "PASS") {
                                fieldName = "PASS";
                                fieldType = "BOOLEAN";
                            } else {
                                fieldType = "CATEGORICAL";
                                fieldValues = customField.values;
                                multiple = true;
                                maxOptions = 5;
                            }
                        } else {
                            // All other fields are processed normally
                            if (customField.type.startsWith("RANGE_")) {
                                fieldType = "NUMERIC";
                                fieldValues = customField.thresholds;
                                fieldComparators = customField.type === "RANGE_LT" ? ["<", ">="] : [">", "<="];
                            } else {
                                fieldType = "CATEGORICAL";
                                fieldValues = customField.values;
                            }
                        }

                        // Add this field to each caller dataFilter
                        (infoFieldToBasicInfo[fieldName || customField.key] || []).forEach(caller => {
                            const callerId = caller.callerId || caller.fileName; // replace . by _
                            if (!callerToDataFilters[callerId]) {
                                callerToDataFilters[callerId] = [];
                            }
                            callerToDataFilters[callerId].push({
                                id: customField.key,
                                name: fieldName || customField.key,
                                type: fieldType,
                                source: customField.source,
                                allowedValues: fieldValues,
                                multiple: multiple,
                                maxOptions: maxOptions,
                                comparators: fieldComparators || [],
                            });
                        });
                    }
                }

                const entries = Object.entries(this.callerIdToFile);
                for (const entry of entries) {
                    if (callerToDataFilters[entry[0]]) {
                        variantCallers.push({
                            id: entry[0],
                            dataFilters: callerToDataFilters[entry[0]],
                            fileId: entry[1].name,
                        });
                    }
                }
            }
        }

        this.callers = variantCallers;
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    // This function can split filters in filterData in a safe way.
    // Some values can have semicolon characters, example: "FILTER=PASS;A,B;CLPM<=0.5;ASMD>=1,400"
    //
    #splitFilters(filtersString) {
        // 1. Find the key/values: ["FILTER=PASS", "CLPM<=0.5", "ASMD>=1,400"]
        const re = /(?<file>[\w]+)(?<op>[=<>]+)(?<field>[a-zA-Z0-9,.-]+)/g;
        const match1 = filtersString.match(re);
        // 2. Get the indexes: [0, 16, 26]
        const filters = [];
        const indexes = [];
        for (const m of match1) {
            indexes.push(filtersString.indexOf(m));
        }
        // 3. substring the whole values: ["FILTER=PASS;A,B", "CLPM<=0.5", "ASMD>=1,400"]
        for (let i = 0; i < indexes.length; i++) {
            if (i < indexes.length - 1) {
                filters.push(filtersString.substring(indexes[i], indexes[i+1] - 1));
            } else {
                filters.push(filtersString.substring(indexes[i]));
            }
        }
        return filters;
    }

    /*
     * This observer process the fileData string and prepares the query object for data-form
     * and stores some variables for notifying the new fileData.
     */
    fileDataObserver() {
        const _fileDataQuery = {};
        if (this.fileData) {
            // Let's keep the fileData split in an array format, this will be used later
            this.fileDataArray = this.fileData.split(this.fileDataSeparator);
            for (const fileDataItem of this.fileDataArray) {
                if (fileDataItem.includes(":")) {
                    const [fileId, filters] = fileDataItem.split(":");
                    _fileDataQuery[this.fileNameToCallerId[fileId]] = {};
                    for (const filter of this.#splitFilters(filters)) {
                        let key, comparator, value;
                        if (filter.includes("<") || filter.includes("<=") || filter.includes(">") || filter.includes(">=")) {
                            [, key, comparator, value] = filter.match(/([\w]*)(<=?|>=?|=)(-?\d*\.?\d+)/);
                        } else {
                            [key, value] = filter.split("=");
                            if (key === "FILTER") {
                                comparator = "=";
                                const type = this.callers[this.fileNameToCallerId[fileId]]?.dataFilters?.find(df => df.id === "FILTER")?.type;
                                if (type?.toUpperCase() === "BOOLEAN") {
                                    value = value === "PASS";
                                }
                            } else {
                                // number-field-filter needs the equal operator
                                isNaN(value) ? comparator = "" : comparator = "=";
                            }
                        }
                        _fileDataQuery[this.fileNameToCallerId[fileId]][key] = comparator + value;
                    }
                } else {
                    console.warn("No fileId provided");
                }
            }
        }
        this.fileDataQuery = _fileDataQuery;
        this.requestUpdate();
    }

    filterChange(e) {
        // const [caller, field] = e.detail.param.split(".");
        const splits = e.detail.param.split(".");
        // Caller name can be a file name and contain dots, we join all parts but last one.
        const caller = splits.slice(0, -1).join(".");
        const field = splits.slice(-1)[0];
        const value = e.detail.value;

        // Check if this is the first filter of this caller
        if (!this.fileDataQuery[caller]) {
            this.fileDataQuery[caller] = {};
        }

        // ADD, UPDATE or DELETE the field
        if (value) {
            this.fileDataQuery[caller][field] = value;
        } else {
            delete this.fileDataQuery[caller][field];
            // If not filter left we delete the caller section
            if (Object.keys(this.fileDataQuery[caller]).length === 0) {
                delete this.fileDataQuery[caller];
            }
        }

        // Build the fileData string
        const fileData = Object.entries(this.fileDataQuery)
            .map(callerEntry => {
                // Translate caller to file
                const fileId = this.callerIdToFile[callerEntry[0]].name;
                const filterString = Object.entries(callerEntry[1])
                    .map(filterEntry => {
                        // FILTER requires a PASS value when true
                        let value = filterEntry[1]; //  : "=PASS";
                        if (filterEntry[0] === "FILTER" && typeof filterEntry[1] === "boolean") {
                            value = "=PASS";
                        } else {
                            // Fix categorical fields (related to TASK-1458 and TASK-2322)
                            const callerInfo = this.callers?.find(caller => caller.id === callerEntry[0]);
                            const fieldInfo = callerInfo?.dataFilters?.find(f => f.id === filterEntry[0]);
                            if (fieldInfo && fieldInfo.type === "CATEGORICAL") {
                                value = "=" + value;
                            }
                        }

                        return filterEntry[0] + "" + value;
                    })
                    .join(";");
                return fileId + ":" + filterString;
            })
            .join(",");

        LitUtils.dispatchCustomEvent(this, "filterChange", fileData);
    }

    render() {
        return html`
            <data-form
                .data="${this.fileDataQuery}"
                .config="${this._config}"
                @fieldChange="${this.filterChange}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        let callers = this.callers || [];

        // Check if we have provided a list of specific callers to display
        if (this.visibleCallers && Array.isArray(this.visibleCallers)) {
            callers = this.callers.filter(caller => this.visibleCallers.includes(caller.id));
        }

        const _sections = callers?.map(caller => {
            // Generate the caller section
            return {
                title: this.#decodeCallerId(caller.id),
                display: {
                    titleHeader: "h5",
                    titleStyle: "margin: 5px 0",
                    titleClassName: "text-break"
                },
                elements: [
                    {
                        name: "",
                        type: "text",
                        text: caller.fileId || "",
                        display: {
                            textClassName: "d-block text-secondary small text-break",
                            textStyle: "margin: 5px 0; font-style: italic",
                        }
                    },
                    ...caller.dataFilters.map(field => ({
                        name: field.name || field.id,
                        field: caller.id + "." + field.id,
                        type: this.callerParamTypeToDataForm[field.type],
                        comparators: (field.comparators || []).join(","),
                        allowedValues: field.allowedValues,
                        multiple: field.multiple ?? false,
                        maxOptions: field.maxOptions ?? 1,
                        display: {
                            defaultValue: "",
                        },
                    }))
                ],
            };
        });

        return {
            title: "",
            icon: "",
            display: {
                buttonsVisible: false,
                collapsable: true,
                titleVisible: false,
                titleWidth: 2,
                defaultValue: "",
                defaultLayout: "vertical"
            },
            sections: _sections,
        };
    }

}

customElements.define("variant-file-info-filter", VariantFileInfoFilter);
