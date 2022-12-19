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
import FormUtils from "../../commons/forms/form-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";


export default class GwasAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "gwas";
        this.ANALYSIS_TITLE = "GWAS";
        this.ANALYSIS_DESCRIPTION = "Executes a GWAS analysis job";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.config = this.getDefaultConfig();
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
        // TODO: check if there are more required params for GWAS analysis
        return !!this.toolParams.controlCohort || !!this.toolParams.caseCohort;
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        // if (param) {
        //     this.toolParams = FormUtils.createObject(this.toolParams, param, e.detail.value);
        // }

        // Check if changed param was controlCohort --> reset controlCohortSamples field
        if (param === "controlCohort") {
            this.toolParams.controlCohortSamples = "";
        }
        // Check if changed param was caseCohort --> reset caseCohortSamples field
        if (param === "caseCohort") {
            this.toolParams.caseCohortSamples = "";
        }

        this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            controlCohort: this.toolParams.controlCohort || "",
            controlCohortSamples: this.toolParams.controlCohortSamples?.split(",") || [],
            controlCohortSamplesAnnotation: this.toolParams.controlCohortSamplesAnnotation,
            caseCohort: this.toolParams.caseCohort || "",
            caseCohortSamples: this.toolParams.caseCohortSamples?.split(",") || [],
            caseCohortSamplesAnnotation: this.toolParams.caseCohortSamplesAnnotation,
            mode: this.toolParams.mode,
            fisherMode: this.toolParams.fisherMode,
            index: this.toolParams.index ?? false,
            indexScoreId: this.toolParams.indexScoreId,
            phenotype: this.toolParams.phenotype,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants()
                .runGwas(toolParams, params),
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
        const params = [
            {
                title: "Case Cohort Parameters",
                elements: [
                    {
                        title: "Case Cohort",
                        field: "caseCohort",
                        type: "custom",
                        display: {
                            render: (caseCohort, dataFormFilterChange, updateParams, toolParams) => html`
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
                        title: "Case Cohort Samples",
                        field: "caseCohortSamples",
                        type: "custom",
                        display: {
                            render: (caseCohortSamples, dataFormFilterChange, updateParams, toolParams) => html`
                                <catalog-search-autocomplete
                                    .value="${caseCohortSamples}"
                                    .resource="${"SAMPLE"}"
                                    .query="${{include: "id,individualId", cohortIds: toolParams?.caseCohort}}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: true, disabled: !toolParams.caseCohort}}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },

                    },
                    {
                        title: "Case Cohort Sample Annotation",
                        field: "caseCohortSamplesAnnotation",
                        type: "input-text",
                    }
                ]
            },
            {
                title: "Control Cohort Parameters",
                elements: [
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
                    {
                        title: "Control Cohort Samples",
                        field: "controlCohortSamples",
                        type: "custom",
                        display: {
                            render: (controlCohortSamples, dataFormFilterChange, updateParams, toolParams) => html`
                                <catalog-search-autocomplete
                                    .value="${controlCohortSamples}"
                                    .resource="${"SAMPLE"}"
                                    .query="${{include: "id,individualId", cohortIds: toolParams?.controlCohort}}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: true, disabled: !this.toolParams.controlCohort}}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Control Cohort Sample Annotation",
                        field: "controlCohortSamplesAnnotation",
                        type: "input-text",
                    }
                ]
            },
            {
                title: "Configuration Parameters",
                elements: [
                    {
                        title: "Association test",
                        field: "method",
                        type: "select",
                        // defaultValue: "FISHER_TEST",
                        allowedValues: ["FISHER_TEST", "CHI_SQUARE_TEST"],
                    },
                    {
                        title: "Fisher mode",
                        field: "fisherMode",
                        type: "select",
                        // defaultValue: "GREATER",
                        allowedValues: ["GREATER", "LESS", "TWO_SIDED"],
                        display: {
                            disabled: this.toolParams?.method !== "FISHER_TEST",
                        },
                    },
                    {
                        title: "Phenotype",
                        field: "phenotype",
                        type: "input-text",
                    },
                    {
                        title: "Index results",
                        field: "index",
                        type: "checkbox",
                    },
                    {
                        title: "Index score id",
                        field: "indexScoreId",
                        type: "input-text",
                    }
                ]
            }
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.title ?? this.ANALYSIS_TITLE,
            this.ANALYSIS_DESCRIPTION,
            params,
            this.check()
        );
    }

}

customElements.define("gwas-analysis", GwasAnalysis);
