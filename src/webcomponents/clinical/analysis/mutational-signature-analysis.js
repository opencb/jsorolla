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
import "../../commons/filters/catalog-search-autocomplete.js";
import "../../commons/view/signature-view.js";

export default class MutationalSignatureAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "mutational-signature";
        this.ANALYSIS_TITLE = "Mutational Signature";
        this.ANALYSIS_DESCRIPTION = "Executes a mutational signature analysis job";

        this.DEFAULT_TOOLPARAMS = {
            fitMethod: "FitMS",
            fitSigVersion: "RefSigv2",
            fitThresholdPerc: "5",
            fitThresholdPval: "0.05",
            fitMaxRareSigs: "1",
            fitNBoot: "200",
        };
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.REFSIGV1_ORGANS = [
            "Biliary", "Bladder", "Bone_SoftTissue", "Breast", "Cervix", "CNS",
            "Colorectal", "Esophagus", "Head_neck", "Kidney", "Liver", "Lung",
            "Lymphoid", "Ovary", "Pancreas", "Prostate", "Skin", "Stomach", "Uterus",
        ];
        this.REFSIGV2_ORGANS = [
            "Biliary", "Bladder", "Bone_SoftTissue", "Breast", "CNS", "Colorectal",
            "Esophagus", "Head_neck", "Kidney", "Liver", "Lung", "Lymphoid", "NET",
            "Oral_Oropharyngeal", "Ovary", "Pancreas", "Prostate", "Skin", "Stomach", "Uterus",
        ];

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

    checkValidCatalogId() {
        // Check if the current sample has signatures saved and we have selected one
        if ((this.selectedSample?.qualityControl?.variant?.signatures || []).length > 0) {
            return !!this.toolParams.signature;
        }

        // Other case, catalogueId is valid
        return true;
    }

    checkValidFittingId() {
        // Check if we have provided a custom fitting ID and does not already exists
        if (this.toolParams.fitId) {
            const signatures = this.selectedSample?.qualityControl?.variant?.signatures || [];
            return !signatures.some(signature => {
                return (signature?.fittings || []).some(fitting => fitting.id === this.toolParams.fitId);
            });
        }

        // Other case, fitId is valid
        return true;
    }

    check() {
        // Prevent running fitting without selecting a catalogue id
        if (!this.checkValidCatalogId()) {
            return {
                message: "Please select a catalogue ID for running fitting analysis.",
            };
        }

        // Check if this fitting id is not unique
        if (!this.checkValidFittingId()) {
            return {
                message: `Fitting ID '${this.toolParams.fitId}' already exists.`,
            };
        }

        return null;
    }

    onFieldChange(e) {
        this.toolParams = {...this.toolParams};
        this.requestUpdate();
    }

    onSubmit() {
        // Prevent submitting the form if the new fittingID already exists or the catalogue ID is empty
        if (this.checkValidCatalogId() && this.checkValidFittingId()) {
            const toolParams = {
                sample: this.toolParams.query.sample,
                fitId: this.toolParams.fitId || `fit-${UtilsNew.getDatetime()}`,
                fitMethod: this.toolParams.fitMethod,
                fitSigVersion: this.toolParams.fitSigVersion,
                fitOrgan: this.toolParams.fitOrgan,
                fitMaxRareSigs: this.toolParams.fitMaxRareSigs,
                fitNBoot: this.toolParams.fitNBoot,
                fitThresholdPerc: this.toolParams.fitThresholdPerc,
                fitThresholdPval: this.toolParams.fitThresholdPval,
                fitSignaturesFile: this.toolParams.fitSignaturesFile,
                fitRareSignaturesFile: this.toolParams.fitRareSignaturesFile,
            };

            // Check if we have provided an existing signature list
            if (this.toolParams.signature) {
                toolParams.skip = "catalogue";
                toolParams.id = this.toolParams.signature; // .split(":")[1];
            } else {
                toolParams.id = this.toolParams.id || `catalogue-${UtilsNew.getDatetime()}`;
                toolParams.description = this.toolParams.description || "";
                toolParams.query = JSON.stringify(this.toolParams.query);
            }

            const params = {
                study: this.opencgaSession.study.fqn,
                ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
            };

            AnalysisUtils.submit(
                this.ANALYSIS_TITLE,
                this.opencgaSession.opencgaClient.variants()
                    .runMutationalSignature(toolParams, params),
                this,
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
                        include: "id,qualityControl.variant.signatures",
                        study: this.opencgaSession.study.fqn,
                    })
                    .then(response => {
                        this.selectedSample = response?.responses?.[0]?.results?.[0] || null;
                        this.toolParams.signature = null; // Force to remove selected signature
                        this.config = this.getDefaultConfig();
                        this.requestUpdate();
                    });
            }
        } else {
            this.selectedSample = null;
            this.toolParams.signature = null; // Force to remove selected signature
            this.config = this.getDefaultConfig();
            this.requestUpdate();
        }
    }

    generateSignaturesDropdown() {
        return (this.selectedSample?.qualityControl?.variant?.signatures || [])
            .map(signature => signature.id)
            .sort((a, b) => a < b ? -1 : +1);
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
        const signatures = this.selectedSample?.qualityControl?.variant?.signatures || [];
        const fileQuery = {
            type: "FILE",
            format: "TAB_SEPARATED_VALUES",
            include: "id,name,format,size,path",
        };
        const params = [
            {
                title: "Input Parameters",
                elements: [
                    {
                        title: "Sample ID",
                        field: "query.sample",
                        type: "custom",
                        required: true,
                        display: {
                            render: (sampleId, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .value="${sampleId}"
                                    .resource="${"SAMPLE"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!this.query.sample}}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Catalogue ID",
                        field: "signature",
                        type: "custom",
                        display: {
                            visible: signatures.length > 0,
                            render: (signature, dataFormFilterChange) => html`
                                <select-field-filter
                                    .data="${this.generateSignaturesDropdown()}"
                                    .value=${signature}
                                    .config="${{
                                        multiple: false,
                                        liveSearch: false
                                    }}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </select-field-filter>
                            `,
                        },
                    },
                    {
                        title: "Catalogue Query",
                        field: "signature",
                        type: "custom",
                        display: {
                            visible: signatures.length > 0 && !!this.toolParams?.signature,
                            render: signatureId => {
                                // const [type, id] = (signatureId || "").split(":");
                                const signature = signatures.find(item => item.id === signatureId);
                                if (signature?.query) {
                                    return Object.keys(signature.query).map(key => html`
                                        <span class="badge text-bg-primary">
                                            ${key}: ${signature.query[key]}
                                        </span>
                                    `);
                                }
                                return "-";
                            },
                        },
                    },
                    {
                        title: "Catalogue Plot",
                        field: "signature",
                        type: "custom",
                        display: {
                            visible: signatures.length > 0 && !!this.toolParams?.signature,
                            render: signatureId => {
                                // const [type, id] = (signatureId || "").split(":");
                                const signature = signatures.find(item => item.id === signatureId);
                                return html`
                                    <signature-view
                                        .signature="${signature}"
                                        .mode="${signature.type.toUpperCase() === "SV" ? "SV" : "SBS"}"
                                        ?active="${true}">
                                    </signature-view>
                                `;
                            },
                        },
                    },
                ],
            },
            {
                title: "Catalogue Parameters",
                display: {
                    visible: signatures.length === 0,
                },
                elements: [
                    {
                        title: "Catalogue ID",
                        field: "id",
                        type: "input-text",
                        display: {
                            placeholder: `catalogue-${UtilsNew.getDatetime()}`,
                            help: {
                                text: "If empty then it is automatically filled using the current date.",
                            },
                        },
                    },
                    {
                        title: "Catalogue Description",
                        field: "description",
                        type: "input-text",
                    },
                    ...AnalysisUtils.getVariantQueryConfiguration("query.", [], this.opencgaSession, this.onFieldChange.bind(this)),
                ],
            },
            {
                title: "Fitting Parameters",
                elements: [
                    {
                        title: "Fit ID",
                        field: "fitId",
                        type: "input-text",
                        display: {
                            placeholder: `fit-${UtilsNew.getDatetime()}`,
                        },
                    },
                    {
                        title: "Fit Method",
                        field: "fitMethod",
                        type: "select",
                        allowedValues: ["Fit", "FitMS"],
                    },
                    {
                        title: "Sig Version",
                        field: "fitSigVersion",
                        type: "select",
                        allowedValues: ["COSMICv2", "COSMICv3.2", "RefSigv1", "RefSigv2"],
                    },
                    {
                        title: "Organ",
                        field: "fitOrgan",
                        type: "select",
                        allowedValues: this.toolParams.fitSigVersion === "RefSigv2" ? this.REFSIGV2_ORGANS : this.REFSIGV1_ORGANS,
                        display: {
                            disabled: this.toolParams.fitSigVersion !== "RefSigv1" && this.toolParams.fitSigVersion !== "RefSigv2",
                            help: {
                                text: "Only available for RefSigv1 or RefSigv2",
                            },
                        },
                    },
                    {
                        title: "thresholdperc",
                        field: "fitThresholdPerc",
                        type: "input-text",
                    },
                    {
                        title: "thresholdpval",
                        field: "fitThresholdPval",
                        type: "input-text",
                    },
                    {
                        title: "maxraresigs",
                        field: "fitMaxRareSigs",
                        type: "input-text",
                    },
                    {
                        title: "nboot",
                        field: "fitNBoot",
                        type: "input-text",
                    },
                    {
                        title: "Fit Signatures File",
                        field: "fitSignaturesFile",
                        type: "custom",
                        display: {
                            render: (fitSignaturesFile, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .value="${fitSignaturesFile}"
                                    .resource="${"FILE"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false}}"
                                    .searchField="${"id"}"
                                    .query="${fileQuery}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Fit Rare Signatures File",
                        field: "fitRareSignaturesFile",
                        type: "custom",
                        display: {
                            render: (fitRareSignaturesFile, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .value="${fitRareSignaturesFile}"
                                    .resource="${"FILE"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false}}"
                                    .searchField="${"id"}"
                                    .query="${fileQuery}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                ]
            }
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

customElements.define("mutational-signature-analysis", MutationalSignatureAnalysis);
