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
import UtilsNew from "../../../core/utilsNew.js";
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
        this.TOOL = "interpreter-exomiser";
        this.TITLE = "Interpreter Exomiser";
        this.DESCRIPTION = "Executes an Exomiser Interpretation analysis";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS)
        };

        this.clinicalAnalysis = "";
        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // This parameter will indicate if a clinical analysis ID was passed as an argument
            this.clinicalAnalysis = this.toolParams.clinicalAnalysis || "";

            // If a clinicalAnalysis ID is provided as a property we must fetch the object, so we can check
            if (this.clinicalAnalysis) {
                this.clinicalAnalysisObserver();
            }
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

    clinicalAnalysisObserver() {
        if (this.toolParams?.clinicalAnalysis && this.opencgaSession) {
            this.opencgaSession.opencgaClient.clinical()
                .info(this.toolParams.clinicalAnalysis, {study: this.opencgaSession.study.fqn, include: "id,proband"})
                .then(resp => {
                    this.clinicalAnalysisObj = resp.responses[0].results[0];
                    this.config = this.getDefaultConfig();
                    this.requestUpdate();
                });
        }
    }

    check() {
        // Proband MUST have at least one phenotype or disorder
        if (this.clinicalAnalysisObj) {
            return {
                status: this.clinicalAnalysisObj?.proband?.phenotypes?.length > 0 || this.clinicalAnalysisObj?.proband?.disorders?.length > 0,
                message: `No phenotypes or disorders found for proband '${this.clinicalAnalysisObj?.proband?.id}'. This is a mandatory parameter.`
            };
        } else {
            return null;
        }
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        if (param) {
            this.toolParams = FormUtils.createObject(this.toolParams, param, e.detail.value);
        }

        // We need to fetch clinicalAnalysis object, so we can check if form is valid
        if (param === "clinicalAnalysis") {
            this.clinicalAnalysisObserver();
        } else {
            this.config = this.getDefaultConfig();
            this.requestUpdate();
        }
    }

    onSubmit() {
        const toolParams = {
            clinicalAnalysis: this.toolParams.clinicalAnalysis || "",
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.TOOL),
        };
        AnalysisUtils.submit(
            this.TITLE,
            this.opencgaSession.opencgaClient.clinical()
                .runInterpreterExomiser(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            // If a clinical analysis ID was passed (probably because we are in the interpreter) then we need to keep it
            clinicalAnalysis: this.clinicalAnalysis,
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
                        title: "Clinical Analysis ID",
                        field: "clinicalAnalysis",
                        type: "custom",
                        display: {
                            render: clinicalAnalysisId => html`
                                <catalog-search-autocomplete
                                    .value="${clinicalAnalysisId}"
                                    .resource="${"CLINICAL_ANALYSIS"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!this.clinicalAnalysis}}"
                                    @filterChange="${e => this.onFieldChange(e, "clinicalAnalysis")}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                ],
            },
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.TOOL,
            this.title ?? this.TITLE,
            this.DESCRIPTION,
            params,
            this.check(),
        );
    }

}

customElements.define("exomiser-analysis", ExomiserAnalysis);
