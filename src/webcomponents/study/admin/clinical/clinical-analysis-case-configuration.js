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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../../core/utils-new.js";
import NotificationUtils from "../../../commons/utils/notification-utils.js";
import LitUtils from "../../../commons/utils/lit-utils.js";
import "../../../commons/forms/data-form.js";
import "../../../commons/filters/catalog-search-autocomplete.js";
import "../../../commons/filters/consequence-type-select-filter.js";

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
        this._studyConfiguration = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            // perform a deep clone to avoid modifying the original object
            this._studyConfiguration = UtilsNew.objectClone(this.opencgaSession.study?.internal?.configuration?.clinical || {});
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    onFieldChange() {
        this._studyConfiguration = {...this._studyConfiguration};
        this.requestUpdate();
    }

    onSubmit() {
        // this.opencgaSession.opencgaClient.clinical()
        //     .updateClinicalConfiguration(this._toolParams.body, params)
        //     .then(() => {
        //         NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
        //             title: `${this.TITLE} Update`,
        //             message: `${this.TITLE} has been successfully updated`,
        //         });
        //         // If the configuration has been updated, dispatch a study update request
        //         LitUtils.dispatchCustomEvent(this, "studyUpdateRequest", UtilsNew.objectClone(this._toolParams.study));
        //     });
    }

    render() {
        if (!this.opencgaSession || !this.opencgaSession.study) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._studyConfiguration}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @submit="${event => this.onSubmit(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: true,
                buttonOkText: "Save Configuration",
                buttonClearText: "",
                defaultLayout: "horizontal",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Clinical Analysis Configuration",
                    elements: [
                        {
                            title: "Status",
                            field: "status",
                            type: "object-list",
                            display: {
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
                                        placeholder: "E.g. PENDING_REVIEW",
                                        helpMessage: "Unique identifier for the new status. Users can use this ID to refer to the status in the clinical workflow.",
                                    },
                                },
                                {
                                    title: "Status Type",
                                    field: "status[].type",
                                    type: "select",
                                    allowedValues: ["NOT_STARTED", "ACTIVE", "DONE", "CLOSED", "INCONCLUSIVE", "REJECTED"],
                                    display: {
                                        placeholder: "Select a status type",
                                        helpMessage: "Select a type of status from the list. This will determine how the status is interpreted in the clinical workflow.",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "status[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description for this status...",
                                        helpMessage: "Provide a brief description of the status. This will help users understand the purpose of this status in the clinical workflow.",
                                    },
                                },
                            ],
                        },
                        {
                            title: "Priorities",
                            field: "priorities",
                            type: "object-list",
                            display: {
                                collapsedUpdate: false,
                                maxNumItems: 10,
                                view: status => html`<div>${status.id} - ${status?.type}</div>`,
                            },
                            elements: [
                                {
                                    title: "Priority ID",
                                    field: "priorities[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "E.g. HIGH_PRIORITY",
                                        helpMessage: "Unique identifier for the new priority. Users can use this ID to refer to the priority in the clinical workflow.",
                                    },
                                },
                                {
                                    title: "Priority Rank",
                                    field: "priorities[].rank",
                                    type: "input-num",
                                    display: {
                                        helpMessage: "Rank of the priority. Lower numbers indicate higher priority. For example, 1 is the highest priority, so it should be used for urgent cases.",
                                    },
                                },
                                {
                                    title: "Use as default priority",
                                    field: "priorities[].defaultPriority",
                                    type: "toggle-switch",
                                    display: {
                                        helpMessage: "If enabled, this priority will be used as the default priority for new clinical analyses. Only one priority can be set as default.",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "priorities[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description...",
                                        helpMessage: "Provide a brief description of the priority. This will help users understand the purpose of this priority in the clinical workflow.",
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
