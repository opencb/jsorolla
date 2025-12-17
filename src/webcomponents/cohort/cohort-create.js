/**
 * Copyright 2015-2022 OpenCB
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
import NotificationUtils from "../commons/utils/notification-utils.js";
import LitUtils from "../commons/utils/lit-utils";
import "../commons/tool-header.js";
import "../commons/filters/catalog-search-autocomplete.js";


export default class CohortCreate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._cohort = {};
        this._loading = false;
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this._loading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange() {
        this._cohort = {...this._cohort};
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear cohort",
            message: "Are you sure to clear?",
            ok: () => {
                this._cohort = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.cohorts()
            .create(this._cohort, {
                study: this.opencgaSession.study.fqn,
                includeResult: true,
            })
            .then(() => {
                LitUtils.dispatchCustomEvent(this, "cohortCreate", null, this._cohort);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "Cohort created correctly.",
                });
                this._cohort = {};
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        if (this._loading) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        return html`
            <data-form
                .data="${this._cohort}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: true,
                buttonOkText: "Create",
                style: "margin: 10px",
                titleWidth: 3,
                defaultLayout: "horizontal",
                defaultValue: "",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Cohort ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: "Unique identifier for the Cohort",},
                        },
                        {
                            title: "Cohort Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add a name...",
                                helpMessage: "Descriptive name for the Cohort.",
                            },
                        },
                        {
                            title: "Sample IDs",
                            field: "samples",
                            type: "custom",
                            display: {
                                render: (samples, dataFormFilterChange) => {
                                    const sampleFormatter = value => {
                                        return value?.split(",").map(sampleId => {
                                            return {
                                                id: sampleId,
                                            };
                                        });
                                    };

                                    const handleSampleFilterChange = e => {
                                        dataFormFilterChange(e.detail.value ? sampleFormatter(e.detail.value) : []);
                                    };

                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${samples?.map(sample => sample.id).join(",")}"
                                            .resource="${"SAMPLE"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            @filterChange="${e => handleSampleFilterChange(e)}">
                                        </catalog-search-autocomplete>
                                    `;
                                }
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a cohort description...",
                            },
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            type: "input-tags",
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "object",
                            elements: [
                                {
                                    title: "ID",
                                    field: "status.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ID",
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "status.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("cohort-create", CohortCreate);
