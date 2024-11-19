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
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";


export default class BcfToolsAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "gwas";
        this.ANALYSIS_TITLE = "GWAS";
        this.ANALYSIS_DESCRIPTION = "Executes a GWAS analysis job";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.config = this.getDefaultConfig();
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
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
        // FIXME decide if this must be displayed
        // if (!this.toolParams.caseCohort) {
        //     return {
        //         message: "You must select a cohort or sample",
        //         notificationType: "warning"
        //     };
        // }
        return null;
    }

    onFieldChange(e) {
        this.toolParams = {...this.toolParams};
        // Note: these parameters have been removed from the form
        // Check if changed param was controlCohort --> reset controlCohortSamples field
        // if (param === "controlCohort") {
        //     this.toolParams.controlCohortSamples = "";
        // }
        // Check if changed param was caseCohort --> reset caseCohortSamples field
        // if (param === "caseCohort") {
        //     this.toolParams.caseCohortSamples = "";
        // }
        // this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {

        const toolParams = {
            controlCohort: this.toolParams.controlCohort || "",
            // controlCohortSamples: this.toolParams.controlCohortSamples?.split(",") || [],
            // controlCohortSamplesAnnotation: this.toolParams.controlCohortSamplesAnnotation,
            caseCohort: this.toolParams.caseCohort || "",
            // caseCohortSamples: this.toolParams.caseCohortSamples?.split(",") || [],
            // caseCohortSamplesAnnotation: this.toolParams.caseCohortSamplesAnnotation,
            mode: this.toolParams.mode,
            fisherMode: this.toolParams.fisherMode,
            // phenotype: this.toolParams.phenotype,
            index: this.toolParams.index ?? false,
            indexScoreId: this.toolParams.indexScoreId,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.jobs()
                .(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
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
        const params= [
            {
                title: "Input Cohorts",
                elements: [
                    {
                        title: "Case Cohort",
                        field: "caseCohort",
                        type: "custom",
                        required: true,
                        display: {
                            render: (caseCohort, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .value="${caseCohort}"
                                    .resource="${"COHORT"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false}}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Control Cohort",
                        field: "controlCohort",
                        type: "custom",
                        display: {
                            render: (controlCohort, dataFormFilterChange) => {
                                return html`
                                    <catalog-search-autocomplete
                                        .value="${controlCohort}"
                                        .resource="${"COHORT"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            }
                        },
                    },
                ]
            },
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.ANALYSIS_TITLE,
            this.ANALYSIS_DESCRIPTION,
            this._config.params,
            this.check(),
            this.config
        );
    }

}

customElements.define("bcftools-analysis", BcfToolsAnalysis);
