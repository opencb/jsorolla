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
import UtilsNew from "../../../core/utils-new.js";
import "./variant-interpreter-pharmacogenomics-grid.js";
import "./variant-interpreter-pharmacogenomics-detail.js";

class VariantInterpreterPharmacogenomicsBrowser extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            settings: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this.query = {};
        this.activeFilterFilters = [];
        this.savedVariants = [];
        this.exampleVariants = [
            {
                id: "rs578776",
                gene: "CHRNA3",
                genotype: "A/A",
                drugs: ["nicotine"],
                pmid: "26010901",
                phenotypeCategory: "Metabolism/PK",
                chromosome: "15",
                start: 78596058,
                end: 78596058,
                sentence: "Allele A is not associated with dose of nicotine in people with Tobacco Use Disorder as compared to allele G.",
                genotypes: [
                    {
                        genotype: "AA",
                        annotationText: "Patients with the rs578776 AA genotype may have a decreased risk for nicotine dependence as compared to patients with the GG genotype. However, conflicting evidence has been reported. Other genetic and clinical factors may also influence risk for nicotine dependence and cotinine levels.",
                    },
                    {
                        genotype: "AG",
                        annotationText: "Patients with the rs578776 AG genotype may have a decreased risk for nicotine dependence as compared to patients with the GG genotype, or an increased risk as compared to patients with the AA genotype. However, conflicting evidence has been reported. Other genetic and clinical factors may also influence risk for nicotine dependence and cotinine levels.",
                    },
                    {
                        genotype: "GG",
                        annotationText: "Patients with the rs578776 GG genotype may have an increased risk for nicotine dependence as compared to patients with the AA or AG genotype. However, conflicting evidence has been reported. Other genetic and clinical factors may also influence risk for nicotine dependence and cotinine levels."
                    }
                ],
            },
            {
                id: "rs4444903",
                gene: "EGF",
                genotype: "A/G",
                drugs: ["cetuximab", "panitumumab"],
                pmid: "27897268",
                phenotypeCategory: "Efficacy",
                chromosome: "4",
                start: 109912954,
                end: 109912954,
                sentence: "Allele G is not associated with response to cetuximab or panitumumab in people with Colorectal Neoplasms as compared to allele A.",
                genotypes: [{
                    genotype: "AA",
                    annotationText: "Patients with the rs4444903 AA genotype may have a poorer response to cetuximab as compared to patients with the GG genotype. However, conflicting evidence has been reported. Other genetic and clinical factors may also influence a patient's response to cetuximab treatment."
                },
                {
                    genotype: "AG",
                    annotationText: "Patients with the rs4444903 AG genotype may have a poorer response to cetuximab as compared to patients with the GG genotype or may have a better response as compared to patients with the AA genotype. However, conflicting evidence has been reported. Other genetic and clinical factors may also influence a patient's response to cetuximab treatment."
                },
                {
                    genotype: "GG",
                    annotationText: "Patients with the rs4444903 GG genotype may have a better response to cetuximab as compared to patients with the AA genotype. However, conflicting evidence has been reported. Other genetic and clinical factors may also influence a patient's response to cetuximab treatment."
                }],
            },
        ];

        this._detail = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        // TODO
    }

    onClickRow(e, resource) {
        this._detail = {
            ...this.detail,
            [resource]: e.detail.row,
        };
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="col-md-10 col-md-offset-1">
                <variant-interpreter-pharmacogenomics-grid
                    .opencgaSession="${this.opencgaSession}"
                    .clinicalAnalysis="${this.clinicalAnalysis}"
                    .clinicalVariants="${this.exampleVariants}"
                    .config="${this._config?.grid}"
                    @selectrow="${e => this.onClickRow(e, "variant")}">
                </variant-interpreter-pharmacogenomics-grid>
                <variant-interpreter-pharmacogenomics-detail
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config?.detail}"
                    .variant="${this._detail?.variant}">
                </variant-interpreter-pharmacogenomics-detail>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            grid: {},
            detail: {
                title: "Pharmacogenomics",
                showTitle: true,
                items: [
                    {
                        id: "json-view",
                        name: "JSON Data",
                        mode: "development",
                        render: (variant, active, opencgaSession) => {
                            return html`
                                <json-viewer
                                    .data="${variant}"
                                    .active="${active}">
                                </json-viewer>
                            `;
                        }
                    }
                ]
            }
        };
    }

}

customElements.define("variant-interpreter-pharmacogenomics-browser", VariantInterpreterPharmacogenomicsBrowser);
