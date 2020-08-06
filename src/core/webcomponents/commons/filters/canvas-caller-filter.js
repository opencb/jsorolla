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


export default class CanvasCallerFilter extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            region: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.separator = ",";
        this._config = this.getDefaultConfig();

        this.filter = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(_changedProperties) {
        // "this.region" are automatically reflected on the template, we don't needto watch it
        /*if (_changedProperties.has("region")) {
            if (this.region) {
                this.querySelector("#" + this._prefix + "LocationTextarea").value = this.region;
            } else {
                this.querySelector("#" + this._prefix + "LocationTextarea").value = "";
            }
        }*/
    }

    filterChange(e) {
        // Process the textarea: remove newline chars, empty chars, leading/trailing commas
        const _region = e.target.value.trim()
            .replace(/\r?\n/g, this.separator)
            .replace(/\s/g, "")
            .split(this.separator)
            .filter(Boolean)
            .join(this.separator);

        const event = new CustomEvent("filterChange", {
            detail: {
                value: _region
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
                    collapsed: false,
                    elements: [
                        {
                            name: "Filter Pass",
                            type: "checkbox",
                            display: {
                                // render: data => html`<span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})`
                            }
                        },
                        {
                            name: "Segment Size",
                            type: "input-text",
                            defaultValue: "",
                        },
                    ]
                },
            ]
        };
    }

    render() {
        return html`
            <data-form .data=${this.filter} .config="${this._config}"></data-form>
        `;
    }
}

customElements.define("canvas-caller-filter", CanvasCallerFilter);
