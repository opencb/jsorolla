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
import UtilsNew from "../../../core/utils-new.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils";
import AnalysisUtils from "../../commons/analysis/analysis-utils";
import "../../commons/analysis/opencga-analysis-tool.js";


export default class IndividualQcAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "individual-qc";
        this.ANALYSIS_TITLE = "Individual Quality Control";
        this.ANALYSIS_DESCRIPTION = "Run quality control (QC) for a given individual. It includes inferred sex and mendelian errors (UDP)";

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
        if (this.opencgaSession && !OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user?.id)) {
            return {
                message: "Only Study admins can execute QC methods"
            };
        }
        if (!this.toolParams.sample && !this.toolParams.individual) {
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
            sample: this.toolParams.sample || "",
            individual: this.toolParams.individual || "",
        };
        if (toolParams.sample) {
            delete toolParams.individual;
        }
        if (toolParams.individual) {
            delete toolParams.sample;
        }
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants()
                .runIndividualQc(toolParams, params),
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
                            render: (individual, dataFormFilterChange, updateParams, toolParams) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .value="${individual}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false, disabled: !!toolParams?.sample}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            }

                        }
                    },
                    {
                        title: "Select Sample ID",
                        field: "sample",
                        type: "custom",
                        display: {
                            render: (individual, dataFormFilterChange, updateParams, toolParams) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .value="${individual}"
                                        .resource="${"SAMPLE"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false, disabled: !!toolParams?.individual}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
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

customElements.define("individual-qc-analysis", IndividualQcAnalysis);
