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


export default class VariantExportAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "variant-export";
        this.ANALYSIS_TITLE = "Variant Export";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {...this.DEFAULT_TOOLPARAMS};

        this.config = this.getDefaultConfig();
    }

    // update(changedProperties) {
    //     super.update(changedProperties);
    // }

    check() {
        return !!this.toolParams.sample || !!this.toolParams.family;
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
            sample: this.toolParams.sample || "",
            family: this.toolParams.family || "",
            region: this.toolParams.region || "",
            gene: this.toolParams.gene || "",
            biotype: this.toolParams.biotype || "",
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL)
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants().runExport(toolParams, params),
            this
        );
    }

    onClear() {
        this.toolParams = {...this.DEFAULT_TOOLPARAMS};
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
                title: "Select Samples",
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
                                        .config="${{multiple: true, disabled: !!toolParams.family}}"
                                        @filterChange="${e => this.onFieldChange(e, "sample")}">
                                    </catalog-search-autocomplete>`;
                            },
                            help: {
                                text: "Select samples to export variants",
                            }
                        },
                    },
                    {
                        title: "Family ID",
                        type: "custom",
                        display: {
                            render: toolParams => {
                                return html`
                                    <catalog-search-autocomplete
                                        .value="${toolParams?.individual}"
                                        .resource="${"FAMILY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: true, disabled: !!toolParams.sample}}"
                                        @filterChange="${e => this.onFieldChange(e, "family")}">
                                    </catalog-search-autocomplete>`;
                            },
                            help: {
                                text: "Select families to export variants",
                            }
                        },
                    },
                ]
            },
            {
                title: "Variant Query Parameters",
                elements: [
                    {
                        title: "Region",
                        field: "region",
                        type: "input-text",
                        display: {
                        },
                    },
                    {
                        title: "Gene",
                        field: "gene",
                        type: "custom",
                        display: {
                            placeholder: "Add gene...",
                            render: (data, dataFormFilterChange) => {
                                return html`
                                    <feature-filter
                                        .cellbaseClient="${this.opencgaSession.cellbaseClient}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </feature-filter>
                                `;
                            },
                        }
                    },
                    {
                        title: "Gene Biotype",
                        field: "biotype",
                        type: "select",
                        allowedValues: BIOTYPES,
                        multiple: true,
                        display: {
                        },
                    },
                ]
            }
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.title ?? this.ANALYSIS_TITLE,
            "Executes a Variant Export analysis",
            params,
            this.check()
        );
    }

}

customElements.define("variant-export-analysis", VariantExportAnalysis);
