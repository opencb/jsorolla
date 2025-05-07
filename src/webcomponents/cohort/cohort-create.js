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
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import Types from "../commons/types.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/tool-header.js";
import "../commons/filters/catalog-search-autocomplete.js";
import LitUtils from "../commons/utils/lit-utils";


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
            mode: {
                type: String
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.cohort = {};
        this.annotationSet = {};
        this.isLoading = false;
        this.displayConfigDefault = {
            buttonsVisible: true,
            buttonOkText: "Create",
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            defaultValue: "",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        this.cohort = {...this.cohort};
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear cohort",
            message: "Are you sure to clear?",
            ok: () => {
                this.cohort = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            includeResult: true
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.cohorts()
            .create(this.cohort, params)
            .then(() => {
                this.cohort = {};
                this._config = this.getDefaultConfig();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "New Cohort",
                    message: "cohort created correctly"
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "cohortCreate", this.cohort, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this.cohort}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: this.displayConfig || this.displayConfigDefault,
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
                                helpMessage: "short Sample id",
                            },
                        },
                        // TODO we need first to support ID copy into the autocomplete elements.
                        {
                            title: "Sample IDs",
                            field: "samples",
                            type: "custom",
                            display: {
                                render: (samples, dataFormFilterChange) => {
                                    const sampleFormatter = value => {
                                        return value?.split(",").map(sample => {
                                            return {id: sample};
                                        });
                                    };

                                    const handleSampleFilterChange = e => {
                                        dataFormFilterChange(e.detail.value ? sampleFormatter(e.detail.value) :[]);
                                    };

                                    return html `
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
                // {
                //     title: "Annotations Sets",
                //     elements: [
                //         {
                //             field: "annotationSets",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: cohort => html`

                //                 `
                //             }
                //         }
                //     ]
                // }
            ],
        });
    }

}

customElements.define("cohort-create", CohortCreate);
