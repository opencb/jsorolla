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
import UtilsNew from "../../../core/utils-new.js";
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
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "interpreter-exomiser";
        this.ANALYSIS_TITLE = "Interpreter Exomiser";
        this.ANALYSIS_DESCRIPTION = "Executes an Exomiser Interpretation analysis";
        this.DEFAULT_TOOLPARAMS = {};

        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this._clinicalAnalysis = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };

            // if a clinicalAnalysis ID is provided as a property we must fetch the object, so we can check if disorders/phenotypes exist
            if (this._toolParams?.clinicalAnalysis) {
                this.clinicalAnalysisObserver();
            }
        }

        if (changedProperties.has("displayConfig") || changedProperties.has("toolParams")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        if (this.toolParams?.clinicalAnalysis && this.opencgaSession) {
            this.opencgaSession.opencgaClient.clinical()
                .info(this.toolParams.clinicalAnalysis, {
                    study: this.opencgaSession.study.fqn,
                    include: "id,proband",
                })
                .then(response => {
                    this._clinicalAnalysis = response.responses[0].results[0];
                    this._config = this.getDefaultConfig();
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    check() {
        // Proband MUST have at least one phenotype or disorder
        if (this._clinicalAnalysis) {
            if (!(this._clinicalAnalysis?.proband?.phenotypes?.length > 0 || this._clinicalAnalysis?.proband?.disorders?.length > 0)) {
                return {
                    message: `No phenotypes or disorders found for proband '${this._clinicalAnalysis?.proband?.id}'. This is a mandatory parameter.`
                };
            }
        }

        return null;
    }

    onFieldChange(event) {
        this._toolParams = {...this._toolParams};

        // We need to fetch clinicalAnalysis object, so we can check if form is valid
        if (event.detail?.param === "clinicalAnalysis") {
            this.clinicalAnalysisObserver();
        }

        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            clinicalAnalysis: this._toolParams.clinicalAnalysis || "",
        };

        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.clinical()
                .runInterpreterExomiser(toolParams, {
                    study: this.opencgaSession.study.fqn,
                    ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
                }),
            this,
        );
    }

    onClear() {
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
        };
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this._toolParams}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @clear="${event => this.onClear(event)}"
                @submit="${event => this.onSubmit(event)}">
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
                            render: (clinicalAnalysisId, onFieldChange) => {
                                return html`
                                    <catalog-search-autocomplete
                                        .value="${clinicalAnalysisId}"
                                        .resource="${"CLINICAL_ANALYSIS"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                            disabled: !!this.toolParams.clinicalAnalysis,
                                        }}"
                                        @filterChange="${event => onFieldChange(event.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            }
                        },
                    },
                ],
            },
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.ANALYSIS_TITLE,
            this.ANALYSIS_DESCRIPTION,
            params,
            this.check(),
            {
                display: {
                    ...this.displayConfig,
                },
            },
        );
    }

}

customElements.define("exomiser-analysis", ExomiserAnalysis);
