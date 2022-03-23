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

export default class DisorderManager extends LitElement {

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
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("evidences")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    onFieldChange(e) {
        e.stopPropagation();
        const field = e.detail.param;
        if (e.detail.value) {
            this.disorder = {
                ...this.disorder,
                [field]: e.detail.value
            };
        } else {
            delete this.disorder[field];
        }
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
                                placeholder: "add a description..."
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

    onSendDisorder(e) {
        e.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "addItem", this.disorder);
    }

    onClearForm(e) {
        e.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html`
        <div class="subform-test">
            <data-form
                .data=${this.disorder}
                .config="${this._config}"
                @fieldChange="${e =>this.onFieldChange(e)}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onSendDisorder(e)}">
            </data-form>
        </div>`;
    }

}

customElements.define("disorder-manager", DisorderManager);
