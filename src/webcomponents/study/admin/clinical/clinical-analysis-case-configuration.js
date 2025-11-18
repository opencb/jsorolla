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
import WebUtils from "../../../commons/utils/web-utils.js";
import "../../../commons/forms/data-form.js";

export default class ClinicalAnalysisCaseConfiguration extends LitElement {

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
            // 1. perform a deep clone to avoid modifying the original object
            this._studyConfiguration = UtilsNew.objectClone(this.opencgaSession.study?.internal?.configuration?.clinical || {});

            // 2. fix the report.library field to convert it into an array of key-value objects
            if (this._studyConfiguration.report?.library) {
                this._studyConfiguration.report.library = WebUtils.parseParametersObject(this._studyConfiguration.report.library);
            }
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    onFieldChange() {
        this._studyConfiguration = {
            ...this._studyConfiguration,
        };
        this.requestUpdate();
    }

    onSubmit() {
        // 1. prepare the data to be submitted to opencga. note that we need to convert back the report.library field
        // into an object using the key-value pairs from the array
        const data = {
            ...this._studyConfiguration,
            report: {
                ...this._studyConfiguration.report,
                library: WebUtils.formatParametersList(this._studyConfiguration.report?.library || []),
            },
        };

        // 2. update the clinical configuration
        this.opencgaSession.opencgaClient.clinical()
            .updateClinicalConfiguration(data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `The Case configuration of study ${this.opencgaSession.study.name || this.opencgaSession.study.fqn} has been successfully updated`,
                });

                // If the configuration has been updated, dispatch a study update request
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest");
            })
            .catch(response => {
                console.error(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
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
            title: "Clinical Case Configuration",
            display: {
                buttonsVisible: true,
                buttonOkText: "Save Interpretation Configuration",
                buttonClearText: "",
                defaultLayout: "horizontal",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "General Configuration",
                    elements: [
                        {
                            title: "Case Status",
                            description: "Configure the status types that can be assigned to clinical cases. Each status has a unique ID and must be associated with a type.",
                            field: "status",
                            type: "object-list",
                            display: {
                                collapsedUpdate: false,
                                itemAddText: "Add Status",
                                maxNumItems: 25,
                                view: status => html`
                                    <div class="d-flex flex-row align-items-center gap-2">
                                        <span class="fw-bold">${status.id || ""}</span>
                                        <span class="badge bg-secondary">${status.type}</span>
                                    </div>
                                `,
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
                            title: "Case Priorities",
                            description: "Configure the priorities that can be assigned to clinical cases. Each priority has a unique ID and uses a rank to determine its importance. Only one priority can be set as default.",
                            field: "priorities",
                            type: "object-list",
                            display: {
                                collapsedUpdate: false,
                                itemAddText: "Add Priority",
                                maxNumItems: 10,
                                view: priority => html`
                                    <div class="d-flex flex-row align-items-center gap-2">
                                        <span class="fw-bold">${priority.id || ""}</span>
                                        ${priority?.rank ? html`<span>(rank: ${priority.rank})</span>` : nothing}
                                        ${priority?.defaultPriority ? html`<span class="badge bg-primary">DEFAULT</span>` : nothing}
                                    </div>
                                `,
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
                        {
                            title: "Case Flags",
                            description: "Configure the flags that can be assigned to clinical cases to highlight specific aspects of it.",
                            field: "flags",
                            type: "object-list",
                            display: {
                                collapsedUpdate: false,
                                itemAddText: "Add Flag",
                                maxNumItems: 25,
                                view: flag => html`
                                    <span class="fw-bold">${flag.id || ""}</span>
                                `,
                            },
                            elements: [
                                {
                                    title: "Flag ID",
                                    field: "flags[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "E.g. HIGH_RISK",
                                        helpMessage: "Unique identifier for the new flag.",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "flags[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description for this flag...",
                                        helpMessage: "Provide a brief description of the flag.",
                                    },
                                },
                            ],
                        },
                        {
                            title: "Tiers",
                            description: "Configure the tiers that can be assigned to variant evidences in the case.",
                            field: "tiers",
                            type: "object-list",
                            display: {
                                collapsedUpdate: false,
                                itemAddText: "Add Tier",
                                maxNumItems: 10,
                                view: tier => html`
                                    <div class="d-flex flex-row align-items-center gap-2">
                                        <span class="fw-bold">${tier.id || ""}</span>
                                        ${tier?.rank ? html`<span>(rank: ${tier.rank})</span>` : nothing}
                                    </div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Tier ID",
                                    field: "tiers[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "E.g. TIER_1",
                                        helpMessage: "Unique identifier for the new tier. Users can use this ID to refer to the tier when reviewing evidences in the case interpreter.",
                                    },
                                },
                                {
                                    title: "Tier Rank",
                                    field: "tiers[].rank",
                                    type: "input-num",
                                    display: {
                                        helpMessage: "Rank of the tier. Lower numbers indicate higher tier. For example, 1 is the highest tier.",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "tiers[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description for this tier...",
                                        helpMessage: "Provide a brief description of the tier.",
                                    },
                                },
                            ],
                        },
                        {
                            title: "Consents",
                            description: "Configure the consents that can be assigned to clinical cases.",
                            field: "consents",
                            type: "object-list",
                            display: {
                                collapsedUpdate: false,
                                itemAddText: "Add Consent",
                                maxNumItems: 25,
                                view: consent => html`
                                    <div class="">
                                        <span class="fw-bold">${consent.name || consent.id || ""}</span>
                                    </div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Consent ID",
                                    field: "consents[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "E.g. CONSENT_1",
                                        helpMessage: "Unique identifier for the consent.",
                                    },
                                },
                                {
                                    title: "Consent Name",
                                    field: "consents[].name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "E.g. Consent for research",
                                        helpMessage: "Name of the consent. This will be displayed in the clinical case.",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "consents[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description for this consent...",
                                        helpMessage: "Provide a brief description of the consent. This will help users understand the purpose of this consent in the clinical workflow.",
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    title: "Report Configuration",
                    elements: [
                        {
                            title: "Title",
                            description: "Default title for clinical reports generated from clinical cases.",
                            field: "report.title",
                            type: "input-text",
                            display: {
                                placeholder: "E.g. Clinical Report",
                            },
                        },
                        {
                            title: "Logo",
                            description: "URL of the logo to be displayed in clinical reports.",
                            field: "report.logo",
                            type: "input-text",
                        },
                        {
                            title: "Library",
                            description: "Key-value pairs of predefined stock phrases or sections that can be included in clinical reports.",
                            field: "report.library",
                            type: "object-list",
                            display: {
                                itemId: "name",
                                itemAddText: "Add Library Item",
                                itemsNotFoundText: "No library entries defined.",
                                view: libraryItem => html`
                                    <div class="">
                                        <b>${libraryItem.name || ""}</b>${libraryItem.value ? html`: ${libraryItem.value}` : nothing}
                                    </div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Name",
                                    field: "report.library[].name",
                                    type: "input-text",
                                    display: {
                                        helpMessage: "A short unique name for the library entry.",
                                        placeholder: "E.g. FAMILY_HISTORY",
                                    },
                                },
                                {
                                    title: "Full Text",
                                    field: "report.library[].value",
                                    type: "input-text",
                                    display: {
                                        helpMessage: "The full text content associated with the library entry.",
                                        placeholder: "E.g. The patient has a family history of cardiovascular diseases...",
                                        rows: 4,
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

customElements.define("clinical-analysis-case-configuration", ClinicalAnalysisCaseConfiguration);
