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
            // Mandatory
            callers: {
                type: Array
            },
            // fileId: {
            //     type: String
            // },
            fileData: {
                type: String
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
        this.fileToCaller = {};
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        // this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("callers")) {
            this.callersObserver();
        }

        if (changedProperties.has("fileData")) {
            this.fileDataObserver();
        }
        super.update(changedProperties);
    }

    callersObserver() {
        this.fileToCaller = {};
        this.callerToFile = {};

        this._sections = this.callers.map(caller => {
            this.fileToCaller[caller.fileId] = caller.id;
            this.callerToFile[caller.id] = caller.fileId;

            // Generate the caller section
            return {
                title: caller.id,
                display: {
                    titleHeader: "h4"
                },
                elements: caller.dataFilters.map(field => ({
                    name: field.name || field.id,
                    field: caller.id + "." + field.id,
                    type: this.callerParamTypeToDataForm[field.type],
                    // defaultValue: field.type !== "BOOLEAN" ? field.defaultValue : field.defaultValue === "true"
                    allowedValues: field.allowedValues || null,
                    comparators: (field.comparators || []).join(","),
                    defaultValue: "",
                })),
            };
        });

        // Update this._config to update changes
        this._config = this.getDefaultConfig();
    }

    // getDataFormType(dataFilter) {
    //     if (dataFilter.allowedValues) {
    //         return "select";
    //     } else {
    //         this.callerParamTypeToDataForm = {
    //             "NUMERIC": "input-number",
    //             "CATEGORICAL": "select",
    //             "BOOLEAN": "checkbox",
    //         };
    //         return this.callerParamTypeToDataForm[dataFilter.type];
    //     }
    // }
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
                    _fileDataQuery[this.fileToCaller[fileId]] = {};
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
                        _fileDataQuery[this.fileToCaller[fileId]][key] = comparator + value;
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
                const fileId = this.callerToFile[callerEntry[0]];
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
            sections: this._sections
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
