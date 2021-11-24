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
import "../../commons/forms/data-form.js";
import "../../loading-spinner.js";
import "./variable-list-update.js";

export default class VariableSetView extends LitElement {

    constructor() {
        super();

        this._init();
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
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.variableSet = {};
        this.isLoading = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("variableSetId")) {
            this.variableSetIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    variableSetIdObserver() {
        if (this.variableSetId && this.opencgaSession) {
            this.isLoading = true;
            let error;
            this.opencgaSession.opencgaClient.studies().variableSets(this.opencgaSession.study.fqn, {id: this.variableSetId})
                .then(response => {
                    this.variableSet = response.responses[0].results[0];
                    this.isLoading = false;
                })
                .catch(reason => {
                    this.variableSet = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = {...this.getDefaultConfig(), ...this.config};
                    this.requestUpdate();
                    LitUtils.dispatchEventCustom(this, "variableSetSearch", this.variableSet, error);
                });
        }
    }

    onFilterChange(e) {
        // This must call sampleIdObserver function
        console.log(`Searching VariableSet: ${e.detail.value}`);
        this.variableSetId = e.detail.value;
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                buttons: {
                    show: false
                },
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-"
            },
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: variableSet => !variableSet?.id
                    },
                    elements: [
                        {
                            name: "VariableSet ID",
                            field: "variableSetId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <variableset-id-autocomplete
                                        .value="${this.variableSet?.id}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </variableset-id-autocomplete>`
                            }
                        }
                    ]
                },
                {
                    title: "General",
                    collapsed: false,
                    display: {
                        visible: variableSet => variableSet?.id
                    },
                    elements: [
                        {
                            name: "VariableSet ID",
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
                            name: "Confidential",
                            field: "confidential",
                            display: {
                                defaultValue: "false"
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
                            type: "custom",
                            defaultValue: "N/A",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: () => html`
                                    <variable-list-update
                                        .variables=${this.variableSet?.variables}
                                        .readOnly=${true}>
                                    </variable-list-update>
                                `
                            }
                        }
                    ]
                },
            ]
        };
    }

    render() {
        if (this.isLoading) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        return html`
            <data-form
                .data=${this.variableSet}
                .config="${this._config}">
            </data-form>`;
    }

}

customElements.define("variable-set-view", VariableSetView);
