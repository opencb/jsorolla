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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import "../commons/view/data-form.js";


export default class OpencgaCohortView extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cohort: {
                type: Object
            },
            cohortId: {
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
        this.cohort = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }
        if (changedProperties.has("cohort")) {
            this.cohortObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        super.update(changedProperties);
    }

    configObserver() {
    }

    // TODO recheck
    cohortIdObserverOld() {
        console.warn("cohortIdObserver");
        if (this.file !== undefined && this.file !== "") {
            const params = {
                study: this.opencgaSession.study.fqn,
                includeIndividual: true
            };
            const _this = this;
            this.opencgaSession.opencgaClient.cohort().info(this.file, params)
                .then(function (response) {
                    if (response.response[0].id === undefined) {
                        response.response[0].id = response.response[0].name;
                    }
                    _this.cohort = response.response[0].result[0];
                    console.log("_this.cohort", _this.cohort);
                    _this.requestUpdate();
                })
                .catch(function (reason) {
                    console.error(reason);
                });
        }
    }

    cohortIdObserver() {
        if (this.cohortId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn,
                includeIndividual: true
            };
            let error;
            this.opencgaSession.opencgaClient.cohorts().info(this.file, params)
                .then(res => {
                    this.cohort = res.responses[0].results[0];
                })
                .catch(reason => {
                    this.cohort = {};
                    error = reason;
                })
                .finally(() => {
                    this._config = {...this.getDefaultConfig(), ...this._config};
                    this.requestUpdate();
                    this.notify(error);
                });
        }
    }

    cohortObserver() {
        console.log("cohortObserver");

    }

    onFilterChange(e) {
        this.cohortId = e.detail.value;
        this.file = e.detail.value;
    }

    notify(error) {
        this.dispatchEvent(new CustomEvent("cohortSearch", {
            detail: {
                value: this.cohort,
                status: {
                    // true if error is defined and not empty
                    error: !!error,
                    message: error
                }
            },
            bubbles: true,
            composed: true
        }));
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-",
                labelAlign: "left"
            },
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: cohort => !cohort?.id
                    },
                    elements: [
                        {
                            name: "Cohort ID",
                            field: "cohortId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <cohort-id-autocomplete
                                        .value="${this.cohort?.id}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config=${{
                                            addButton: false,
                                            multiple: false
                                        }}
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </cohort-id-autocomplete>`
                            }
                        }
                    ]
                },
                {
                    title: "General",
                    collapsed: false,
                    display: {
                        visible: cohort => cohort?.id
                    },
                    elements: [
                        // available types: basic (optional/default), complex, list (horizontal and vertical), table, plot, custom
                        {
                            name: "Cohort Id",
                            field: "id"
                        },
                        {
                            name: "Creation date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => {
                                    return html`${UtilsNew.dateFormatter(field)}`;
                                }
                            }
                        }
                    ]
                }
            ]
        };
    }

    render() {
        if (!this.cohort?.id && this.cohortId) {
            return html`
                <h2>Loading info... </h2>
            `;
        }

        return html`
            <data-form
                .data=${this.cohort}
                .config="${this._config}">
            </data-form>
        `;
    }

}

customElements.define("opencga-cohort-view", OpencgaCohortView);

