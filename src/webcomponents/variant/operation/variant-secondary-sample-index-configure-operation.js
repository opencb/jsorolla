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
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import "../../commons/filters/consequence-type-select-filter.js";

export default class VariantSecondarySampleIndexConfigureOperation extends LitElement {

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
        this.TOOL = "VariantSecondarySampleConfigureIndex";
        this.TITLE = "Variant Secondary Sample Index Configure Operation";
        this.DESCRIPTION = "Executes a variant secondary sample index configure operation job";

        this.studyId = "";
        this.study = {};
        this.studyConfiguration = {};
        this.DEFAULT_TOOLPARAMS = {};
        this._toolParams = {};
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
        this.studyConfiguration = this.study?.internal?.configuration?.variantEngine?.sampleIndex || this.opencgaSession.study?.internal?.configuration?.variantEngine?.sampleIndex || {};
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
            study: this.study?.fqn || this.opencgaSession.study.fqn,
            skipRebuild: false,
            body: UtilsNew.objectClone(this.studyConfiguration),
        };
        this.config = this.getDefaultConfig();
    }

    onStudyChange(e) {
        this.studyId = e.detail.value;
        this.studyIdObserver();
    }

    check() {
        if (!this._toolParams.study) {
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
            skipRebuild: this._toolParams.skipRebuild || false,
            ...AnalysisUtils.fillJobParams(this._toolParams, this.TOOL),
        };
        AnalysisUtils.submit(
            this.TITLE,
            this.opencgaSession.opencgaClient.variantOperations()
                .configureVariantSecondarySampleIndex(this._toolParams.body, params),
            this,
        ).then(response => {
            if (response) {
                // If the configuration has been updated, dispatch a study update request
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest",
                    UtilsNew.objectClone(this._toolParams.study)
                );
            }
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
        const params = [
            {
                title: "Study Filter",
                elements: [
                    {
                        title: "Study",
                        field: "study",
                        type: "custom",
                        required: true,
                        display: {
                            render: study => html`
                                <catalog-search-autocomplete
                                    .value="${study}"
                                    .resource="${"STUDY"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!this.study}}"
                                    @filterChange="${e => this.onStudyChange(e, "study")}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                ],
            },
            {
                title: "Configuration Parameters",
                elements: [
                    {
                        title: "Skip Rebuild",
                        field: "skipRebuild",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Skip rebuilding the secondary sample variant index"
                            }
                        }
                    },
                    {
                        title: "Sample Index Configuration",
                        field: "body",
                        type: "custom",
                        display: {
                            render: (body, dataFormFilterChange) => html `
                                <json-editor
                                    .data="${body}"
                                    @fieldChange="${e => dataFormFilterChange(e.detail.value.json)}">
                                </json-editor>
                            `,
                        },
                    },
                ],
            },
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.TOOL,
            this.title ?? this.TITLE,
            this.DESCRIPTION,
            params,
            this.check(),
            {
                display: {
                    buttonsLayout: "top"
                },
                buttons: {
                    clearText: "Discard Changes",
                    okText: "Update",
                },
            },
        );
    }

}

customElements.define("variant-secondary-sample-index-configure-operation", VariantSecondarySampleIndexConfigureOperation);
