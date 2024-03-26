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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../forms/data-form.js";


export default class VariantCallerInfoFilter extends LitElement {

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
            caller: {
                type: String
            },
            fileId: {
                type: String
            },
            fileData: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.fileDataSeparator = ",";
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("fileData")) {
            this.fileDataObserver();
        }
        super.update(changedProperties);
    }

    // update(changedProperties) {
    //     if (changedProperties.has("data")) {
    //         // Check if 'data' passed is undefined or null and initialised to empty object
    //         this.data = this.data ?? {};
    //     }
    //     super.update(changedProperties);
    // }

    /**
     * This observer process the fileData string and prepares the query object for data-form
     * and stores some variables for notifying the new fileData.
     */
    fileDataObserver() {
        if (this.fileData) {
            // Let's keep the fileData split in an array format, this will be used later
            this.fileDataArray = this.fileData.split(this.fileDataSeparator);

            // First, check if fileId has been provided, this is only mandatory when more than fileData exists.
            if (this.fileId) {
                // Let's store the fileData index for the current fileId, this will be used later
                this.fileDataIndex = this.fileDataArray.findIndex(e => e.startsWith(this.fileId));
            } else {
                if (this.fileDataArray.length === 1) {
                    this.fileDataIndex = 0;
                } else {
                    console.error("No fileId provided and more than fileData found", this.fileDataArray);
                    return;
                }
            }

            // Check if the fileId provided exists in fileData, it can be absent if not filter has been ever selected
            if (this.fileDataIndex >= 0) {
                // fileId is optional in the fileData filter when one single file exist
                this.fileDataInfoFilters = "";
                if (this.fileDataArray[this.fileDataIndex].includes(":")) {
                    this.fileDataInfoFilters = this.fileDataArray[this.fileDataIndex].split(":")[1];
                } else {
                    this.fileDataInfoFilters = this.fileDataArray[this.fileDataIndex];
                }

                // Let's get the key values filters, we assume an AND here
                this.fileDataQuery = {};
                let filters = this.fileDataInfoFilters.split(";");
                for (let filter of filters) {
                    let key, comparator, value;
                    if (filter.includes("<") || filter.includes("<=") || filter.includes(">") || filter.includes(">=")) {
                        [, key, comparator, value] = filter.match(/(\w*)(<=?|>=?|=)(-?\d*\.?\d+)/);
                    } else {
                        [key, value] = filter.split("=");
                        // number-field-filter needs the equal operator
                        isNaN(value) ? comparator = "" : comparator = "=";
                    }
                    this.fileDataQuery[key] = comparator + value;
                }
            } else {
                // fileData does not contain an entry for this file, so no filters are applied
                this.fileDataArray = [];
                this.fileDataIndex = -1;
                this.fileDataInfoFilters = "";
                this.fileDataQuery = {};
            }
        } else {
            // fileData can be empty in different situations such as after executing clear()
            this.fileDataArray = [];
            this.fileDataIndex = -1;
            this.fileDataInfoFilters = "";
            this.fileDataQuery = {};
        }

        // this.requestUpdate();
    }

    filterChange(e) {
        // Fetch existing filters
        let filters = [];
        if (this.fileDataInfoFilters) {
            filters = this.fileDataInfoFilters.split(";");
        }

        let filterIndex = filters.findIndex(filter => filter.startsWith(e.detail.param));
        if (e.detail.value) {
            let filter = "";
            switch (e.detail.param) {
                case "FILTER":
                    filter = "FILTER=PASS";
                    break;
                default:
                    filter = e.detail.param + "" + e.detail.value;
                    break;
            }

            // Check if we are editing an existing filter (index >= 0) or adding a new filter
            if (filterIndex >= 0) {
                filters[filterIndex] = filter;
            } else {
                filters.push(filter);
            }
        } else {
            // If value is empty we must delete the filter if exist
            if (filterIndex >= 0) {
                filters.splice(filterIndex, 1);
            }
        }

        // Build the fileData ONLY FOR THIS PARTICULAR FILE
        let filter = "";
        if (filters.length > 0) {
            filter = this.fileId ? this.fileId + ":" : "";
            filter += filters.join(";");
        }

        const event = new CustomEvent("filterChange", {
            detail: {
                value: filter
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
            sections: [
                {
                    title: "",
                    display: {
                        visible: this.caller === "caveman"
                    },
                    elements: [
                        {
                            name: "PASS",
                            field: "FILTER",
                            type: "checkbox",
                        },
                        {
                            name: "CLPM",
                            field: "CLPM",
                            type: "input-number",
                            defaultValue: "",
                        },
                        {
                            name: "ASMD",
                            field: "ASMD",
                            type: "input-number",
                            defaultValue: "",
                        },
                    ]
                },
                {
                    title: "",
                    display: {
                        visible: this.caller === "strelka"
                    },
                    elements: [
                        {
                            name: "PASS",
                            field: "filter",
                            type: "checkbox",
                        },
                        {
                            name: "SomaticEVS",
                            field: "SomaticEVS",
                            type: "input-text",
                            defaultValue: "",
                        },
                    ]
                },
                {
                    title: "",
                    display: {
                        visible: this.caller === "pindel"
                    },
                    elements: [
                        {
                            name: "PASS",
                            field: "FILTER",
                            type: "checkbox",
                        },
                        {
                            name: "QUAL",
                            field: "QUAL",
                            type: "input-number",
                            defaultValue: "",
                        },
                        {
                            name: "REP",
                            field: "REP",
                            type: "input-number",
                            defaultValue: "",
                        },
                        {
                            name: "LEN",
                            field: "LEN",
                            type: "input-number",
                            defaultValue: "",
                        },
                    ]
                },
                {
                    title: "",
                    display: {
                        visible: this.caller === "ascat"
                    },
                    elements: [
                        {
                            name: "Segment Size",
                            field: "segmentSize",
                            type: "input-number",
                            defaultValue: "",
                        },
                    ]
                },
                {
                    title: "",
                    display: {
                        visible: this.caller === "canvas"
                    },
                    elements: [
                        {
                            name: "PASS",
                            field: "filter",
                            type: "checkbox",
                        },
                        {
                            name: "Segment Size",
                            field: "segmentSize",
                            type: "input-number",
                            defaultValue: "",
                        },
                    ]
                },
                {
                    title: "",
                    display: {
                        visible: this.caller === "brass"
                    },
                    elements: [
                        {
                            name: "Assembly Score",
                            field: "BAS",
                            type: "input-number",
                            defaultValue: "",
                        },
                        {
                            name: "Size",
                            field: "size",
                            type: "input-number",
                            defaultValue: "",
                        },
                        {
                            name: "Type",
                            field: "type",
                            type: "select",
                            allowedValues: ["inversion", "translocation", "tandem duplication", "deletion"],
                        },
                        {
                            name: "Readpair Count",
                            field: "readpair count",
                            type: "input-number",
                            defaultValue: "",
                        },
                    ]
                },
                {
                    title: "",
                    display: {
                        visible: this.caller === "manta"
                    },
                    elements: [
                        {
                            name: "PASS",
                            field: "filter",
                            type: "checkbox",
                        },
                        {
                            name: "PR",
                            field: "pr",
                            type: "input-number",
                            defaultValue: "",
                        },
                    ]
                },
                {
                    title: "",
                    display: {
                        visible: this.caller === "tnhaplotyper2"
                    },
                    elements: [
                        {
                            name: "PASS",
                            field: "FILTER",
                            type: "checkbox",
                        },
                        {
                            name: "ECNT",
                            field: "ECNT",
                            type: "input-number",
                            defaultValue: "",
                        },
                        {
                            name: "TLOD",
                            field: "TLOD",
                            type: "input-number",
                            defaultValue: "",
                        },
                        {
                            name: "P_GERMLINE",
                            field: "P_GERMLINE",
                            type: "input-number",
                            defaultValue: "",
                        }
                    ]
                },
                {
                    title: "",
                    display: {
                        visible: this.caller === "pisces"
                    },
                    elements: [
                        {
                            name: "PASS",
                            field: "FILTER",
                            type: "checkbox",
                        },
                        {
                            name: "DP",
                            field: "DP",
                            type: "input-number",
                            defaultValue: "",
                        },
                    ]
                },
                {
                    title: "",
                    display: {
                        visible: this.caller === "craft"
                    },
                    elements: [
                        {
                            name: "PASS",
                            field: "FILTER",
                            type: "checkbox",
                        },
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-form .data=${this.fileDataQuery} .config="${this._config}" @fieldChange="${this.filterChange}"></data-form>
        `;
    }
}

customElements.define("variant-caller-info-filter", VariantCallerInfoFilter);
