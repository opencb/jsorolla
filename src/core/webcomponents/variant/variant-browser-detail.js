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

import {LitElement, html} from "/web_modules/lit-element.js";
import "./annotation/cellbase-variant-annotation-summary.js";
import "./annotation/variant-consequence-type-view.js";
import "./annotation/cellbase-population-frequency-grid.js";
import "./annotation/variant-annotation-clinical-view.js";
import "./variant-cohort-stats.js";
import "./opencga-variant-samples.js";


export default class VariantBrowserDetail extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
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
        this._config = this.getDefaultConfig();
    }

    firstUpdated(_changedProperties) {
        this._config = {...this.getDefaultConfig(), ...this.config};

        for (const item of this._config.items) {
            switch (item.id) {
                case "cohortStats":
                    this.cohortConfig = {cohorts: item.cohorts};
                    break;
            }
        }
    }

    update(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }

        super.update(changedProperties);
    }

    variantIdObserver() {
        if (this.cellbaseClient && this.variantId) {
            this.cellbaseClient.get("genomic", "variant", this.variantId, "annotation", {assembly: this.opencgaSession.project.organism.assembly}, {})
                .then(response => {
                    this.variant = {
                        id: this.variantId,
                        annotation: response.responses[0].results[0]
                    };
                });
        } else {
            this.variant = null;
        }
    }

    getDefaultConfig() {
        return {
            title: "Selected Variant:",
            showTitle: true,
            items: [
                {
                    id: "annotationSummary",
                    name: "Summary",
                    active: true,
                    render: variant => {
                        return html`
                            <cellbase-variant-annotation-summary
                                    .variantAnnotation="${variant.annotation}"
                                    .consequenceTypes="${CONSEQUENCE_TYPES}"
                                    .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}">
                            </cellbase-variant-annotation-summary>`;
                    }
                },
                {
                    id: "annotationConsType",
                    name: "Consequence Type",
                    render: (variant, active) => {
                        return html`
                            <variant-consequence-type-view
                                    .consequenceTypes="${variant.annotation.consequenceTypes}"
                                    .active="${active}">
                            </variant-consequence-type-view>`;
                    }
                },
                {
                    id: "annotationPropFreq",
                    name: "Population Frequencies",
                    render: (variant, active) => {
                        return html`
                            <cellbase-population-frequency-grid
                                    .populationFrequencies="${variant.annotation.populationFrequencies}"
                                    .active="${active}">
                            </cellbase-population-frequency-grid>`;
                    }
                },
                {
                    id: "annotationClinical",
                    name: "Clinical",
                    render: variant => {
                        return html`
                            <variant-annotation-clinical-view
                                    .traitAssociation="${variant.annotation.traitAssociation}"
                                    .geneTraitAssociation="${variant.annotation.geneTraitAssociation}">
                            </variant-annotation-clinical-view>`;
                    }
                },
                {
                    id: "cohortStats",
                    name: "Cohort Variant Stats",
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <variant-cohort-stats
                                    .opencgaSession="${opencgaSession}"
                                    .variant="${variant}"
                                    .config="${this.cohortConfig}"
                                    .active="${active}">
                            </variant-cohort-stats>`;
                    }
                },
                {
                    id: "samples",
                    name: "Samples",
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <opencga-variant-samples
                                    .opencgaSession="${opencgaSession}"
                                    .variantId="${variant.id}"
                                    .active="${active}">
                            </opencga-variant-samples>`;
                    }
                },
                {
                    id: "beacon",
                    name: "Beacon",
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <variant-beacon-network
                                    .variant="${variant.id}"
                                    .assembly="${opencgaSession.project.organism.assembly}"
                                    .config="${this.beaconConfig}"
                                    .active="${active}">
                            </variant-beacon-network>`;
                    }
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (variant, active, opencgaSession) => {
                        return html`<json-viewer .data="${variant}" .active="${active}"></json-viewer>`;
                    }
                }
                // TODO Think about Networks
                // {
                //     id: "network",
                //     title: "Reactome Pathways"
                // },
            ]
        };
    }

    render() {
        if (!this.cellbaseClient) {
            return html`<h3>No CellBase Client found</h3>`;
        }

        if (!this.variant) {
            // return html`<!--<h3>No Variant found</h3>-->`;
            return;
        }

        if (!this.variant.annotation) {
            return html`<h3>No Variant Annotation found</h3>`;
        }

        return html`
            <detail-tabs
                    .data="${this.variant}"
                    .config="${this._config}"
                    .opencgaSession="${this.opencgaSession}">
            </detail-tabs>`;
    }

}

customElements.define("variant-browser-detail", VariantBrowserDetail);
