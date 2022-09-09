/* select
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
import UtilsNew from "./../../../core/utilsNew.js";
import NotificationUtils from "../../commons/utils/notification-utils";
import FormUtils from "../../commons/forms/form-utils";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";


export default class RdTieringAnalysis extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            title: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.clinicalAnalysis = {};
        this.updateParams = {};
        this.config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysis = {
                ...this.clinicalAnalysis,
                job: {
                    id: `rd-tiering-${UtilsNew.getDatetime()}`
                }
            };
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "id":
                this.updateParams = FormUtils
                    .updateScalar(this._interpretation, this.interpretation, this.updateParams, param, e.detail.value);
                break;
            case "panels.id":
                this.updateParams = FormUtils
                    .updateObjectArray(this._interpretation, this.interpretation, this.updateParams, param, e.detail.value, e.detail.data);
                break;
        }
        // Enable this only when a dynamic property in the config can change
        // this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            clinicalAnalysis: this.clinicalAnalysis.id,
            panels: this.clinicalAnalysis.panels.map(panel => panel.id)
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...this.clinicalAnalysis.job
        };

        if (UtilsNew.isNotEmpty(toolParams)) {
            this.opencgaSession.opencgaClient.clinical().runInterpreterTiering(toolParams, params)
                .then(() => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                        title: "RD Tiering launched",
                        message: "RD Tiering has been launched successfully",
                    });
                })
                .catch(errorResponse => {
                    console.log(errorResponse);
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, errorResponse);
                });
        }
    }

    render() {
        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this.config}"
                .updateParams="${this.updateParams}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "rd-tiering-interpretation",
            title: "RD Tiering Interpretation",
            // icon: "fas fa-edit",
            description: "RD Tiering Interpretation Analysis",
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Clinical Analysis ID",
                            type: "custom",
                            display: {
                                render: clinicalAnalysis => {
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${clinicalAnalysis?.id}"
                                            .resource="${"CLINICAL_ANALYSIS"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{multiple: false, disabled: !!clinicalAnalysis.id}}"
                                            @filterChange="${e => this.onFilterChange(e)}">
                                        </catalog-search-autocomplete>`;
                                }
                            },
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: panels => {
                                    const panelLock = !!this.clinicalAnalysis?.panelLock;
                                    const panelList = panelLock ? this.clinicalAnalysis.panels : this.opencgaSession.study?.panels;
                                    return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${panelList}"
                                            .panel="${panels?.map(p => p.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            .showSelectedPanels="${false}"
                                            .classes="${this.updateParams.panels ? "updated" : ""}"
                                            .disabled="${panelLock}"
                                            @filterChange="${e => this.onFieldChange(e, "panels.id")}">
                                        </disease-panel-filter>
                                    `;
                                },
                            }
                        },
                    ]
                },
                {
                    title: "Job Info",
                    elements: [
                        {
                            title: "Job ID",
                            field: "job.id",
                            type: "input-text",
                            display: {
                                disabled: true,
                            },
                        },
                        {
                            title: "Description",
                            field: "job.tags",
                            type: "input-text",
                            display: {
                                placeholder: "Add job tags...",
                            },
                        },
                        {
                            title: "Description",
                            field: "job.description",
                            type: "input-text",
                            display: {
                                rows: 2,
                                placeholder: "Add a job description...",
                            },
                        },
                    ]
                }
            ]
        };
    }

}

customElements.define("rd-tiering-analysis", RdTieringAnalysis);
