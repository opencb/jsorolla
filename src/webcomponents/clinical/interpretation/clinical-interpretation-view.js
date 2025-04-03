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

import {LitElement, html, nothing} from "lit";
import DetailTabs from "../../commons/view/detail-tabs.js";
import "../../commons/forms/data-form.js";
import "../../variant/interpretation/variant-interpreter-review.js";
import "../../disease-panel/disease-panel-grid.js";
import "./clinical-interpretation-summary.js";

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
            // interpretationId: {
            //     type: String
            // },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    getTabsConfiguration() {
        const secondaryInterpretations = this.clinicalAnalysis?.secondaryInterpretations || [];
        return {
            hideTabsIfOnlyOneVisible: true,
            items: [
                {
                    id: "primary-interpretation",
                    name: `${this.clinicalAnalysis.interpretation.id} (Primary)`,
                    active: true,
                    render: data => html`
                        <data-form
                            .data="${data?.interpretation}"
                            .config="${this._config || {}}">
                        </data-form>
                    `,
                },
                ...secondaryInterpretations.map(interpretation => ({
                    id: interpretation.id,
                    name: interpretation.id,
                    render: () => html`
                        <data-form
                            .data="${interpretation}"
                            .config="${this._config || {}}">
                        </data-form>
                    `,
                })),
            ],
        };
    }

    render() {
        if (!this.clinicalAnalysis || !this.opencgaSession) {
            return nothing;
        }

        return html`
            <detail-tabs
                .opencgaSession="${this.opencgaSession}"
                .data="${this.clinicalAnalysis}"
                .mode="${DetailTabs.PILLS_MODE}"
                .config="${this.getTabsConfiguration()}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: false,
            },
            sections: [
                {
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => html`
                                    <div style="font-size:24px;font-weight: bold;margin-bottom: 12px">
                                        ${data?.locked ? html`<i class="fas fa-lock"></i>` : nothing}
                                        <span>Interpretation Info</span>
                                    </div>
                                    <clinical-interpretation-summary
                                        .interpretation="${data}">
                                    </clinical-interpretation-summary>
                                `,
                            },
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
                                render: data => html`
                                    ${data?.panels?.length > 0 ? html`
                                        <disease-panel-grid
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${data?.panels}">
                                        </disease-panel-grid>
                                    ` : html`
                                        <div class="alert alert-info">
                                            <i class="fas fa-info-circle me-2"></i>
                                            <span>This interpretation does not have any panels associated.</span>
                                        </div>
                                    `}
                                `,
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
                                render: data => html`
                                    <clinical-analysis-comment-editor
                                        .id=${data?.id}
                                        .opencgaSession="${this.opencgaSession}"
                                        .disabled="${!!this.clinicalAnalysis?.interpretation?.locked}"
                                        .comments="${data?.comments}">
                                    </clinical-analysis-comment-editor>
                                `,
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
                                    if (data?.primaryFindings?.length === 0) {
                                        return html`
                                            <div class="alert alert-warning">
                                                <i class="fas fa-info-circle me-2"></i>
                                                <span>This interpretation does not have any variant marked as <b>Primary Findings</b>.</span>
                                            </div>
                                        `;
                                    }
                                    return html`
                                        <variant-interpreter-review
                                            .opencgaSession="${this.opencgaSession}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .variants="${data.primaryFindings}"
                                            .gridConfig="${{
                                                showSettings: false,
                                                showActions: true,
                                                showEditReview: true,
                                                showSelectCheckbox: false,
                                            }}">
                                        </variant-interpreter-review>
                                    `;
                                },
                            }
                        }
                    ]
                },
            ],
        };
    }

}

customElements.define("clinical-interpretation-view", ClinicalInterpretationView);
