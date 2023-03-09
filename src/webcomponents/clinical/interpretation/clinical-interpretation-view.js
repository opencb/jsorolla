/**
 * Copyright 2015-2022 OpenCB
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
import UtilsNew from "../../../core/utils-new.js";
import Types from "../../commons/types.js";
import DetailTabs from "../../commons/view/detail-tabs.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import "../../variant/interpretation/variant-interpreter-grid.js";
import "../../disease-panel/disease-panel-grid.js";
import "./clinical-interpretation-view.js";
import "./clinical-interpretation-summary.js";
import "../../variant/interpretation/variant-interpreter-grid-beta.js";


export default class ClinicalInterpretationView extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object
            },
            interpretationId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.interpretation = {};
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
        super.connectedCallback();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.interpretationObserver();
        }
        super.update(changedProperties);
    }


    interpretationObserver() {
        // console.log("this is a clinicalAnalysis", this.clinicalAnalysis);

    }

    #renderInterpretationTabs() {
        const renderInterpretation = interpretation => html`
            <data-form
                .data="${interpretation}"
                .config="${this._config}">
            </data-form>
            `;

        const secondaryInterpretations = this.clinicalAnalysis?.secondaryInterpretations.map(interpretation =>
            ({
                id: interpretation.id,
                name: interpretation.id,
                render: data => renderInterpretation(interpretation)
            })
        );
        return {
            items: [
                {
                    id: "interpretationView",
                    name: `${this.clinicalAnalysis.interpretation.id} (Primary)`,
                    active: true,
                    render: data => html`
                        <data-form
                            .data="${data?.interpretation}"
                            .config="${this._config}">
                        </data-form>
                    `
                },
                ...secondaryInterpretations
            ]
        };
    }

    render() {

        // Interpretation
        // Panels View
        // Comments
        // Variants

        if (!this.clinicalAnalysis) {
            return "";
        }

        if (!this.clinicalAnalysis?.secondaryInterpretations || UtilsNew.isEmptyArray(this.clinicalAnalysis?.secondaryInterpretations)) {
            return html`
                <data-form
                    .data="${this.clinicalAnalysis?.interpretation}"
                    .config="${this._config}">
                </data-form>
            `;
        }

        return html`
            <detail-tabs
                .data="${this.clinicalAnalysis}"
                .config="${this.#renderInterpretationTabs()}"
                .mode="${DetailTabs.PILLS_MODE}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: {
                buttonsVisible: false,
                titleStyle: "display:none"
            },
            sections: [
                {
                    display: {
                        // style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    const isLocked = interpretation => interpretation.locked? html`<i class="fas fa-lock"></i>`:"";
                                    return html`
                                            <div style="font-size:24px;font-weight: bold;margin-bottom: 12px">
                                                <span>${isLocked(data)} Interpretation Info</span>
                                            </div>
                                            <clinical-interpretation-summary
                                                .interpretation="${data}">
                                            </clinical-interpretation-summary>
                                        `;
                                }
                            }
                        },
                        {
                            text: "Interpretation Panels",
                            type: "title",
                            display: {
                                textStyle: "font-size:24px;font-weight: bold;",
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    return !data.panels || UtilsNew.isNotEmptyArray(data?.panels) ?
                                        html`
                                            <disease-panel-grid
                                                .opencgaSession="${this.opencgaSession}"
                                                .diseasePanels="${data?.panels}">
                                            </disease-panel-grid>
                                        `: "No panel data to display";
                                }
                            }
                        },
                        {
                            text: "Interpretation Comments",
                            type: "title",
                            display: {
                                textStyle: "font-size:24px;font-weight: bold;",
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                render: data => html `
                                    <clinical-analysis-comment-editor
                                        .id=${data?.id}
                                        .opencgaSession="${this.opencgaSession}"
                                        .disabled="${!!this.clinicalAnalysis?.interpretation?.locked}"
                                        .comments="${data?.comments}">
                                    </clinical-analysis-comment-editor>
                                `
                            }
                        },
                        {
                            text: "Variants",
                            type: "title",
                            display: {
                                textStyle: "font-size:24px;font-weight: bold;",
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    return !data.primaryFindings || UtilsNew.isNotEmptyArray(data?.primaryFindings) ?
                                        html`
                                            <variant-interpreter-grid-beta
                                                review
                                                .clinicalAnalysis=${this.clinicalAnalysis}
                                                .clinicalVariants="${data?.primaryFindings}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config=${
                                                    {
                                                        showExport: false,
                                                        showSettings: false
                                                    }
                                                }>
                                            </variant-interpreter-grid-beta>
                                        `:"No variants data to display";
                                }
                            }
                        }
                    ]
                },
            ]

        });
    }

}

customElements.define("clinical-interpretation-view", ClinicalInterpretationView);

