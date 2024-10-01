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

export default class VariantSecondarySampleIndexConfigureOperation extends LitElement {

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
        this.TOOL = "VariantSecondarySampleConfigureIndex";
        this.TITLE = "Variant Secondary Sample Index Configure Operation";
        this.DESCRIPTION = "Executes a variant secondary sample index configure operation job";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this.study = this.toolParams.study || "";
        }
    }

    update(changedProperties) {
        // CAUTION 20230110 Vero:
        //  When study changes out of configuration operations menu option:
        //    1. this.toolParams is updated with the keys studies and body in condition if (changedProperties.has("opencgaSession"))
        //  When the user click on one of the configuartion operation options:
        //    1. The property toolParams is overwritten (see study-variant-admin.js render method) removing the body key with the appropriate
        //    2. Consequently, json-editor is gets renderd with an empty json
        //  Besides, the contents get rendered twice.
        //  The following fix displays the json correctly, but needs to be optimized.
        if (changedProperties.has("toolParams") || changedProperties.has("opencgaSession")) {
            this.toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
                body: JSON.stringify(this.opencgaSession.study?.internal?.configuration?.variantEngine?.sampleIndex, null, 8) || "-",
            };
            this.config = this.getDefaultConfig();
        }
        // if (changedProperties.has("toolParams")) {
        //     this.toolParams = {
        //         ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        //         ...this.toolParams,
        //     };
        //     this.config = this.getDefaultConfig();
        // }
        // if (changedProperties.has("opencgaSession")) {
        //     this.toolParams = {
        //         ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        //         ...this.toolParams,
        //         body: JSON.stringify(this.opencgaSession.study?.internal?.configuration?.variantEngine.sampleIndex, null, 8) || "-",
        //     };
        //     this.config = this.getDefaultConfig();
        // }
        super.update(changedProperties);
    }

    check() {
        if (!this.toolParams.study) {
            return {
                message: "Study is a mandatory parameter, please select one."
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
            ...JSON.parse(this.toolParams.body)
        };
        const params = {
            study: this.toolParams.study || this.opencgaSession.study.fqn,
            skipRebuild: this.toolParams.skipRebuild || false,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.TOOL),
        };
        AnalysisUtils.submit(
            this.TITLE,
            this.opencgaSession.opencgaClient.variantOperations()
                .configureVariantSecondarySampleIndex(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
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
                            render: toolParams => html`
                                <catalog-search-autocomplete
                                    .value="${toolParams?.study}"
                                    .resource="${"STUDY"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{multiple: false, disabled: !!this.study}}"
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
                        title: "Skip Rebuild",
                        field: "skipRebuild",
                        type: "checkbox",
                        display: {
                            help: {
                                text: "Skip rebuilding the secondary sample variant index"
                            }
                        }
                    },
                    {
                        title: "Sample Index Configuration",
                        field: "body",
                        type: "json-editor",
                        display: {
                            rows: 25,
                            defaultLayout: "vertical"
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

customElements.define("variant-secondary-sample-index-configure-operation", VariantSecondarySampleIndexConfigureOperation);
