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
import "../../commons/filters/consequence-type-select-filter.js";


export default class KnockoutAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "knockout";
        this.ANALYSIS_TITLE = "Knockout Analysis";
        this.ANALYSIS_DESCRIPTION = "Executes a Knockout analysis job";

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
        // FIXME decide if this must be displayed
        // if (!this.toolParams.sample) {
        //     return {
        //         message: "You must select samples, this is a mandatory parameter",
        //         notificationType: "warning"
        //     };
        // }
        return null;
    }

    onFieldChange(e) {
        this.toolParams = {...this.toolParams};
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            sample: this.toolParams.sample?.split(",") || [],
            gene: this.toolParams.gene?.split(",") || [],
            panel: this.toolParams.panel?.split(",") || [],
            biotype: this.toolParams.biotype || "",
            consequenceType: this.toolParams.ct || "",
            // filter: this.toolParams.filter || "",
            index: this.toolParams.index || false,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants()
                .runKnockout(toolParams, params),
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
                title: "Sample Filters",
                elements: [
                    {
                        title: "Samples",
                        field: "sample",
                        type: "custom",
                        required: true,
                        display: {
                            render: (sample, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .value="${sample}"
                                    .resource="${"SAMPLE"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: true}}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    }
                ],
            },
            {
                title: "Variant Query Parameters",
                elements: [
                    ...AnalysisUtils.getVariantQueryConfiguration("", ["type"], this.opencgaSession, this.onFieldChange.bind(this)),
                    // TODO decide what to do with this filter
                    // {
                    //     title: "Filter",
                    //     field: "filter",
                    //     type: "input-text",
                    // }
                ]
            },
            // FIXME this shold be done by RGA Index Operation
            // {
            //     title: "Configuration Parameters",
            //     elements: [
            //         {
            //             title: "index",
            //             field: "index",
            //             type: "checkbox",
            //         },
            //     ],
            // }
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

customElements.define("knockout-analysis", KnockoutAnalysis);
