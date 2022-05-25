/**
 * Copyright 2015-2019 OpenCB
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
import UtilsNew from "../../../core/utilsNew.js";
import Types from "../../commons/types.js";
import DetailTabs from "../../commons/view/detail-tabs.js";
import "../../variant/interpretation/variant-interpreter-grid.js";
import "../../disease-panel/disease-panel-grid.js";
import "./clinical-interpretation-view.js";
import "./clinical-interpretation-summary.js";

export default class ClinicalInterpretationView extends LitElement {

    constructor() {
        super();
        this._init();
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

    _init() {
        this.interpretation = {};
        this._config = this.getDefaultConfig();

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
                    name: `${this.clinicalAnalysis?.interpretation?.id} (Primary)`,
                    active: true,
                    render: data => html`
                        <data-form
                            .data="${this.clinicalAnalysis?.interpretation}"
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
                .config="${this.#renderInterpretationTabs()}"
                .mode="${DetailTabs.PILLS_MODE}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: {
                buttonsVisible: false
            },
            sections: [
                {
                    // title: "Interpretation Info",
                    display: {
                        // style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    return html`
                                            <clinical-interpretation-summary
                                                .interpretation="${data}">
                                            </clinical-interpretation-summary>
                                        `;
                                }
                            }
                        },
                    ]
                },
                {
                    id: "panelView",
                    title: "Panel",
                    elements: [
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
                                        `:"Panel Not Found";
                                }
                            }
                        }
                    ]
                },
                {
                    id: "commentView",
                    title: "Comments",
                    display: {
                        style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
                    },
                    elements: []
                },
                {
                    id: "variantView",
                    title: "Variant",
                    display: {
                        // style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    return !data.primaryFindings || UtilsNew.isNotEmptyArray(data?.primaryFindings) ?
                                        html`
                                            <variant-interpreter-grid
                                                .opencgaSession="${this.opencgaSession}"
                                                .clinicalAnalysis=${this.clinicalAnalysis}
                                                .clinicalVariants="${data?.primaryFindings}">
                                            </variant-interpreter-grid>
                                        `:"Variants Not Found";
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

