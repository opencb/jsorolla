/*
 * Copyright 2015-2024 OpenCB
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
            active: {
                type: Boolean,
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "hrdetect";
        this.ANALYSIS_TITLE = "HRDetect";
        this.ANALYSIS_DESCRIPTION = "Executes a HRDetect analysis job";

        this.DEFAULT_TOOLPARAMS = {
            bootstrap: true,
        };
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
        if (!this.toolParams.snvFittingId || !this.toolParams.svFittingId) {
            return {
                status: false,
                message: "Please select a valid SNV and SV Fitting ID",
            };
        }

        return !!this.toolParams.organ;
    }

    onFieldChange() {
        this.toolParams = {
            ...this.toolParams,
        };

        // Enable this only when a dynamic property in the config can change
        this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        if (this.toolParams.snvFittingId && this.toolParams.svFittingId) {
            const toolParams = {
                id: this.toolParams.id || `${this.ANALYSIS_TOOL}-${UtilsNew.getDatetime()}`,
                description: this.toolParams.description || "",
                sampleId: this.toolParams.query?.sample,
                snvFittingId: this.toolParams.snvFittingId,
                svFittingId: this.toolParams.svFittingId,
                snv3CustomName: this.toolParams.snv3CustomName || "",
                snv8CustomName: this.toolParams.snv8CustomName || "",
                sv3CustomName: this.toolParams.sv3CustomName || "",
                sv8CustomName: this.toolParams.sv8CustomName || "",
                bootstrap: !!this.toolParams.bootstrap,
            };

            // Temporal hack for adding cnvQuery and indelQuery to HRDetect params
            if (this.selectedSample?.qualityControl?.variant?.genomePlot?.config) {
                const tracks = this.selectedSample.qualityControl.variant.genomePlot.config.tracks || [];
                const cnvTrack = tracks.find(track => track.type === "COPY-NUMBER");
                const indelTrack = tracks.find(track => track.type === "INDEL");

                if (cnvTrack?.query) {
                    toolParams.cnvQuery = JSON.stringify(cnvTrack.query);
                }
                if (indelTrack?.query) {
                    toolParams.indelQuery = JSON.stringify(indelTrack.query);
                }
            }

            const params = {
                study: this.opencgaSession.study.fqn,
                ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL)
            };

            AnalysisUtils.submit(
                this.ANALYSIS_TITLE,
                this.opencgaSession.opencgaClient.variants()
                    .runHrDetect(toolParams, params),
                this
            );
        }
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            query: {
                ...this.query,
            },
        };
        this.config = this.getDefaultConfig();
    }

    onChangeSample() {
        if (this.toolParams?.query?.sample && this.active) {
            if (this.toolParams.query.sample !== this.selectedSample?.id) {
                this.opencgaSession.opencgaClient.samples()
                    .search({
                        id: this.toolParams.query.sample,
                        include: "id,qualityControl.variant",
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
            .map(item => ({
                id: item.id,
                name: item.description || item.id || "",
                fields: (item.fittings || []).map(fitting => ({
                    id: fitting.id,
                })),
            }));
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
                            help: {
                                text: "ID to identify the HRDetect results.",
                            },
                        },
                    },
                    {
                        title: "Description",
                        field: "description",
                        type: "input-text",
                        display: {
                            placeholder: "HRDetect analysis description",
                            help: {
                                text: "Decription for these particular HRDetect results.",
                            },
                        },
                    },
                    {
                        title: "Sample ID",
                        field: "query.sample",
                        type: "custom",
                        display: {
                            render: (sampleId, onFieldChange) => html`
                                <catalog-search-autocomplete
                                    .value="${sampleId}"
                                    .resource="${"SAMPLE"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!this.query.sample}}"
                                    @filterChange="${e => onFieldChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "SNV Fitting ID",
                        field: "snvFittingId",
                        type: "custom",
                        display: {
                            render: (snvFittingId, onFieldChange) => html`
                                <select-field-filter
                                    .data="${this.generateSignaturesDropdonw("SNV")}"
                                    .value="${snvFittingId}"
                                    .config="${{
                                        multiple: false,
                                        liveSearch: false
                                    }}"
                                    @filterChange="${e => onFieldChange(e.detail.value)}">
                                </select-field-filter>
                            `,
                        },
                    },
                    {
                        title: "SV Fitting ID",
                        field: "svFittingId",
                        type: "custom",
                        display: {
                            render: (svFittingId, onFieldChange) => html`
                                <select-field-filter
                                    .data="${this.generateSignaturesDropdonw("SV")}"
                                    .value=${svFittingId}
                                    .config="${{
                                        multiple: false,
                                        liveSearch: false
                                    }}"
                                    @filterChange="${e => onFieldChange(e.detail.value)}">
                                </select-field-filter>
                            `,
                        },
                    },
                ],
            },
            {
                title: "Advanced Parameters",
                elements: [
                    {
                        title: "SNV3 Custom Name",
                        field: "snv3CustomName",
                        type: "input-text",
                        display: {
                            help: {
                                text: "Custom signature name that will be considered as SNV3 input for HRDetect.",
                            },
                        },
                    },
                    {
                        title: "SNV8 Custom Name",
                        field: "snv8CustomName",
                        type: "input-text",
                        display: {
                            help: {
                                text: "Custom signature name that will be considered as SNV8 input for HRDetect.",
                            },
                        },
                    },
                    {
                        title: "SV3 Custom Name",
                        field: "sv3CustomName",
                        type: "input-text",
                        display: {
                            help: {
                                text: "Custom signature name that will be considered as SV3 input for HRDetect.",
                            },
                        },
                    },
                    {
                        title: "SV8 Custom Name",
                        field: "sv8CustomName",
                        type: "input-text",
                        display: {
                            help: {
                                text: "Custom signature name that will be considered as SV8 input for HRDetect.",
                            },
                        },
                    },
                    {
                        title: "Bootstrap",
                        field: "bootstrap",
                        type: "checkbox",
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
            this.config
        );
    }

}

customElements.define("hrdetect-analysis", HRDetectAnalysis);
