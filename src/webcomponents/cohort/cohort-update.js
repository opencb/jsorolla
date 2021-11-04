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
import UtilsNew from "./../../core/utilsNew.js";
import "../commons/tool-header.js";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";

export default class CohortUpdate extends LitElement {

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
        console.log("init variable");
        this.cohort = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this.updateParams = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("cohort")) {
            this.cohortObserver();
        }

        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }

        super.update(changedProperties);
    }

    cohortObserver() {
        // When updating wee need to keep a private copy of the original object
        if (this.cohort) {
            this._cohort = JSON.parse(JSON.stringify(this.cohort));
        }
    }

    cohortIdObserver() {
        if (this.opencgaSession && this.cohortId) {
            const query = {
                study: this.opencgaSession.study.fqn
            };
            this.opencgaSession.opencgaClient.cohorts().info(this.cohortId, query)
                .then(response => {
                    this.cohort = response.responses[0].results[0];
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "id":
            case "name":
            case "description":
            case "type":
                this.updateParams = FormUtils.updateScalar(
                    this._cohort,
                    this.cohort,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value);
                break;
            case "status.name":
            case "status.description":
                this.updateParams = FormUtils.updateObjectWithProps(
                    this._cohort,
                    this.cohort,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value);
                break;
        }
        this.requestUpdate();
    }


    onClear() {
        this._config = this.getDefaultConfig();
        this.cohort = JSON.parse(JSON.stringify(this._cohort));
        this.updateParams = {};
        this.cohortId = "";
    }

    onSubmit(e) {
        this.opencgaSession.opencgaClient.cohorts().update(this.cohort.id, this.updateParams, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this._cohort = JSON.parse(JSON.stringify(this.cohort));
                this.updateParams = {};
                FormUtils.showAlert("Edit Cohort", "Cohort updated correctly.", "success");
            })
            .catch(err => {
                console.error(err);
            });
    }

    render() {
        return html`
            <data-form
                .data=${this.cohort}
                .config="${this._config}"
                .updateParams=${this.updateParams}
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear=${this.onClear}
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Update"
            },
            display: {
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                help: {
                    mode: "block"
                }
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Cohort ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: true,
                                help: {
                                    text: "short Sample id for thehis as;lsal"
                                },
                                validation: {

                                }
                            }
                        },
                        {
                            name: "Cohort Type",
                            field: "type",
                            type: "select",
                            allowedValues: ["CASE_CONTROL", "CASE_SET", "CONTROL_SET", "PAIRED", "PAIRED_TUMOR", "AGGREGATE", "TIME_SERIES", "FAMILY", "TRIO", "COLLECTION"],
                            display: {}
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "e.g. Homo sapiens, ..."
                            }
                        },
                        {
                            name: "Status name",
                            field: "status.name",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Cohort description..."
                            }
                        },
                        {
                            name: "Status Description",
                            field: "status.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Cohort description..."
                            }
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("cohort-update", CohortUpdate);
