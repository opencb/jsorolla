/**
 * Copyright 2015-2021 OpenCB
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
import LitUtils from "../../../commons/utils/lit-utils.js";

// DEPRECATED
export default class PhenotypeCreate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            phenotype: {
                type: Object
            }
        };
    }

    _init() {
        this.phenotype = {};
    }

    connectedCallback() {
        super.connectedCallback();
        // It must be in connectCallback for the display.disabled option in the input text to work.
        this._config = {...this.getDefaultConfig()};
    }

    onFieldChange(e) {
        e.stopPropagation();
        const field = e.detail.param;
        if (e.detail.value) {
            // No need to switch(field) since all of them are processed in the same way
            this.phenotype = {
                ...this.phenotype,
                [field]: e.detail.value
            };
        } else {
            delete this.phenotype[field];
        }
    }

    // Submit to upper component.
    onSendPhenotype(e) {
        // Send the phenotype to the upper component
        e.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "addItem", this.phenotype);
        this.phenotype = {};
    }

    onClearForm(e) {
        e.stopPropagation();
        this.phenotype = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html`
            <data-form
                .data=${this.phenotype}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onSendPhenotype(e)}">
            </data-form>
    `;
    }

    getDefaultConfig() {
        return {
            buttons: {
                show: true,
                cancelText: "Cancel",
                // classes: "pull-right"
            },
            display: {
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: ""
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Id",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add short id...",
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add a name..."
                            }
                        },
                        {
                            name: "Source",
                            field: "source",
                            type: "input-text",
                            display: {
                                placeholder: "Add a source..."
                            }
                        },
                        {
                            name: "Age of on set",
                            field: "ageOfOnset",
                            type: "input-text",
                            display: {
                                placeholder: "Add an age of on set..."
                            }
                        },
                        {
                            name: "Status",
                            field: "status",
                            type: "select",
                            allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"],
                            display: {
                                placeholder: "Select a status..."
                            }
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("phenotype-create", PhenotypeCreate);
