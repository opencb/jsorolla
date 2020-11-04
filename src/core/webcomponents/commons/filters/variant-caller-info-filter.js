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


import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "../view/data-form.js";


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
            fileId: {
                type: String
            },
            query: {
                type: Object
            },
            caller: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        // debugger
        if (changedProperties.has("query")) {
            if (!this.query) {
                this.query = {};
            }
        }
    }

    filterChange(e) {
        debugger
        if (e.detail.value) {
            switch (e.detail.param) {
                case "FILTER":
                    this.query[e.detail.param] = "PASS";
                    break;
                default:
                    this.query[e.detail.param] = e.detail.value;
                    break;
            }
        } else {
            delete this.query[e.detail.param];
        }

        this.notify();
    }

    notify() {
        let filter = this.fileId ? this.fileId + ":" : "";
        filter += Object.entries(this.query).map(([k, v]) => {
            if (k === "FILTER") {
                return k + "=" + v;
            } else {
                return k + "" + v;
            }
        }).join(";");

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
                }
            ]
        };
    }

    render() {
        // debugger
        return html`
            <data-form .data=${this.query ?? {}} .config="${this._config}" @fieldChange="${this.filterChange}"></data-form>
        `;
    }
}

customElements.define("variant-caller-info-filter", VariantCallerInfoFilter);
