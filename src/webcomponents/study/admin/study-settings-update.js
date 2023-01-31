/**
 * Copyright 2015-2023 OpenCB
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

import {html, LitElement, nothing} from "lit";
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import Types from "../../commons/types";


export default class StudySettingsUpdate extends LitElement {

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
            study: {
                type: Object,
            },

            config: {
                type: Object,
            },
            item: {
                type: String,
            },
            title: {
                type: String,
            },
        };
    }

    #init() {
        this.isLoading = ""; // State after the query: iddle | success | error | loading
        // Fixme: it would be better to define this.state with vocabulary: iddle | success | error | loading
        this.data = null;
        this.error = null;


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
                body: JSON.stringify(BROWSERS_SETTINGS[this.item], null, 8) || "-",
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
        //         body: JSON.stringify(this.opencgaSession.study?.internal?.configuration?.clinical, null, 8) || "-",
        //     };
        //     this.config = this.getDefaultConfig();
        // }

        if (changedProperties.has("config")) {
            this.configObserver();
        }
        super.update(changedProperties);
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    // --- OBSERVERS ---
    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    // --- EVENTS ---
    onJsonChange(e, field) {}

    onReset() {}

    onSubmit() {
        // this.opencgaSession.opencgaClient.studies()
        // .update(studyId, data, params)
    }

    // --- RENDER ---
    render() {
        // 1. If state loading
        // 2. Render JSON
        // 3. Render PREVIEW
        return html `
            <!-- Data form wrapper -->
            <div>
                <data-form
                    .data="${this.toolParams}"
                    .config="${this.config}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${this.onClear}"
                    @submit="${this.onSubmit}">
                </data-form>
            </div>
            <!-- Preview -->
            <div>

            </div>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            sections: [
                // {
                //     title: "Study Filter",
                //     elements: [
                //         {
                //             title: "Study",
                //             type: "custom",
                //             required: true,
                //             display: {
                //                 render: toolParams => html`
                //                     <catalog-search-autocomplete
                //                         .value="${toolParams?.study}"
                //                         .resource="${"STUDY"}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         .config="${{multiple: false, disabled: !!this.study}}"
                //                         @filterChange="${e => this.onFieldChange(e, "study")}">
                //                     </catalog-search-autocomplete>
                //                 `,
                //             },
                //         }
                //     ],
                // },
                {
                    title: "Configuration Parameters",
                    elements: [
                        {
                            title: `${this.item} Settings`,
                            field: "body",
                            type: "json-editor",
                            display: {
                                rows: 25,
                                defaultLayout: "vertical"
                            }
                        },
                    ],
                }
            ],
        });
    }

}

customElements.define("study-settings-update", StudySettingsUpdate);

