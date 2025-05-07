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
import UtilsNew from "../../../core/utils-new.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import "../../commons/filters/consequence-type-select-filter.js";

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
                type: Object,
            },
            toolParams: {
                type: Object,
            },
            title: {
                type: String,
            },
        };
    }

    #init() {
        this.TOOL = "ClinicalAnalysisConfigurationOperation";
        this.TITLE = "Clinical Analysis Configuration Operation";
        this.DESCRIPTION = "Executes a variant secondary sample index configure operation job";

        this.studyId = "";
        this.study = {};
        this.studyConfiguration = {};
        this.DEFAULT_TOOLPARAMS = {};
        this._toolParams = {};
        this.displayConfigDefault = {
            buttonsLayout: "top",
        };
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams") || changedProperties.has("opencgaSession")) {
            // Note: 'study' is the id of the study, not the object.
            // It is named 'study' for consistency with the endpoint query param
            if (this.toolParams?.study && this.toolParams.study !== this._toolParams?.study) {
                this.studyId = this.toolParams.study;
                this.studyIdObserver();
            } else {
                this.#initToolParams();
            }
        }

        super.update(changedProperties);
    }

    studyIdObserver() {
        if (this.studyId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.studies()
                .info(this.studyId)
                .then(response => {
                    this.study = response.responses[0].results[0];
                    this.#initToolParams();
                    this.requestUpdate();
                })
                .catch(reason => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                });
        }
    }

    #initToolParams() {
        this.studyConfiguration = this.study?.internal?.configuration?.clinical || this.opencgaSession.study?.internal?.configuration?.clinical || {};
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
            study: this.study?.fqn || this.opencgaSession.study.fqn,
            body: UtilsNew.objectClone(this.studyConfiguration),
        };
        this.config = this.getDefaultConfig();
    }

    onStudyChange(e) {
        this.studyId = e.detail.value;
        this.studyIdObserver();
    }

    check() {
        if (!this._toolParams?.study) {
            return {
                message: "Study is a mandatory parameter, please select one."
            };
        }
        return null;
    }

    onClear() {
        this.#initToolParams();
        this.requestUpdate();
    }

    onSubmit() {
        const params = {
            study: this._toolParams.study,
        };
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
        if (this._toolParams.body) {
            return html`
                <data-form
                    .data="${this._toolParams}"
                    .config="${this.config}"
                    @clear="${this.onClear}"
                    @submit="${this.onSubmit}">
                </data-form>
            `;
        }
    }

    getDefaultConfig() {
        const sections = [
            {
                title: "Study Filter",
                elements: [
                    {
                        title: "Study",
                        field: "study",
                        type: "custom",
                        required: true,
                        display: {
                            render: study => {
                                // CAUTION 20240901 Vero: refactor this to use this.allowedValues. Otherwise,
                                //  if enabled, it will only display the studies within the current project.
                                //  Disabled for now for consistency with the rest of study admin operations.
                                return html`
                                    <catalog-search-autocomplete
                                        .value="${study}"
                                        .resource="${"STUDY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false, disabled: !!this.study}}"
                                        @filterChange="${e => this.onStudyChange(e, "study")}">
                                    </catalog-search-autocomplete>
                                `;
                            }
                        },
                    }
                ],
            },
            {
                title: "Configuration Parameters",
                elements: [
                    {
                        title: "Clinical Analysis Configuration",
                        field: "body",
                        type: "custom",
                        display: {
                            render: (body, dataFormFilterChange) => {
                                return html `
                                    <json-editor
                                        .data="${body}"
                                        @fieldChange="${e => dataFormFilterChange(e.detail.value.json)}">
                                    </json-editor>
                                `;
                            }
                        }
                    },
                ],
            }
        ];

        return {
            title: this.title ?? this.TITLE,
            description: this.DESCRIPTION,
            display: this.displayConfig || this.displayConfigDefault,
            buttons: {
                clearText: "Discard Changes",
                okText: "Update",
            },
            sections: sections,
        };
    }

}

customElements.define("clinical-analysis-configuration-update", ClinicalAnalysisConfigurationUpdate);
