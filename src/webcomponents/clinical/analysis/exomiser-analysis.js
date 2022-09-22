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
import FormUtils from "../../commons/forms/form-utils";
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import "../../commons/forms/data-form.js";

export default class ExomiserAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "interpreter-exomiser";
        this.ANALYSIS_TITLE = "Interpreter Exomiser";

        this.DEFAULT_TOOLPARAMS = {};
        this.clinicalAnalysisId = "";
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {...this.DEFAULT_TOOLPARAMS};

        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // This parameter will indicate if a clinical analysis ID was passed as an argument
            this.clinicalAnalysisId = this.toolParams.clinicalAnalysisId || "";
            this.toolParams = {
                ...this.DEFAULT_TOOLPARAMS,
                ...this.toolParams,
            };
            this.config = this.getDefaultConfig();
        }
    }

    check() {
        return !!this.toolParams.clinicalAnalysisId;
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
            clinicalAnalysis: this.toolParams.clinicalAnalysisId,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.clinical().runInterpreterExomiser(toolParams, params),
            this,
        );

        // Clear analysis form after submitting
        // this.onClear();
    }

    onClear() {
        this.toolParams = {
            ...this.DEFAULT_TOOLPARAMS,
            // If a clinical analysis ID was passed (probably because we are in the interpreter) then we need to keep it
            clinicalAnalysisId: this.clinicalAnalysisId,
        };
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
                title: "General Information",
                elements: [
                    {
                        title: "Clinical Analysis ID",
                        field: "clinicalAnalysisId",
                        type: "custom",
                        display: {
                            render: clinicalAnalysisId => html`
                                <catalog-search-autocomplete
                                    .value="${clinicalAnalysisId}"
                                    .resource="${"CLINICAL_ANALYSIS"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!this.clinicalAnalysisId}}"
                                    @filterChange="${e => this.onFieldChange(e, "clinicalAnalysisId")}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                ],
            },
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.title ?? this.ANALYSIS_TITLE,
            "Executes an Exomiser Interpretation analysis",
            params,
            this.check(),
        );
    }

}

customElements.define("exomiser-analysis", ExomiserAnalysis);
