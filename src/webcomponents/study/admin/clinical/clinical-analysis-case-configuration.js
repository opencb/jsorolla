/*
 * Copyright 2015-2016 OpenCB
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
import UtilsNew from "../../../../core/utils-new.js";
import NotificationUtils from "../../../commons/utils/notification-utils.js";
import LitUtils from "../../../commons/utils/lit-utils.js";
import "../../../commons/forms/data-form.js";
import "../../../commons/filters/catalog-search-autocomplete.js";
import "../../../commons/filters/consequence-type-select-filter.js";
import Types from "../../../commons/types";

export default class ClinicalAnalysisConfigurationUpdate extends LitElement {

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
            }
        };
    }

    #init() {
        this.displayConfig = {};

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.studyConfiguration = this.opencgaSession.study?.internal?.configuration?.clinical || {};
        this._config = this.getDefaultConfig();
        // this.requestUpdate();
    }
    //
    // onComponentIdObserver(e) {
    //     this._individual = UtilsNew.objectClone(e.detail.value);
    //     this._config = this.getDefaultConfig();
    //     this.requestUpdate();
    // }

    onSubmit() {
        debugger
        this.opencgaSession.opencgaClient.clinical()
            .updateClinicalConfiguration(this._toolParams.body, params)
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `${this.TITLE} Update`,
                    message: `${this.TITLE} has been successfully updated`,
                });
                // If the configuration has been updated, dispatch a study update request
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest", UtilsNew.objectClone(this._toolParams.study));
            });
    }

    render() {
        return html`
            <data-form
                .data="${this.studyConfiguration}"
                .config="${this._config}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: this.displayConfig,
            sections: [
                {
                    title: "Clinical Analysis Configuration",
                    elements: [
                        {
                            title: "Status",
                            field: "status",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: false,
                                maxNumItems: 25,
                                view: status => html`<div>${status.id} - ${status?.type}</div>`,
                            },
                            elements: [
                                {
                                    title: "Status ID",
                                    field: "status[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    },
                                },
                                {
                                    title: "Status Type",
                                    field: "status[].type",
                                    type: "select",
                                    allowedValues: ["NOT_STARTED", "ACTIVE", "DONE", "CLOSED", "INCONCLUSIVE", "REJECTED"],
                                    display: {
                                        placeholder: "Select a status..."
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "status[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    },
                                },
                            ],
                        },
                        {
                            title: "Priorities",
                            field: "priorities",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: false,
                                maxNumItems: 10,
                                view: status => html`<div>${status.id} - ${status?.type}</div>`,
                            },
                            elements: [
                                {
                                    title: "Status ID",
                                    field: "status[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    },
                                },
                                {
                                    title: "Status Type",
                                    field: "status[].type",
                                    type: "select",
                                    allowedValues: ["NOT_STARTED", "ACTIVE", "DONE", "CLOSED", "INCONCLUSIVE", "REJECTED"],
                                    display: {
                                        placeholder: "Select a status..."
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "status[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }


}

customElements.define("clinical-analysis-case-configuration", ClinicalAnalysisConfigurationUpdate);
