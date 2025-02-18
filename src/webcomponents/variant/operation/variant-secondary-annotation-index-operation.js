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
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import "../../commons/filters/consequence-type-select-filter.js";


export default class VariantSecondaryAnnotationIndexOperation extends LitElement {

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
        this.TOOL = "VariantSecondaryAnnotationIndex";
        this.TITLE = "Variant Secondary Annotation Index Operation";
        this.DESCRIPTION = "Executes a variant secondary annotation index operation job";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // This parameter will indicate if either an individual ID or a sample ID were passed as an argument
            this.project = this.toolParams.project || "";
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
        if (!this.toolParams.project) {
            return {
                message: "Project ID is a mandatory parameter, please select one."
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
            overwrite: this.toolParams.index || false,
        };
        const params = {
            project: this.toolParams.project || this.opencgaSession.project.id,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.TOOL),
        };
        AnalysisUtils.submit(
            this.TITLE,
            this.opencgaSession.opencgaClient.variantOperations()
                .variantSecondaryAnnotationIndex(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            project: this.toolParams.project || "",
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
                title: "Project Filter",
                elements: [
                    {
                        title: "Project",
                        type: "custom",
                        required: true,
                        display: {
                            render: toolParams => html`
                                <catalog-search-autocomplete
                                    .value="${toolParams?.project}"
                                    .resource="${"PROJECT"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!this.project}}"
                                    @filterChange="${e => this.onFieldChange(e, "project")}">
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
                        title: "Overwrite Index",
                        field: "overwrite",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Index all variants, including the ones that are already indexed"
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

customElements.define("variant-secondary-annotation-index-operation", VariantSecondaryAnnotationIndexOperation);
