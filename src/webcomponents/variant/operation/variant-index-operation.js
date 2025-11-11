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
import LitUtils from "../../commons/utils/lit-utils.js";
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
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "variant-index";
        this.TITLE = "Variant Index Operation";
        this.DESCRIPTION = "Index variant files into the variant storage";
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

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    check() {
        return null;
    }

    onFieldChange(event) {
        if (event.detail.param) {
            this._toolParams = FormUtils.createObject(this._toolParams, event.detail.param, event.detail.value);
        }
        // this._config = this.getDefaultConfig();
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, this._toolParams);
        this.requestUpdate();
    }

    onSubmit() {
        const bodyData = {
            file: this._toolParams.file || "",
            calculateStats: this._toolParams.calculateStats || false,
            annotate: this._toolParams.annotate || false,
            loadMultiFileData: this._toolParams.loadMultiFileData || false,
            loadSplitData: this._toolParams.loadSplitData || false,
            forceReload: this._toolParams.forceReload || false,
            resume: this._toolParams.resume || false,
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
                @clear="${() => this.onClear()}"
                @submit="${() => this.onSubmit()}">
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
                        field: "study",
                        type: "custom",
                        required: true,
                        display: {
                            render: (study, dataFormFieldChange) => html`
                                <catalog-search-autocomplete
                                    .value="${study}"
                                    .resource="${"STUDY"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{
                                        multiple: false,
                                        disabled: !!this.toolParams.study,
                                    }}"
                                    @filterChange="${event => dataFormFieldChange(event.detail.value)}">
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
                            render: (file, dataFormFieldChange) => html`
                                <catalog-search-autocomplete
                                    .value="${file}"
                                    .resource="${"FILE"}"
                                    .query="${{
                                        type: "FILE",
                                        format: "VCF",
                                        include: "id,name,format,size,path",
                                    }}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{
                                        disabled: !!this._toolParams.file,
                                        multiple: false,
                                    }}"
                                    @filterChange="${event => dataFormFieldChange(event.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Load MultiFile Data",
                        field: "loadMultiFileData",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Indicate the presence of multiple files for the same sample. Each file could be the result of a different vcf-caller or experiment over the same sample."
                            }
                        }
                    },
                    {
                        title: "Load Split Data",
                        field: "loadSplitData",
                        type: "select",
                        allowedValues: ["CHROMOSOME", "REGION"],
                        display: {
                            help: {
                                text: "Indicate that the variants from a group of samples is split in multiple files, either by CHROMOSOME or by REGION. In either case, variants from different files must not overlap."
                            }
                        }
                    },
                    {
                        title: "Additional Operations",
                        // field: "minimumRequirements",
                        type: "object",
                        elements: [
                            {
                                title: "Update Cohort Stats:",
                                field: "calculateStats",
                                type: "checkbox",
                                display: {
                                    help: {
                                        text: "Update cohort ALL statistics after the variant file is indexed"
                                    }
                                }
                            },
                            {
                                title: "Execute Variant Annotation:",
                                field: "annotate",
                                type: "checkbox",
                                display: {
                                    help: {
                                        text: "Execute variant annotation for the new variants added in this file"
                                    }
                                }
                            },
                        ]
                    },
                    {
                        title: "Force Reload",
                        field: "forceReload",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Force reloading the file even if it was already loaded"
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
                ],
            }
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.title ?? this.TITLE,
            this.DESCRIPTION,
            params,
            this.check(),
            {
                display: this.displayConfig || {},
            },
            this.opencgaSession,
        );
    }

}

customElements.define("variant-index-operation", VariantIndexOperation);
