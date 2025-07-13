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
import "./variant-summary-quality.js"
// import "./variant-summary-population.js"
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
                // 4. Clinical Significance
                {
                    // title: "Clinical Significance",
                    display: {
                        //visible: null,// individual => individual?.id,
                        layout: [
                            {
                                id: "",
                                className: "d-flex",
                                elements: [
                                    {
                                        id: "variant-summary-info",
                                        className: "flex-grow-1",
                                    },
                                    {
                                        id: "variant-summary-ct-selected",
                                        className: "flex-grow-1",
                                    },
                                    {
                                        id: "variant-summary-ct-no-selected",
                                        className: "flex-grow-1",
                                    },
                                ]
                            },
                            {
                                id: "",
                                className: "d-flex flex-wrap",
                                elements: [
                                    {
                                        id:"variant-summary-clinical-significance",
                                        className: "w-50",
                                    },
                                    {
                                        id:"variant-summary-clinical-significance-variant-traits",
                                        className: "w-50",
                                    },
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
                        // - Variant Info
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
                        // - Variant trait association
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
}*/
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
                // 2. Variant quality
                {
                    // title: "Sample Quality Summary",
                    // description: "Information related to sample quality",
                    display: {},
                    elements: [
                        {
                            id: "variant-summary-quality",
                            type: "custom",
                            title: "",
                            display: {
                                containerClassName: "",
                                titleClassName: "",
                                titleStyle: "",
                                render: variant => {
                                    const samplesQuality = variant.studies.find(study => study.studyId === this.opencgaSession.study.fqn)
                                    return html`
                                        <variant-summary-quality
                                            .samplesQuality="${samplesQuality}"
                                            .variant="${variant}"
                                            .opencgaSession="${this.opencgaSession}">
                                        </variant-summary-quality>
                                    `;
                                }
                            }
                        }
                    ],
                },
                // 3. Population Summary
                /*
                {
                    title: "Population Summary",
                    description: "Information related to population",
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
                */

            ],
        };
    }

}

customElements.define("variant-summary", VariantSummary);
