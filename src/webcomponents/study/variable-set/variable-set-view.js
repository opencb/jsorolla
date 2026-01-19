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

import {html, LitElement, nothing} from "lit";
import "../../commons/forms/data-form.js";
import "../../loading-spinner.js";

export default class VariableSetView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variableSet: {
                type: Object
            },
            variableSetId: {
                type: String
            },
            variableSets: {
                type: Array
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.selectedVariableSet = null;
        this._loading = false;

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variableSet")) {
            this.variableSetObserver();
        }
        if (changedProperties.has("variableSetId")) {
            this.variableSetIdObserver();
        }
        if (changedProperties.has("variableSets")) {
            this.variableSetsObserver();
        }
        // if (changedProperties.has("opencgaSession")) {
        //     this.variableSetsObserver();
        // }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    variableSetIdObserver() {
        if (this.variableSetId && this.opencgaSession) {
            this._loading = true;
            let error;
            this.opencgaSession.opencgaClient.studies()
                .variableSets(this.opencgaSession.study.fqn,
                    {
                        id: this.variableSetId
                    }
                )
                .then(response => {
                    this.variableSet = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.variableSet = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._loading = false;
                    this._config = {...this.getDefaultConfig(), ...this.config};
                    this.requestUpdate();
                });
        }
    }

    variableSetObserver() {
        this.variableSets = [this.variableSet];
    }

    variableSetsObserver() {
        this.selectedVariableSet = this.variableSets?.length > 0 ? this.variableSets[0] : null;
        this.requestUpdate();
    }

    changeVariableSet(e) {
        this.selectedVariableSet = this.variableSets.find(vs => vs.id === e.target.value);
        this.requestUpdate();
    }

    render() {
        if (this._loading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <!-- Render a select when more than Variable Set exists -->
            ${this.variableSets?.length > 1 ? html`
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="">
                            <label for="variableSetSelect" class="form-label">Select a Variable Set:</label>
                            <select class="form-select" id="variableSetSelect" @change="${this.changeVariableSet}">
                                ${this.variableSets.map(variableSet => html`
                                    <option value="${variableSet.id}">${variableSet.name}</option>
                                `)}
                            </select>
                        </div>
                    </div>
                </div>
            ` : nothing
            }

            <data-form
                .data=${this.selectedVariableSet}
                .config="${this._config}">
            </data-form>`;
    }

    getDefaultConfig() {
        return {
            title: "",
            icon: "",
            display: {
                buttonsVisible: false,
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-"
            },
            sections: [
                {
                    title: "",
                    collapsed: false,
                    display: {},
                    elements: [
                        {
                            name: "Variable Set ID",
                            type: "custom",
                            display: {
                                visible: variableSet => variableSet?.id,
                                render: data => html`<span style="font-weight: bold">${data.id}</span>`
                            }
                        },
                        {
                            name: "Name",
                            field: "name"
                        },
                        {
                            name: "Entity",
                            field: "entities",
                            display: {
                            }
                        },
                        {
                            name: "Internal",
                            field: "internal",
                            display: {
                                defaultValue: "false"
                            }
                        },
                        {
                            name: "Description",
                            field: "description"
                        },
                        {
                            name: "Variables",
                            field: "variables",
                            type: "list",
                            display: {
                                defaultValue: "-",
                                contentLayout: "bullets",
                                format: variable => {
                                    return `${variable?.name} (${variable?.type})`;
                                },
                            }
                        },
                    ]
                },
            ]
        };
    }

}

customElements.define("variable-set-view", VariableSetView);
