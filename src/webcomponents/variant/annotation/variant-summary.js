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

import {html, LitElement, nothing} from "lit";
// import "./variant-summary-interpretation.js"
import "./variant-summary-clinical-significance.js"
import "./variant-summary-clinical-significance-variant-traits.js"
import "./variant-summary-cs-cosmic-variant-traits.js"
import "./variant-summary-quality.js"
import "./variant-summary-population.js"
import "./variant-summary-info.js"
import "./variant-summary-ct-selected.js"
import "./variant-summary-ct-no-selected.js"
import "./variant-summary-gene.js"
import VariantUtils from "../variant-utils.js";
// import "./variant-summary-deleteriousness.js";

export default class VariantSummary extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variantId: {
                type: String
            },
            variant: {
                type: Object
            },
            clinical: {
                type: Boolean,
            },
            clinicalAnalysis: {
                type: Object,
            },
            settings: {
                type: Object,
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-summary";
        this._variant = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        this._variant = {...this.variant};
    }

    render() {
        if (!this._variant) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._variant}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            // title: "Summary",
            icon: "",
            display: {
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                // 2. Section Variant quality
                {
                    elements: [
                        {
                            id: "variant-summary-quality",
                            type: "custom",
                            title: "",
                            display: {
                                render: variant => {
                                    const samplesQuality = variant.studies.find(study => study.studyId === this.opencgaSession.study.fqn)
                                    return html`
                                        <variant-summary-quality
                                            .samplesQuality="${samplesQuality}"
                                            .variant="${variant}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .opencgaSession="${this.opencgaSession}">
                                        </variant-summary-quality>
                                    `;
                                }
                            }
                        }
                    ],
                },
                // 3. Section Population Summary
                {
                    display: {},
                    elements: [
                        {
                            id: "variant-summary-population",
                            type: "custom",
                            title: "",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    return html`
                                        <variant-summary-population
                                            .variant="${variant}"
                                            .opencgaSession="${this.opencgaSession}">
                                        </variant-summary-population>
                                    `;
                                }
                            }
                        }
                    ],
                },
                // 4. Section Clinical Significance
                {
                    // title: "Clinical Significance",
                    display: {
                        //visible: null,// individual => individual?.id,
                        layout: [
                            {
                                className: "d-flex align-items-stretch",
                                elements: [
                                    {
                                        id: "variant-summary-info",
                                        style: "flex: 1 0 auto",
                                    },
                                    {
                                        id: "variant-summary-ct-selected",
                                        style: "flex: 1 0 auto",
                                    },
                                    /*
                                    {
                                        id: "variant-summary-ct-no-selected",
                                        className: "flex-grow-1",
                                    },
                                     */
                                ]
                            },
                            {
                                className: "d-flex align-items-stretch",
                                elements: [
                                    {
                                        id:"variant-summary-clinical-significance",
                                        style: "flex: 1 0 auto",
                                        className: "me-2",
                                    },
                                    {
                                        id:"variant-summary-clinical-significance-variant-traits",
                                        style: "flex: 1 0 auto",
                                    },
                                ]
                            },
                            {
                                className: "d-flex align-items-stretch",
                                elements: [
                                    {
                                        id:"variant-summary-cs-cosmic-variant-traits",
                                        style: "flex: 1 0 auto",
                                    },
                                    /*
                                    {
                                        id:"variant-summary-clinical-significance-variant-traits",
                                        style: "flex: 1 0 auto",
                                    },
                                     */
                                ]
                            },
                            /*
                            {
                                id: "",
                                className: "",
                                elements: [{
                                    id:"variant-summary-deleteriousness",
                                    className: "flex-grow-1",
                                }],
                            },
                             */
                        ]
                    },
                    elements: [
                        {
                            id: "variant-summary-info",
                            type: "custom",
                            title: "",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    return html`
                                        <variant-summary-info
                                            .variant="${variant}"
                                            .settings="${this.settings}">
                                        </variant-summary-info>
                                    `;
                                }
                            }
                        },
                        {
                            id: "variant-summary-ct-selected",
                            type: "custom",
                            title: "",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    return html`
                                        <variant-summary-ct-selected
                                            .variant="${variant}"
                                            .settings="${this.settings}">
                                        </variant-summary-ct-selected>
                                    `;
                                }
                            }
                        },
                        /*
                        {
                            id: "variant-summary-ct-no-selected",
                            type: "custom",
                            title: "",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    return html`
                                        <variant-summary-ct-no-selected
                                            .variant="${variant}"
                                            .settings="${this.settings}">
                                        </variant-summary-ct-no-selected>
                                    `;
                                }
                            }
                        },
                         */
                        // - Clinical Significance
                        {
                            id: "variant-summary-clinical-significance",
                            type: "custom",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    return html`
                                        <variant-summary-clinical-significance
                                           .variant="${variant}">
                                        </variant-summary-clinical-significance>
                                    `;
                                }
                            },
                        },
                        // - Variant trait association clinvar
                        {
                            id: "variant-summary-clinical-significance-variant-traits",
                            type: "custom",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    return html`
                                        <variant-summary-clinical-significance-variant-traits
                                           .variant="${variant}">
                                        </variant-summary-clinical-significance-variant-traits>
                                    `;
                                }
                            },
                        },
                        // - Variant trait association cosmic
                        {
                            id: "variant-summary-cs-cosmic-variant-traits",
                            type: "custom",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    return html`
                                        <variant-summary-cs-cosmic-variant-traits
                                           .variant="${variant}">
                                        </variant-summary-cs-cosmic-variant-traits>
                                    `;
                                }
                            },
                        },
                        /*
                        {
                            id: "variant-summary-gene",
                            type: "custom",
                            title: "Gene-Disease Association",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    return html`
                                        <variant-summary-gene
                                            .variant="${variant}"
                                            .opencgaSession="${this.opencgaSession}">
                                        </variant-summary-gene>
                                    `;
                                }
                            }
                        }
                        */
                        /*
                        // - Deleteriousness
                        {
                            id: "variant-summary-deleteriousness",
                            type: "custom",
                            title: "",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    return html`
                                        <variant-summary-deleteriousness
                                            .variant="${variant}"
                                            .settings="${this.settings}">
                                        </variant-summary-deleteriousness>
                                    `;
                                }
                            }
                        },
                        */
                        // - Gene/Disease Association
                        // - Conservation
                        // - Pubmed
                        // - Drug target
                    ],
                },
                // 1. Interpretation summary, if available
                // - Clinical Significance selected interpretation
                // - Variant interpretation selected interpretation
                // - ACMG Classification selected interpretation
                // - User classification selected interpretation
                /*
                {
                    display: {},
                    elements: [
                        {
                            id: "variant-summary-interpretation",
                            type: "custom",
                            title: "",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    return html`
                                        <variant-summary-interpretation
                                            .variant="${variant}"
                                            .opencgaSession="${this.opencgaSession}">
                                        </variant-summary-interpretation>
                                    `;
                                }
                            },
                        },
                    ],
                },
                 */
            ],
        };
    }

}

customElements.define("variant-summary", VariantSummary);
