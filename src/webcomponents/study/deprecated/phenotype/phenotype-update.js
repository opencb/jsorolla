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
import FormUtils from "../../../commons/forms/form-utils.js";

export default class PhenotypeUpdate extends LitElement {

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
            phenotypeId: {
                type: String
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

    update(changedProperties) {
        if (changedProperties.has("phenotype")) {
            this.phenotypeObserver();
        }
        super.update(changedProperties);
    }

    phenotypeObserver() {
        if (this.phenotype) {
            this._phenotype = JSON.parse(JSON.stringify(this.phenotype));
        }
    }

    onFieldChange(e) {
        e.stopPropagation();
        // No need to switch(field) since all of them are processed in the same way
        this.updateParams = FormUtils.updateScalar(
            this._phenotype,
            this.phenotype,
            this.updateParams,
            e.detail.param,
            e.detail.value);

        this.phenotype = {...this.phenotype, ...this.updateParams};

        this.requestUpdate();
    }

    onSendPhenotype(e) {
        // Send the phenotype to the upper component
        e.stopPropagation();
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "addItem", this.phenotype);
    }

    onClear(e) {
        e.stopPropagation();
        this.phenotype = JSON.parse(JSON.stringify(this._phenotype));
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html`
            <data-form
                .data=${this.phenotype}
                .config="${this._config}"
                .updateParams=${this.updateParams}
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSendPhenotype(e)}">
            </data-form>
    `;
    }

    getDefaultConfig() {
        return {
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
                                placeholder: "add short id",
                                disabled: true,
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "add a name"
                            }
                        },
                        {
                            name: "Source",
                            field: "source",
                            type: "input-text",
                            display: {
                                placeholder: "add a source"
                            }
                        },
                        {
                            name: "Age of on set",
                            field: "ageOfOnset",
                            type: "input-text",
                            display: {
                                placeholder: "add an age of on set"
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

}

customElements.define("phenotype-update", PhenotypeUpdate);
