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
import ExtensionsManager from "../extensions-manager.js";
import "../commons/forms/data-form.js";
import "../commons/json-viewer.js";
import "./variant-cohort-stats.js";
import "./variant-samples.js";
import "./variant-notes.js";
import "./annotation/variant-annotation-pharmacogenomics-view.js";
import "./annotation/variant-annotation-clinical-view.js";
import "./annotation/cellbase-population-frequency-grid.js";
import "./annotation/variant-consequence-type-view.js";
import "./annotation/variant-summary.js";
import "./variant-beacon-network.js";

export default class VariantView extends LitElement {

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
        this.COMPONENT_ID = "variant-view";
        this._variant = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }

        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        if (changedProperties.has("displayConfig") || changedProperties.has("opencgaSession")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        this._variant = {...this.variant};
    }

    variantIdObserver() {
        this._variant = null;
        if (this.opencgaSession && this.variantId) {
            this.opencgaSession.opencgaClient.variants()
                .query({
                    id: this.variantId,
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._variant = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    render() {
        if (!this.opencgaSession || !this._variant) {
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
            display: {
                type: "pills",
                pillsLeftColumnClass: "col-md-2",
                pillsRightColumnClass: "col-md-10",
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "annotation-summary",
                    name: "Overview",
                    render: (variant, active) => html`
                        <variant-summary
                            .active="${active}"
                            .variant="${variant}"
                            .clinical="${false}"
                            .consequenceTypes="${this.consequenceTypes || CONSEQUENCE_TYPES}"
                            .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}"
                            .settings="${this.settings}"
                            .opencgaSession="${this.opencgaSession}"
                            .assembly="${this.opencgaSession?.project?.organism?.assembly}">
                        </variant-summary>
                    `,
                },
                {
                    id: "annotation-consequence-type",
                    name: "Consequence Type",
                    render: (variant, active) => html`
                        <variant-consequence-type-view
                            .consequenceTypes="${variant?.annotation?.consequenceTypes}"
                            .active="${active}">
                        </variant-consequence-type-view>
                    `,
                },
                {
                    id: "annotationPropFreq",
                    name: "Population Frequencies",
                    render: (variant, active) => html`
                        <cellbase-population-frequency-grid
                            .populationFrequencies="${variant?.annotation?.populationFrequencies}"
                            .active="${active}">
                        </cellbase-population-frequency-grid>
                    `,
                },
                {
                    id: "annotationClinical",
                    name: "Clinical",
                    render: variant => html`
                        <variant-annotation-clinical-view
                            .traitAssociation="${variant?.annotation?.traitAssociation}"
                            .geneTraitAssociation="${variant?.annotation?.geneTraitAssociation}">
                        </variant-annotation-clinical-view>
                    `,
                },
                {
                    id: "annotationPharmacogenomics",
                    name: "Pharmacogenomics",
                    render: variant => html`
                        <variant-annotation-pharmacogenomics-view
                            .pharmacogenomics="${variant?.annotation?.pharmacogenomics}">
                        </variant-annotation-pharmacogenomics-view>
                    `,
                },
                {
                    id: "cohortStats",
                    name: "Cohort Variant Stats",
                    render: (variant, active) => html`
                        <variant-cohort-stats
                            .opencgaSession="${this.opencgaSession}"
                            .variant="${variant}"
                            .config="${this.cohortConfig}"
                            .active="${active}">
                        </variant-cohort-stats>
                    `,
                },
                {
                    id: "samples",
                    name: "Samples",
                    render: (variant, active) => html`
                        <variant-samples
                            .opencgaSession="${this.opencgaSession}"
                            .variantId="${variant.id}"
                            .active="${active}">
                        </variant-samples>
                    `,
                },
                {
                    id: "notes",
                    name: "Notes",
                    render: (variant, active) => html`
                        <variant-notes
                            .opencgaSession="${this.opencgaSession}"
                            .variant="${variant}"
                            .active="${active}">
                        </variant-notes>
                    `,
                },
                {
                    id: "beacon",
                    name: "Beacon",
                    render: (variant, active) => html`
                        <variant-beacon-network
                            .variant="${variant.id}"
                            .assembly="${this.opencgaSession.project.organism.assembly}"
                            .config="${this.beaconConfig}"
                            .active="${active}">
                        </variant-beacon-network>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (variant, active) => html`
                        <json-viewer
                            .data="${variant}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
                ...ExtensionsManager.getViews(this.COMPONENT_ID, this.opencgaSession),
            ],
        };
    }

}

customElements.define("variant-view", VariantView);
