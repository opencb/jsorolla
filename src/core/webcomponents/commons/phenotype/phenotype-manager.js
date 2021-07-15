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


import {LitElement, html} from "/web_modules/lit-element.js";
// import UtilsNew from "../../../utilsNew.js";
import LitUtils from "../../commons/utils/lit-utils.js";

export default class PhenotypeManager extends LitElement {

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
            },
            updateManager: {
                type: Boolean
            },
            config: {
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
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    refreshForm() {
        // When using data-form we need to update config object and render again
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onFieldChangePhenotype(e) {
        const field = e.detail.param;
        this.phenotype = {
            ...this.phenotype,
            [field]: e.detail.value
        };
    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            buttons: {
                show: true,
                cancelText: "Cancel",
                classes: "pull-right"
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
                                disabled: this.updateManager,
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Source",
                            field: "source",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Age of on set",
                            field: "ageOfOnset",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Status",
                            field: "status",
                            type: "select",
                            allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"],
                            display: {
                                placeholder: "select a status..."
                            }
                        }
                    ]
                }
            ]
        };
    }

    onSendPhenotype(e) {
        // Send the phenotype to the upper component
        LitUtils.dispatchEventCustom(this, "addItem", this.phenotype);
    }

    onClearForm(e) {
        e.stopPropagation();
        LitUtils.dispatchEventCustom(this, "closeForm");
    }

    render() {
        return html`
        <div class="subform-test">
            <data-form
                .data=${this.phenotype}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChangePhenotype(e)}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onSendPhenotype(e)}">
            </data-form>
        </div>
    `;
    }

}

customElements.define("phenotype-manager", PhenotypeManager);
