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

export default class VariantIndexOperation extends LitElement {

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
            title: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "variant-index";
        this.TITLE = "Variant Index Operation";
        this.DESCRIPTION = "Index variant files into the variant storage";

        this.DEFAULT_TOOLPARAMS = {};

        // Make a deep copy to avoid modifying default object.
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.config = this.getDefaultConfig();
    }

    // firstUpdated(changedProperties) {
    //     if (changedProperties.has("toolParams")) {
    //         // This parameter will indicate if either a study is passed as an argument
    //         this.study = this.toolParams.study || "";
    //     }
    // }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
            this.config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    check() {
        // if (!this._toolParams.study) {
        //     return {
        //         message: "Study is a mandatory parameter, please select one."
        //     };
        // }
        // if (!this._toolParams.file) {
        //     return {
        //         message: "A VCF file is a mandatory parameter, please select one."
        //     };
        // }
        return null;
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        if (param) {
            this._toolParams = FormUtils.createObject(this._toolParams, param, e.detail.value);
        }
        this.config = this.getDefaultConfig();

        this.requestUpdate();
    }

    onSubmit() {
        const bodyData = {
            file: this._toolParams.file || "",
            calculateStats: this._toolParams.calculateStats || false,
            annotate: this._toolParams.annotate || false,
            resume: this._toolParams.resume || false,
            loadMultiFileData: this._toolParams.loadMultiFileData || false,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this._toolParams, this.ANALYSIS_TOOL),
        };

        AnalysisUtils.submit(
            this.TITLE,
            this.opencgaSession.opencgaClient.variantOperations()
                .indexVariant(bodyData, params),
            this,
        );
    }

    onClear() {
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            study: this.toolParams.study || "",
        };
        this.config = this.getDefaultConfig();

        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this._toolParams}"
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
                            render: toolParams => html`
                                <catalog-search-autocomplete
                                    .value="${toolParams?.study}"
                                    .resource="${"STUDY"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!this.toolParams.study}}"
                                    @filterChange="${e => this.onFieldChange(e, "study")}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    }
                ],
            },
            {
                title: "Configuration Parameters",
                elements: [
                    {
                        title: "File",
                        field: "file",
                        type: "custom",
                        required: true,
                        display: {
                            render: file => html`
                                <catalog-search-autocomplete
                                    .value="${file}"
                                    .resource="${"FILE"}"
                                    .query="${
                                    {
                                        type: "FILE",
                                        format: "VCF",
                                        include: "id,name,format,size,path",
                                    }}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false}}"
                                    @filterChange="${e => this.onFieldChange(e, "file")}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Calculate Stats",
                        field: "calculateStats",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Calculate variant stats for the index file"
                            }
                        }
                    },
                    {
                        title: "Annotate",
                        field: "annotate",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Execute an annotation for the new variants added in this file"
                            }
                        }
                    },
                    {
                        title: "Resume",
                        field: "resume",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Continue a variant file index that has failed"
                            }
                        }
                    },
                    {
                        title: "Load MultiFile Data",
                        field: "loadMultiFileData",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Load variants from multiple files"
                            }
                        }
                    },
                ],
            }
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.title ?? this.TITLE,
            this.DESCRIPTION,
            params,
            this.check(),
            {},
            this.opencgaSession
        );
    }

}

customElements.define("variant-index-operation", VariantIndexOperation);
