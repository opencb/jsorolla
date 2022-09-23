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
import FormUtils from "../../commons/forms/form-utils";
import AnalysisUtils from "../../commons/analysis/analysis-utils";
import UtilsNew from "../../../core/utilsNew.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";


export default class FamilyQcAnalysis extends LitElement {

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
                type: String,
            }
        };
    }

    // QUESTION: Support property samples OR individuals?

    #init() {
        this.ANALYSIS_TOOL = "family-qc";
        this.ANALYSIS_TITLE = "Family Quality Control";
        this.ANALYSIS_DESCRIPTION = "Run quality control (QC) for a given family. It computes the relatedness scores among the family members";

        this.DEFAULT_TOOLPARAMS = {
            minorAlleleFreq: "1000G:ALL>0.3",
        };
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.familyId = "";

        this.config = this.getDefaultConfig();
    }

    check() {
        return !!this.toolParams.family;
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
            family: this.toolParams.family,
            minorAlleleFreq: this.toolParams.minorAlleleFreq
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL)
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants()
                .runFamilyQc(toolParams, params),
            this,
        );

        // TODO: Clear analysis form after submitting
        // this.onClear();
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            family: this.familyId,
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
                title: "Input Parameters",
                elements: [
                    {
                        title: "Select Family",
                        field: "family",
                        type: "custom",
                        display: {
                            helpMessage: "Family Id",
                            render: family => html `
                                <catalog-search-autocomplete
                                    .value="${family}"
                                    .resource="${"FAMILY"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: false}}"
                                    @filterChange="${e => this.onFieldChange(e, "individual")}">
                                </catalog-search-autocomplete>
                            `,
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
                        display: {}
                    },
                ],
            }
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.ANALYSIS_TITLE,
            this.ANALYSIS_DESCRIPTION,
            params,
            this.check()
        );
    }

}

customElements.define("family-qc-analysis", FamilyQcAnalysis);
