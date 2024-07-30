/*
 * Copyright 2015-2024 OpenCB
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
            toolParams: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "rd-tiering";
        this.ANALYSIS_TITLE = "RD Tiering Interpretation";
        this.ANALYSIS_DESCRIPTION = "Executes an RD Tiering Interpreation analysis job";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS)
        };

        this.clinicalAnalysis = "";
        this.diseasePanelIds = "";
        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // Save the initial clinicalAnalysis. Needed for onClear() method
            this.clinicalAnalysis = this.toolParams.clinicalAnalysis || "";
            this.diseasePanelIds = this.toolParams.panels || "";
        }
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this.toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
            this.config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    check() {
        return null;
    }

    onFieldChange() {
        this.toolParams = {...this.toolParams};
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            clinicalAnalysis: this.toolParams.clinicalAnalysis || "",
            panels: (this.toolParams.panels || "").split(","),
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.clinical()
                .runInterpreterTiering(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            // If a clinical analysis ID was passed (probably because we are in the interpreter) then we need to keep it
            clinicalAnalysis: this.clinicalAnalysis,
            panels: this.diseasePanelIds,
        };
        this.config = this.getDefaultConfig();
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
                title: "Input Parameters",
                elements: [
                    {
                        title: "Clinical Analysis ID",
                        field: "clinicalAnalysis",
                        type: "custom",
                        display: {
                            render: (clinicalAnalysis, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .value="${clinicalAnalysis}"
                                    .resource="${"CLINICAL_ANALYSIS"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!clinicalAnalysis}}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        // QUESTION: not sure how panels need to be retrieved or how it works.
                        //   - Once the clinical analysis id is selected, query its panels?
                        //   - All the studies have panels?
                        title: "Disease Panels",
                        field: "panels",
                        type: "custom",
                        display: {
                            render: (panels, dataFormFilterChange) => {
                                // Get whether disease panels can be modified or are fixed
                                const casePanelLock = !!this.clinicalAnalysis;
                                // Get the list of disease panels for the dropdown
                                let diseasePanels = [];
                                if (casePanelLock) {
                                    for (const panelId of (panels || "").split(",")) {
                                        const diseasePanel = this.opencgaSession.study?.panels?.find(p => p.id === panelId);
                                        if (diseasePanel) {
                                            diseasePanels.push(diseasePanel);
                                        }
                                    }
                                } else {
                                    diseasePanels = this.opencgaSession.study?.panels;
                                }
                                return html`
                                    <select-field-filter
                                        .data="${diseasePanels}"
                                        .value=${panels || ""}
                                        .config="${{
                                            multiple: true,
                                            liveSearch: diseasePanels?.length > 5,
                                            disabled: casePanelLock,
                                            separator: "\n"
                                        }}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </select-field-filter>
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
            this.ANALYSIS_DESCRIPTION,
            params,
            this.check(),
            this.config
        );
    }

}

customElements.define("rd-tiering-analysis", RdTieringAnalysis);
