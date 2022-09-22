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
import FormUtils from "../../commons/forms/form-utils";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import AnalysisUtils from "../../commons/analysis/analysis-utils";


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
            toolParams: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            title: {
                type: String
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "rd-tiering-interpretation";
        this.ANALYSIS_TITLE = "RD Tiering Interpretation";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {...this.DEFAULT_TOOLPARAMS};
        this.clinicalAnalysis = {};
        // CAUTION: Panels inside clinicalAnalysis

        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // Save the initial clinicalAnalysis. Needed for onClear() method
            this.clinicalAnalysis = this.toolParams.clinicalAnalysis || {};
            this.toolParams = {
                ...this.DEFAULT_TOOLPARAMS,
                ...this.toolParams,
            };
            this.config = this.getDefaultConfig();
        }
    }

    check() {
        return !!this.toolParams.clinicalAnalysis;
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        if (param) {
            this.toolParams = FormUtils.createObject(this.toolParams, param, e.detail.value);
        }
        this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            clinicalAnalysis: this.toolParams.clinicalAnalysis.id,
            panels: this.toolParams.clinicalAnalysis.panels.map(panel => panel.id)
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };

        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient
                .clinical()
                .runInterpreterTiering(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...this.DEFAULT_TOOLPARAMS,
            clinicalAnalysis: {...this.clinicalAnalysis},
        };
        this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this.toolParams}"
                .config="${this.config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const params = [
            {
                title: "General Information",
                elements: [
                    {
                        title: "Clinical Analysis ID",
                        field: "clinicalAnalysisId",
                        type: "custom",
                        display: {
                            render: toolParams => html`
                                        <catalog-search-autocomplete
                                            .value="${toolParams?.clinicalAnalysis?.id}"
                                            .resource="${"CLINICAL_ANALYSIS"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{multiple: false, disabled: !!toolParams.clinicalAnalysis.id}}"
                                            @filterChange="${e => this.onFieldChange(e, "clinicalAnalysisId")}">
                                        </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Disease Panels",
                        field: "panels",
                        type: "custom",
                        display: {
                            render: panels => {
                                // Todo: check if its working
                                // Get whether disease panels can be modified or are fixed
                                const panelLock = !!this.clinicalAnalysis?.panelLock;
                                // Get the list of disease panels for the dropdown
                                const panelList = panelLock ? this.clinicalAnalysis.panels : this.opencgaSession.study?.panels;
                                return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${panelList}"
                                            .panel="${panels?.map(p => p.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            .showSelectedPanels="${false}"
                                            .classes="${this.clinicalAnalysis?.panels ? "updated" : ""}"
                                            .disabled="${panelLock}"
                                            @filterChange="${e => this.onFieldChange(e, "panels.id")}">
                                        </disease-panel-filter>
                                    `;
                            },
                        }
                    },
                ],
            }
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.ANALYSIS_TITLE,
            "Executes an RD Tiering Interpreation analysis job",
            params,
            this.check()
        );
    }

}

customElements.define("rd-tiering-analysis", RdTieringAnalysis);
