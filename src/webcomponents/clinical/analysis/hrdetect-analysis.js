/*
 * Copyright 2015-present OpenCB
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
import FormUtils from "../../commons/forms/form-utils.js";
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../commons/forms/select-field-filter.js";

export default class HRDetectAnalysis extends LitElement {

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
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "hrdetect";
        this.ANALYSIS_TITLE = "HRDetect";
        this.ANALYSIS_DESCRIPTION = "Executes a HRDetect analysis job";

        this.DEFAULT_TOOLPARAMS = {};
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS)
        };

        this.query = {};
        this.active = true;
        this.selectedSample = null;
        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // Save the initial 'query'. Needed for onClear() method
            this.query = this.toolParams.query || {};
        }
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this.toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
            this.config = this.getDefaultConfig();
            this.onChangeSample();
        }
        super.update(changedProperties);
    }

    check() {
        return !!this.toolParams.organ;
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
            id: this.toolParams.id || `${this.ANALYSIS_TOOL}-${UtilsNew.getDatetime()}`,
            sample: this.toolParams.query?.sample,
            snvFittingId: this.toolParams.snvFittingId,
            svFittingId: this.toolParams.svFittingId,
        };

        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL)
        };

        // TODO: we have to change the endpoint called for running the hrdetect analysis
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.variants()
                .runMutationalSignature(toolParams, params),
            this
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            query: {
                ...this.query
            }
        };
        this.config = this.getDefaultConfig();
    }

    onChangeSample() {
        if (this.toolParams?.query?.sample && this.active) {
            if (this.toolParams.query.sample !== this.selectedSample?.id) {
                this.opencgaSession.opencgaClient.samples()
                    .search({
                        id: this.toolParams.query.sample,
                        include: "id,qualityControl.variant.signatures",
                        study: this.opencgaSession.study.fqn,
                    })
                    .then(response => {
                        this.selectedSample = response?.responses?.[0]?.results?.[0] || null;
                        this.toolParams.counts = null; // Force to remove selected counts
                        this.config = this.getDefaultConfig();
                        this.requestUpdate();
                    });
            }
        } else {
            this.selectedSample = null;
            this.toolParams.counts = null; // Force to remove selected counts
            this.config = this.getDefaultConfig();
            this.requestUpdate();
        }
    }

    generateSignaturesDropdonw(type) {
        return (this.selectedSample?.qualityControl?.variant?.signatures || [])
            .filter(item => item.type?.toUpperCase() === type)
            .map(item => {
                const fields = (item.fittings || [])
                    .map(fittingItem => ({
                        id: fittingItem.id,
                    }));

                return {
                    id: item.id,
                    name: item.description || item.id || "",
                    fields: fields,
                };
            });
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
                        title: "ID",
                        field: "id",
                        type: "input-text",
                        display: {
                            placeholder: `${this.ANALYSIS_TOOL}-${UtilsNew.getDatetime()}`,
                        },
                    },
                    {
                        title: "Sample ID",
                        field: "query.sample",
                        type: "custom",
                        display: {
                            render: sampleId => html`
                                <catalog-search-autocomplete
                                    .value="${sampleId}"
                                    .resource="${"SAMPLE"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!this.query.sample}}"
                                    @filterChange="${e => this.onFieldChange(e, "query.sample")}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "SNV Fitting ID",
                        field: "snvFittingId",
                        type: "custom",
                        display: {
                            render: snvFittingId => html`
                                <select-field-filter
                                    .data="${this.generateSignaturesDropdonw("SNV")}"
                                    .value=${snvFittingId}
                                    ?multiple="${false}"
                                    ?liveSearch=${false}
                                    @filterChange="${e => this.onFieldChange(e, "snvFittingId")}">
                                </select-field-filter>
                            `,
                        },
                    },
                    {
                        title: "SV Fitting ID",
                        field: "svFittingId",
                        type: "custom",
                        display: {
                            render: svFittingId => html`
                                <select-field-filter
                                    .data="${this.generateSignaturesDropdonw("SV")}"
                                    .value=${svFittingId}
                                    ?multiple="${false}"
                                    ?liveSearch=${false}
                                    @filterChange="${e => this.onFieldChange(e, "svFittingId")}">
                                </select-field-filter>
                            `,
                        },
                    },
                ],
            },
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

customElements.define("hrdetect-analysis", HRDetectAnalysis);
