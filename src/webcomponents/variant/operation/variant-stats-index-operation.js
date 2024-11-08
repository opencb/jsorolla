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

export default class VariantStatsIndexOperation extends LitElement {

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
        this.TOOL = "VariantStatsIndex";
        this.TITLE = "Variant Stats Index Operation";
        this.DESCRIPTION = "Compute variant stats for any cohort and any set of variants and index the result in the variant storage database.";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // This parameter will indicate if either a study is passed as an argument
            this.study = this.toolParams.study || "";
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
        if (!this.toolParams.study) {
            return {
                message: "Study is a mandatory parameter, please select one."
            };
        }
        if (!this.toolParams.cohort) {
            return {
                message: "Cohort IDs is a mandatory parameter, please select some cohorts."
            };
        }
        return null;
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        if (param) {
            this.toolParams = FormUtils.createObject(this.toolParams, param, e.detail.value);
        }
        this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            cohort: this.toolParams.cohort?.split(",") || [],
            overwriteStats: this.toolParams.overwriteStats || false,
            resume: this.toolParams.resume || false,
        };
        const params = {
            study: this.toolParams.study || this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.TOOL),
        };
        AnalysisUtils.submit(
            this.TITLE,
            this.opencgaSession.opencgaClient.variantOperations()
                .indexVariantStats(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            study: this.toolParams.study || "",
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
                title: "Study Filter",
                elements: [
                    {
                        title: "Study",
                        type: "custom",
                        required: true,
                        display: {
                            render: toolParams => {
                                return html `
                                <catalog-search-autocomplete
                                    .value="${toolParams?.study}"
                                    .resource="${"STUDY"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!this.study}}"
                                    @filterChange="${e => this.onFieldChange(e, "study")}">
                                </catalog-search-autocomplete>
                            `;
                            }
                        },
                    }
                ],
            },
            {
                title: "Configuration Parameters",
                elements: [
                    {
                        title: "Cohort IDs",
                        type: "custom",
                        required: true,
                        display: {
                            render: toolParams => html `
                                <catalog-search-autocomplete
                                    .value="${toolParams?.cohort}"
                                    .resource="${"COHORT"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: true}}"
                                    @filterChange="${e => this.onFieldChange(e, "cohort")}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Overwrite Stats",
                        field: "overwriteStats",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Calculate variant stats for the study"
                            }
                        }
                    },
                    {
                        title: "Resume",
                        field: "resume",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Continue a variant stats index that has failed"
                            }
                        }
                    },
                ],
            }
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.TOOL,
            this.title ?? this.TITLE,
            this.DESCRIPTION,
            params,
            this.check()
        );
    }

}

customElements.define("variant-stats-index-operation", VariantStatsIndexOperation);
