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
import "../../commons/forms/data-form.js";
import UtilsNew from "../../../core/utilsNew";


export default class SampleVariantStatsAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "sample-variant-stats";
        this.ANALYSIS_TITLE = "Sample Variant Stats";
        this.ANALYSIS_DESCRIPTION = "Executes a mutational signature analysis job";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS)
        };

        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // Save the initial 'sample'. Needed for onClear() method
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
        return !!this.toolParams.sample || !!this.toolParams.individual;
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        if (param) {
            this.toolParams = FormUtils.createObject(this.toolParams, param, e.detail.value);
        }
        // Enable this only when a dynamic property in the config can change
        this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            sample: this.toolParams.sample?.split(",") || [],
            individual: this.toolParams.individual?.split(",") || [],
            variantQuery: this.toolParams.variantQuery || {},
            index: this.toolParams.index ?? false,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL)
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants()
                .runSampleStats(toolParams, params),
            this
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
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
                title: "Input Samples",
                elements: [
                    {
                        title: "Sample ID",
                        type: "custom",
                        display: {
                            render: toolParams => {
                                return html`
                                    <catalog-search-autocomplete
                                        .value="${toolParams?.sample}"
                                        .resource="${"SAMPLE"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: true, disabled: !!toolParams.individual}}"
                                        @filterChange="${e => this.onFieldChange(e, "sample")}">
                                    </catalog-search-autocomplete>`;
                            },
                            help: {
                                text: "Select on Sample to run the analysis",
                            }
                        },
                    },
                    {
                        title: "Individual ID",
                        type: "custom",
                        display: {
                            render: toolParams => {
                                return html`
                                    <catalog-search-autocomplete
                                        .value="${toolParams?.individual}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: true, disabled: !!toolParams.sample}}"
                                        @filterChange="${e => this.onFieldChange(e, "individual")}">
                                    </catalog-search-autocomplete>`;
                            },
                            help: {
                                text: "Variant stats will be calculated for all the samples of these individuals",
                            }
                        },
                    },
                ]
            },
            {
                title: "Variant Query Parameters",
                elements: AnalysisUtils.getVariantQueryConfiguration("variantQuery.", this.opencgaSession, this.onFieldChange.bind(this)),
            },
            {
                title: "Configuration Parameters",
                elements: [
                    {
                        title: "Index",
                        field: "index",
                        type: "checkbox",
                        display: {
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

customElements.define("sample-variant-stats-analysis", SampleVariantStatsAnalysis);
