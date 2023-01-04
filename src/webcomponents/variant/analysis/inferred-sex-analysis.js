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
import "../../commons/analysis/opencga-analysis-tool.js";
import FormUtils from "../../commons/forms/form-utils";
import AnalysisUtils from "../../commons/analysis/analysis-utils";


export default class InferredSexAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "inferred-sex";
        this.ANALYSIS_TITLE = "Inferred Sex Analysis";
        // Todo: add description
        this.ANALYSIS_DESCRIPTION = "";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS)
        };

        this.individual = "";
        this.sample = "";
        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // This parameter will indicate if either an individual ID or a sample ID were passed as an argument
            this.individual = this.toolParams.individual || "";
            this.sample = this.toolParams.sample || "";
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
        return !!this.toolParams.individual || !!this.toolParams.sample;
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        // if (param) {
        //     this.toolParams = FormUtils.createObject(this.toolParams, param, e.detail.value);
        // }
        // Enable this only when a dynamic property in the config can change
        // this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            individual: this.toolParams.individual || "",
            sample: this.toolParams.sample || "",
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants()
                .runInferredSex(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            individual: this.individual,
            sample: this.sample,
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
                        title: "Select Individual ID",
                        field: "individual",
                        type: "custom",
                        display: {
                            helpMessage: "Individual Id",
                            render: (individual, dataFormFilterChange, updateParams, toolParams) => html `
                                <catalog-search-autocomplete
                                    .value="${individual}"
                                    .resource="${"INDIVIDUAL"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!toolParams?.sample}}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        }
                    },
                    {
                        title: "Select Sample ID",
                        field: "sample",
                        type: "custom",
                        display: {
                            helpMessage: "Sample Id",
                            render: (sample, dataFormFilterChange, updateParams, toolParams) => html `
                                <catalog-search-autocomplete
                                    .value="${sample}"
                                    .resource="${"SAMPLE"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!toolParams?.individual}}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                ],
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

customElements.define("inferred-sex-analysis", InferredSexAnalysis);
