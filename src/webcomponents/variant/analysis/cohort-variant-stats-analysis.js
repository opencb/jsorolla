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
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";

export default class CohortVariantStatsAnalysis extends LitElement {

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
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            title: {
                type: String
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "cohort-variant-stats";
        this.ANALYSIS_TITLE = "Cohort Variant Stats";
        this.ANALYSIS_DESCRIPTION = "Executes a mutational signature analysis job";

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
        if (!this.toolParams.cohort && !this.toolParams.samples) {
            return {
                message: "You must select a cohort or sample",
                notificationType: "warning"
            };
        }
        return null;
    }

    onFieldChange(e) {
        this.toolParams = {...this.toolParams};
        // Enable this only when a dynamic property in the config can change
        // this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            cohort: this.toolParams.cohort || "",
            samples: this.toolParams.samples?.split(",") || [],
            index: this.toolParams.index ?? false,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL)
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants()
                .runCohortStats(toolParams, params),
            this
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
                title: "Input Parameters",
                elements: [
                    {
                        title: "Cohort ID",
                        field: "cohort",
                        type: "custom",
                        display: {
                            render: (cohort, dataFormFilterChange, updateParams, toolParams) => {
                                return html`
                                    <catalog-search-autocomplete
                                        .value="${cohort}"
                                        .resource="${"COHORT"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false, disabled: !!toolParams?.samples}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>`;
                            },
                            help: {
                                text: "Calculate cohort variant stats for the selected cohorts",
                            }
                        },
                    },
                    {
                        title: "Sample ID",
                        field: "samples",
                        type: "custom",
                        display: {
                            render: (sample, dataFormFilterChange, updateParams, toolParams) => {
                                return html`
                                    <catalog-search-autocomplete
                                        .value="${sample}"
                                        .resource="${"SAMPLE"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: true, disabled: !!toolParams?.cohort}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail?.value)}">
                                    </catalog-search-autocomplete>`;
                            },
                            help: {
                                text: "Select sample to run the analysis",
                            }
                        },
                    },
                ]
            },
            {
                title: "Configuration Parameters",
                elements: [
                    {
                        title: "Index",
                        field: "index",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Cohort variant stats will be indexed in Catalog"
                            }
                        },
                    },
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

customElements.define("cohort-variant-stats-analysis", CohortVariantStatsAnalysis);
