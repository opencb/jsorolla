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
import UtilsNew from "../../../core/utilsNew.js";
import "../forms/data-form.js";


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
            // callers: {
            //     type: Array
            // },
            fileData: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            // config: {
            //     type: Object
            // }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.callerParamTypeToDataForm = {
            "NUMERIC": "input-number",
            "CATEGORICAL": "select",
            "BOOLEAN": "checkbox",
        };

        this.fileDataSeparator = ",";
        // this.fileToCaller = {};
        // this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        // this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        // if (changedProperties.has("callers")) {
        //     this.callersObserver();
        // }
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
            const softwareName = file.software?.name ? file.software.name.toLowerCase() : file.name;
            this.callerIdToFile[softwareName] = file;
            this.fileNameToCallerId[file.name] = softwareName;
        }

        // Generate a map of all INFO fields to the callerIds, fileIds and the description2
        const infoFieldToBasicInfo = {"PASS": []}; // PASS is always there
        this.files.forEach(file => {
            // Add PASS automatically to all files
            infoFieldToBasicInfo["PASS"].push({
                fileName: file.name,
                callerId: file.software?.name,
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
                        callerId: file.software?.name,
                        description: line.description
                    });
                });
        });

        // Check if variantCallers have been configured
        const variantCallers = [];
        const studyInternalConfiguration = this.opencgaSession?.study?.internal?.configuration;
        if (studyInternalConfiguration?.clinical?.interpretation?.variantCallers) {
            const indexedFields = {};
            if (studyInternalConfiguration?.variantEngine?.sampleIndex?.fileIndexConfiguration?.customFields) {
                for (const customField of studyInternalConfiguration.variantEngine.sampleIndex.fileIndexConfiguration.customFields) {
                    if (customField.source === "FILE") {
                        indexedFields[customField.key] = customField;
                    }
                }
            }

            // TODO check if this work
            for (const caller of studyInternalConfiguration.clinical.interpretation.variantCallers) {
                if (this.callerIdToFile?.[caller.id]) {
                    // Check if dataFilter are indexed
                    for (const dataFilter of caller.dataFilters) {
                        if (indexedFields[dataFilter.id]) {
                            const field = indexedFields[dataFilter.id];
                            if (field.type.startsWith("RANGE_")) {
                                dataFilter.comparators = field.type === "RANGE_LT" ? ["<", ">="] : [">", "<="];
                                dataFilter.allowedValues = field.thresholds;
                            } else {
                                dataFilter.allowedValues = field.values;
                            }
                        }
                    }

                    variantCallers.push({
                        ...caller,
                        fileId: this.callerIdToFile[caller.id]?.name
                    });
                }
            }
        } else {
            // If not variantCallers configuration exist we can check for the indexed custom fields in the sample index.
            // Example:
            // "customFields": [
            //     {
            //         "source": "FILE",
            //         "key": "FILTER",
            //         "type": "CATEGORICAL",
            //         "values": [
            //             "PASS"
            //         ],
            //         "nullable": true
            //     },
            //     {
            //         "source": "FILE",
            //         "key": "ASMD",
            //         "type": "RANGE_LT",
            //         "thresholds": [
            //             20,
            //             30,
            //             250,
            //             300
            //         ],
            //         "nullable": true
            //     }
            // ]

            if (studyInternalConfiguration?.variantEngine?.sampleIndex?.fileIndexConfiguration?.customFields) {
                const callerToDataFilters = {};
                for (const customField of studyInternalConfiguration.variantEngine.sampleIndex.fileIndexConfiguration.customFields) {
                    // At the moment we support all FILE fields but QUAL, since the values do not follow any standard
                    if (customField.source === "FILE" && customField.key !== "QUAL") {
                        let fieldName, fieldType, fieldValues, fieldComparators;

                        // Check if field id is FILTER and has only PASS value
                        if (customField.key === "FILTER") {
                            if (customField.values?.length === 1 && customField.values[0] === "PASS") {
                                fieldName = "PASS",
                                fieldType = "BOOLEAN";
                            } else {
                                fieldType = "CATEGORICAL";
                                fieldValues = customField.values;
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
                    for (const filter of filters.split(";")) {
                        let key, comparator, value;
                        if (filter.includes("<") || filter.includes("<=") || filter.includes(">") || filter.includes(">=")) {
                            [, key, comparator, value] = filter.match(/(\w*)(<=?|>=?|=)(-?\d*\.?\d+)/);
                        } else {
                            [key, value] = filter.split("=");
                            if (key === "FILTER") {
                                comparator = "";
                                value = value === "PASS";
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
        const [caller, field] = e.detail.param.split(".");
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
                        const value = filterEntry[0] !== "FILTER" ? filterEntry[1] : "=PASS";
                        return filterEntry[0] + "" + value;
                    })
                    .join(";");
                return fileId + ":" + filterString;
            })
            .join(",");

        const event = new CustomEvent("filterChange", {
            detail: {
                value: fileData
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        const _sections = this.callers?.map(caller => {
            // Generate the caller section
            return {
                title: caller.id,
                display: {
                    titleHeader: "h4",
                    titleStyle: "margin: 20px 20px 0px 20px"
                },
                elements: [
                    // {
                    //     name: "",
                    //     field: "",
                    //     type: "title",
                    //     text: "VCF file " + caller.fileId,
                    // },
                    ...caller.dataFilters.map(field => ({
                        name: field.name || field.id,
                        field: caller.id + "." + field.id,
                        type: this.callerParamTypeToDataForm[field.type],
                        comparators: (field.comparators || []).join(","),
                        allowedValues: field.allowedValues,
                        defaultValue: "",
                    }))
                ],
            };
        });

        return {
            title: "",
            icon: "",
            type: "form",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-",
                defaultLayout: "vertical"
            },
            sections: _sections
        };
    }

    render() {
        return html`
            <data-form .data=${this.fileDataQuery}
                       .config="${this._config}"
                       @fieldChange="${this.filterChange}">
            </data-form>
        `;
    }

}

customElements.define("variant-file-info-filter", VariantFileInfoFilter);
