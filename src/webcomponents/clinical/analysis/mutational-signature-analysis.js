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
import FormUtils from "../../commons/forms/form-utils.js";
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";


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
            title: {
                type: String
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "mutational-signature";
        this.ANALYSIS_TITLE = "Mutational Signature";
        this.ANALYSIS_DESCRIPTION = "Executes a mutational signature analysis job";

        this.DEFAULT_TOOLPARAMS = {
            fitmethod: "FitMS",
            sigversion: "RefSigv2",
            b: false,
            thresholdperc: "5",
            thresholdpval: "0.05",
            maxraresigs: "1",
            nboot: "200"
        };
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS)
        };

        this.REFSIGV1_ORGANS = [
            "Biliary", "Bladder", "Bone_SoftTissue", "Breast", "Cervix", "CNS",
            "Colorectal", "Esophagus", "Head_neck", "Kidney", "Liver", "Lung",
            "Lymphoid", "Ovary", "Pancreas", "Prostate", "Skin", "Stomach", "Uterus"];
        this.REFSIGV2_ORGANS = [
            "Biliary", "Bladder", "Bone_SoftTissue", "Breast", "CNS", "Colorectal",
            "Esophagus", "Head_neck", "Kidney", "Liver", "Lung", "Lymphoid", "NET",
            "Oral_Oropharyngeal", "Ovary", "Pancreas", "Prostate", "Skin", "Stomach", "Uterus"];

        this.query = {};
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
            ...this.toolParams,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL)
        };
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
                title: "Configuration Parameters",
                elements: [
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
                        title: "Fit Method",
                        field: "fitmethod",
                        type: "select",
                        // defaultValue: "FitMS",
                        allowedValues: ["Fit", "FitMS"],
                        display: {
                        },
                    },
                    {
                        title: "Sig Version",
                        field: "sigversion",
                        type: "select",
                        // defaultValue: "RefSigv2",
                        allowedValues: ["COSMICv2", "COSMICv3.2", "RefSigv1", "RefSigv2"],
                        display: {
                        },
                    },
                    {
                        title: "Organ",
                        field: "organ",
                        type: "select",
                        allowedValues: this.toolParams.sigversion === "RefSigv2" ? this.REFSIGV2_ORGANS : this.REFSIGV1_ORGANS,
                        display: {
                            disabled: this.toolParams.sigversion !== "RefSigv1" && this.toolParams.sigversion !== "RefSigv2",
                            help: {
                                text: "Only available for RefSigv1 or RefSigv2"
                            }
                        },
                    },
                    {
                        title: "b",
                        field: "b",
                        type: "checkbox",
                        display: {
                        },
                    },
                    {
                        title: "thresholdperc",
                        field: "thresholdperc",
                        type: "input-text",
                        // defaultValue: "5",
                        display: {
                        },
                    },
                    {
                        title: "thresholdpval",
                        field: "thresholdpval",
                        type: "input-text",
                        // defaultValue: "0.05",
                        display: {
                        },
                    },
                    {
                        title: "maxraresigs",
                        field: "maxraresigs",
                        type: "input-text",
                        // defaultValue: "1",
                        display: {
                        },
                    },
                    {
                        title: "nboot",
                        field: "nboot",
                        type: "input-text",
                        // defaultValue: "200",
                        display: {
                        },
                    },
                ]
            }
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

customElements.define("mutational-signature-analysis", MutationalSignatureAnalysis);
