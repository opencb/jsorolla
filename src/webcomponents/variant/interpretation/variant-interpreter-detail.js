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
import "../../clinical/interpretation/clinical-interpretation-variant-review.js";
import "../annotation/cellbase-variantannotation-view.js";
import "../annotation/variant-consequence-type-view.js";
import "../annotation/variant-annotation-clinical-view.js";
import "../opencga-variant-file-metrics.js";
import "../variant-beacon-network.js";
import "../variant-samples.js";
import "../../commons/view/detail-tabs.js";

export default class VariantInterpreterDetail extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            variant: {
                type: Object
            },
            variantId: {
                type: String
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
        // Initially we set the default config, this will be overridden if 'config' is passed
        this._config = this.getDefaultConfig();
    }

    firstUpdated() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    update(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    variantIdObserver() {
        if (this.cellbaseClient && this.variantId) {
            this.cellbaseClient.get("genomic", "variant", this.variantId, "annotation", {assembly: this.opencgaSession.project.organism.assembly}, {})
                .then(restReponse => {
                    this.variant = {
                        id: this.variantId,
                        annotation: restReponse.getResult(0)
                    };
                });
        }
    }

    render() {

        if (!this.opencgaSession) {
            return "";
        }

        if (!this.variant?.annotation && !Array.isArray(this.variant)) {
            return;
        }

        if (!this._config?.items) {
            return html`<h3>Error: No valid tab configuration</h3>`;
        }

        return html`
            <detail-tabs
                .data="${this.variant}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Selected Variant: ",
            showTitle: true,
            items: [
                {
                    id: "annotationSummary",
                    name: "Summary",
                    active: true,
                    render: variant => html`
                        <cellbase-variant-annotation-summary
                            .variantAnnotation="${variant.annotation}"
                            .consequenceTypes="${CONSEQUENCE_TYPES}"
                            .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}"
                            .assembly="${this.opencgaSession.project.organism.assembly}">
                        </cellbase-variant-annotation-summary>
                    `,
                },
                {
                    id: "annotationConsType",
                    name: "Consequence Type",
                    render: (variant, active) => html`
                        <variant-consequence-type-view
                            .consequenceTypes="${variant.annotation.consequenceTypes}"
                            .active="${active}">
                        </variant-consequence-type-view>
                    `,
                },
                {
                    id: "annotationPropFreq",
                    name: "Population Frequencies",
                    render: (variant, active) => html`
                        <cellbase-population-frequency-grid
                            .populationFrequencies="${variant.annotation.populationFrequencies}"
                            .active="${active}">
                        </cellbase-population-frequency-grid>
                    `,
                },
                {
                    id: "annotationClinical",
                    name: "Clinical",
                    render: variant => html`
                        <variant-annotation-clinical-view
                            .traitAssociation="${variant.annotation.traitAssociation}"
                            .geneTraitAssociation="${variant.annotation.geneTraitAssociation}">
                        </variant-annotation-clinical-view>
                    `,
                },
                {
                    id: "fileMetrics",
                    name: "File Metrics",
                    render: (variant, _active, opencgaSession) => html`
                        <opencga-variant-file-metrics
                            .opencgaSession="${opencgaSession}"
                            .variant="${variant}"
                            .files="${this.clinicalAnalysis}">
                        </opencga-variant-file-metrics>
                    `,
                },
                {
                    id: "cohortStats",
                    name: "Cohort Stats",
                    render: (variant, active, opencgaSession) => html`
                        <variant-cohort-stats
                            .opencgaSession="${opencgaSession}"
                            .variantId="${variant.id}"
                            .active="${active}">
                        </variant-cohort-stats>
                    `,
                },
                {
                    id: "samples",
                    name: "Samples",
                    render: (variant, active, opencgaSession) => html`
                        <variant-samples
                            .opencgaSession="${opencgaSession}"
                            .variantId="${variant.id}"
                            .active="${active}">
                        </variant-samples>
                    `,
                },
                {
                    id: "beacon",
                    name: "Beacon",
                    render: (variant, active, opencgaSession) => html`
                        <variant-beacon-network
                            .variant="${variant.id}"
                            .assembly="${opencgaSession.project.organism.assembly}"
                            .config="${this.beaconConfig}"
                            .active="${active}">
                        </variant-beacon-network>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (variant, active) => html`
                        <json-viewer .data="${variant}" .active="${active}"></json-viewer>
                    `,
                }
                // TODO Think about the possibility of allowing plugins here
                // {
                //     id: "variantDetail",
                //     name: "Variant Detail",
                //     render: (variant, active,opencgaSession) => {
                //         return html`
                //             <opencga-variant-detail-template
                //                 .opencgaSession="${opencgaSession}"
                //                 .variant="${variant.id}"
                //                 .active="${active}">
                //             </opencga-variant-detail-template>`;
                //     }
                // }
            ]
        };
    }

}

customElements.define("variant-interpreter-detail", VariantInterpreterDetail);
