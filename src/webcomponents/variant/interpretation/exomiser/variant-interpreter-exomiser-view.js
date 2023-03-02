/*
 * Copyright 2015-Present OpenCB
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
import "../../../commons/forms/data-form.js";
import VariantGridFormatter from "../../variant-grid-formatter.js";
import UtilsNew from "../../../../core/utils-new.js";

class VariantInterpreterExomiserView extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variant: {
                type: Object
            },
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this.variant = null;
        this.active = false;
        this.genes = [];
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        this.genes = [];
        if (this.variant?.evidences?.length > 0) {
            const uniqueGenesList = new Set();
            this.variant.evidences.forEach(evidence => {
                if (evidence?.genomicFeature?.geneName) {
                    uniqueGenesList.add(evidence.genomicFeature.geneName);
                }
            });

            this.genes = Array.from(uniqueGenesList);
        }

        // Update config for displaying the new genes info
        this.config = this.getDefaultConfig();
    }

    render() {
        return html`
            <div style="padding: 20px;">
                <data-form
                    .data="${this.variant}"
                    .config="${this.config}">
                </data-form>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "",
            display: {
                buttonsVisible: false,
            },
            sections: this.genes.map(geneName => {
                const evidences = this.variant?.evidences.filter(evidence => {
                    return evidence?.genomicFeature?.geneName === geneName;
                });

                return {
                    id: geneName,
                    title: geneName,
                    elements: [
                        {
                            title: "Functional Classification",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <span class="badge badge-danger" style="text-transform:uppercase;">
                                        <b>${evidences[0].attributes?.exomiser?.["FUNCTIONAL_CLASS"] ?? "-"}</b>
                                    </span>
                                `,
                            },
                        },
                        {
                            title: "Exomiser Score",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <b>${evidences[0].attributes?.exomiser?.["EXOMISER_GENE_COMBINED_SCORE"] ?? "-"}</b>
                                    <span style="margin-left:5px;">(p-value=${evidences[0].attributes?.exomiser?.["P-VALUE"] ?? "-"})</span>
                                `,
                            },
                        },
                        {
                            title: "Phenotype Score",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <b>${evidences[0].attributes?.exomiser?.["EXOMISER_GENE_PHENO_SCORE"] ?? "-"}</b>
                                `,
                            },
                        },
                        {
                            title: "Variant Score",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <b>${evidences[0].attributes?.exomiser?.["EXOMISER_GENE_VARIANT_SCORE"] ?? "-"}</b>
                                `,
                            },
                        },
                        {
                            title: "Exomiser ACMG",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <span class="badge badge-default">${evidences[0].attributes?.exomiser?.["EXOMISER_ACMG_CLASSIFICATION"] ?? "-"}</span>
                                    <span class="margin-left:8px">
                                        (Evidence: <b>${evidences[0].attributes?.exomiser?.["EXOMISER_ACMG_EVIDENCE"] ?? "-"}</b>)
                                    </span>
                                `,
                            },
                        },
                        {
                            title: "Exomiser ACMG Disease",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <b>${evidences[0].attributes?.exomiser?.["EXOMISER_ACMG_DISEASE_ID"] ?? "-"}</b>
                                    <span style="margin-left:8px;">
                                        (${evidences[0].attributes?.exomiser?.["EXOMISER_ACMG_DISEASE_NAME"] ?? "-"})
                                    </span>
                                `,
                            },
                        },
                        {
                            title: "Transcripts",
                            type: "custom",
                            display: {
                                render: () => evidences.map(evidence => {
                                    const link = VariantGridFormatter.getHgvsLink(evidence.genomicFeature.transcriptId, this.variant.annotation.hgvs) || "";
                                    return html`
                                        <div>${UtilsNew.renderHTML(link)}</div>
                                    `;
                                }),
                            },
                        },
                    ],
                };
            }),
        };
    }

}

customElements.define("variant-interpreter-exomiser-view", VariantInterpreterExomiserView);
