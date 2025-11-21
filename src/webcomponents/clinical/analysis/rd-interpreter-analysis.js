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
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";

export default class RdInterpreterAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "rd-interpreter";
        this.ANALYSIS_TITLE = "RD Interpreter";
        this.ANALYSIS_DESCRIPTION = "Executes an RD Interpreter analysis job";
        this.DEFAULT_TOOLPARAMS = {};

        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
        }

        if(changedProperties.has("displayConfig") || changedProperties.has("toolParams")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    check() {
        return null;
    }

    onFieldChange() {
        this._toolParams = {...this._toolParams};
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            clinicalAnalysis: this._toolParams.clinicalAnalysis || "",
        };

        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.clinical()
                .runInterpreterCustomTiering(toolParams, {
                    study: this.opencgaSession.study.fqn,
                    ...AnalysisUtils.fillJobParams(this._toolParams, this.ANALYSIS_TOOL),
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
                            render: (clinicalAnalysis, onFieldChange) => html`
                                <catalog-search-autocomplete
                                    .value="${clinicalAnalysis}"
                                    .resource="${"CLINICAL_ANALYSIS"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{
                                        multiple: false,
                                        disabled: !!this.toolParams?.clinicalAnalysis,
                                    }}"
                                    @filterChange="${event => onFieldChange(event.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
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

customElements.define("rd-interpreter-analysis", RdInterpreterAnalysis);
