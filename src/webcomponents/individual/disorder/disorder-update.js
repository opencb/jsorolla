/**
 * Copyright 2015-2019 OpenCB
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
import LitUtils from "../../commons/utils/lit-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";

export default class DisorderUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            disorder: {
                type: Object
            },
            evidences: {
                types: Array
            }
        };
    }

    _init() {
        this.disorder = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig()};
    }

    update(changedProperties) {
        if (changedProperties.has("evidences")) {
            this._config = {...this.getDefaultConfig()};
        }

        if (changedProperties.has("disorder")) {
            this.disorderObserver();
        }

        super.update(changedProperties);
    }

    disorderObserver() {
        if (this.disorder) {
            this._disorder = JSON.parse(JSON.stringify(this.disorder));
        }

    }

    onFieldChange(e) {
        e.stopPropagation();
        this.updateParams = FormUtils.updateScalar(
            this._disorder,
            this.disorder,
            this.updateParams,
            e.detail.param,
            e.detail.value);
        this.disorder = {...this.disorder, ...this.updateParams};

        // to render which data changed
        this.requestUpdate();
    }

    onSendDisorder(e) {
        e.stopPropagation();
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "addItem", this.disorder);
    }

    onClear(e) {
        e.stopPropagation();
        this.disorder = JSON.parse(JSON.stringify(this._disorder));
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html`
            <data-form
                .data=${this.disorder}
                .config="${this._config}"
                .updateParams=${this.updateParams}
                @fieldChange="${e =>this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSendDisorder(e)}">
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
                defaultValue: "",
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Id",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "add a description...",
                                disabled: true
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "add a description..."
                            }
                        },
                        {
                            name: "Source",
                            field: "source",
                            type: "input-text",
                            display: {
                                placeholder: "add a description..."
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                placeholder: "add a description..."
                            }
                        },
                        {
                            name: "Evidences", // Phenotypes List
                            field: "evidences",
                            type: "select",
                            multiple: true,
                            allowedValues: this.evidences?.map(evidence => evidence.id),
                            display: {
                                visible: this.evidences?.length > 0,
                                placeholder: "select an evidence...",
                            }
                        },
                    ]
                }
            ]
        };
    }


}

customElements.define("disorder-update", DisorderUpdate);
