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
import AnalysisUtils from "../../commons/analysis/analysis-utils";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";


export default class IndividualRelatednessAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "individual-relatedness";
        this.ANALYSIS_TITLE = "Individual Relatedness";
        this.ANALYSIS_DESCRIPTION = "Compute a score to quantify relatedness between samples";

        this.DEFAULT_TOOLPARAMS = {
            minorAlleleFreq: "1000G:ALL>0.3",
        };
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.individual = "";
        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // This parameter will indicate if either an individual ID or a sample ID were passed as an argument
            this.individual = this.toolParams.individual || "";
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
        if (!this.toolParams.individuals && !this.toolParams.samples) {
            return {
                message: "You must select a sample or an individual",
                notificationType: "warning"
            };
        }
        return null;
    }

    onFieldChange(e) {
        this.toolParams = {...this.toolParams};
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            individuals: this.toolParams.individuals?.split(",") || [],
            samples: this.toolParams.samples?.split(",") || [],
            minorAlleleFreq: this.toolParams.minorAlleleFreq
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL)
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants()
                .runRelatedness(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            individual: this.individual,
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
                        title: "Select individuals",
                        field: "individuals",
                        type: "custom",
                        display: {
                            render: (individuals, dataFormFilterChange, updateParams, toolParams) => html `
                                <catalog-search-autocomplete
                                    .value="${individuals}"
                                    .resource="${"INDIVIDUAL"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: true, disabled: !!toolParams?.samples}}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Select samples",
                        field: "samples",
                        type: "custom",
                        display: {
                            render: (samples, dataFormFilterChange, updateParams, toolParams) => html `
                                <catalog-search-autocomplete
                                    .value="${samples}"
                                    .resource="${"SAMPLE"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: true, disabled: !!toolParams?.individuals}}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `
                        },
                    },
                ],
            },
            {
                title: "Configuration Parameters",
                elements: [
                    {
                        title: "Select minor allele frequency",
                        field: "minorAlleleFreq",
                        type: "input-text",
                        required: true,
                        display: {
                            help: {
                                text: "Format allowed is STUDY:COHORT{<|<=|>|>=}FREQUENCY, eg. 1000G:ALL>0.3"
                            }
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

customElements.define("individual-relatedness-analysis", IndividualRelatednessAnalysis);
