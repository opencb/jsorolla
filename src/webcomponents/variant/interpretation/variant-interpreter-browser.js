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
import UtilsNew from "../../../core/utilsNew.js";
import Region from "../../../core/bioinfo/region.js";
import "./variant-interpreter-browser-rd.js";
import "./variant-interpreter-browser-cancer.js";
import "./variant-interpreter-browser-cnv.js";
import "./variant-interpreter-browser-rearrangement.js";
import "../../visualization/genome-browser.js";
import "../../commons/view/detail-tabs.js";

class VariantInterpreterBrowser extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            settings: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this._activeTab = null;
        this._genomeBrowserRegion = null;

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        if (this.clinicalAnalysis) {
            switch (this.clinicalAnalysis.type.toUpperCase()) {
                case "SINGLE":
                case "FAMILY":
                    this._sample = this.clinicalAnalysis.proband.samples[0];
                    break;
                case "CANCER":
                    this._somaticSample = this.clinicalAnalysis.proband.samples.find(s => s.somatic);
                    this._germlineSample = this.clinicalAnalysis.proband.samples.find(s => !s.somatic);
                    break;
            }
            this._config = this.getDefaultConfig();
        }
        this.requestUpdate();
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

    // onClinicalAnalysisUpdate(e) {
    //     LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
    //         clinicalAnalysis: e.detail.clinicalAnalysis,
    //     }, null);
    // }

    onGenomeBrowserRegionChange(event) {
        this._genomeBrowserRegion = event.detail.region;
        this._config = this.getDefaultConfig();
        this._activeTab = "genome-browser";

        this.requestUpdate();
    }

    onActiveTabChange(event) {
        this._activeTab = event.detail.value;
        this.requestUpdate();
    }

    render() {
        // Check if project exists
        if (!this.opencgaSession?.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        if (!this.clinicalAnalysis) {
            return html`
                <div class="guard-page">
                    <h3>No Case found</h3>
                </div>
            `;
        }

        if (!this.clinicalAnalysis.proband?.samples?.length) {
            return html`
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-3x fa-exclamation-circle align-middle"></i>
                    No sample available for Proband
                </div>
            `;
        }

        return html`
            <detail-tabs
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                .activeTab="${this._activeTab}"
                .opencgaSession="${this.opencgaSession}"
                @activeTabChange="${e => this.onActiveTabChange(e)}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        const items = [];

        // Check for clinicalAnalysis
        if (this.clinicalAnalysis) {
            const type = this.clinicalAnalysis.type.toUpperCase();

            // Genome browser configuration
            const genomeBrowserRegion = this._genomeBrowserRegion || this.clinicalAnalysis.interpretation.primaryFindings[0];
            const genomeBrowserTracks = [
                {
                    type: "gene-overview",
                    overview: true,
                    config: {},
                },
                {
                    type: "sequence",
                    config: {},
                },
                {
                    type: "gene",
                    config: {},
                },
                {
                    type: "opencga-variant",
                    config: {
                        title: "Variants",
                        query: {
                            sample: this.clinicalAnalysis.proband.samples.map(s => s.id).join(","),
                        },
                    },
                },
                ...(this.clinicalAnalysis.proband?.samples || []).map(sample => ({
                    type: "opencga-alignment",
                    config: {
                        title: `Alignments - ${sample.id}`,
                        sample: sample.id,
                    },
                })),
            ];
            const genomeBrowserConfig = {
                cellBaseClient: this.cellbaseClient,
                featuresOfInterest: [],
            };

            // Add interpretation panels to features of interest
            if (this.clinicalAnalysis?.interpretation?.panels?.length > 0) {
                genomeBrowserConfig.featuresOfInterest.push({
                    name: "Panels of the interpretation",
                    category: true,
                });

                const colors = ["green", "blue", "darkorange", "blueviolet", "sienna", "indigo", "salmon"];
                const assembly = this.opencgaSession.project.organism?.assembly;
                this.clinicalAnalysis.interpretation.panels.forEach((panel, index) => {
                    genomeBrowserConfig.featuresOfInterest.push({
                        name: panel.name,
                        features: panel.genes
                            .map(gene => {
                                const coordinates = gene?.coordinates?.find(c => c.assembly === assembly);
                                if (!coordinates) {
                                    return null;
                                } else {
                                    const region = new Region(coordinates.location);
                                    return {
                                        chromosome: region.chromosome,
                                        start: region.start,
                                        end: region.end,
                                        name: `
                                            <div>${gene.name}</div>
                                            <div class="small text-muted">${region.toString()}</div>
                                        `,
                                    };
                                }
                            })
                            .filter(gene => !!gene)
                            .sort((a, b) => a.name < b.name ? -1 : +1),
                        display: {
                            visible: true,
                            color: colors[index % colors.length],
                        },
                    });
                });
            }

            if (this.clinicalAnalysis.interpretation?.primaryFindings.length > 0) {
                if (genomeBrowserConfig.featuresOfInterest.length > 0) {
                    genomeBrowserConfig.featuresOfInterest.push({separator: true});
                }
                genomeBrowserConfig.featuresOfInterest.push({
                    name: "Variants",
                    category: true,
                });
                genomeBrowserConfig.featuresOfInterest.push({
                    name: "Primary Findings",
                    features: this.clinicalAnalysis.interpretation.primaryFindings.map(feature => {
                        const genes = Array.from(new Set(feature.annotation.consequenceTypes.filter(ct => !!ct.geneName).map(ct => ct.geneName)));
                        return {
                            id: feature.id,
                            chromosome: feature.chromosome,
                            start: feature.start,
                            end: feature.end ?? (feature.start + 1),
                            name: `
                                <div style="padding-top:4px;padding-bottom:4px;">
                                    <div>${feature.id} (${feature.type})</div>
                                    ${feature.annotation.displayConsequenceType ? `
                                        <div class="small text-primary">
                                            <strong>${feature.annotation.displayConsequenceType}</strong>
                                        </div>
                                    ` : ""}
                                    ${genes.length > 0 ? `
                                        <div class="small text-muted">${genes.join(", ")}</div>
                                    ` : ""}
                                </div>
                            `,
                        };
                    }),
                    display: {
                        visible: true,
                        color: "red",
                    },
                });
            }

            if (type === "SINGLE" || type === "FAMILY") {
                items.push({
                    id: "variant-browser",
                    name: "Variant Browser",
                    active: true,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`
                            <div class="col-md-12">
                                <tool-header
                                    title="Variant Browser - ${this._sample?.id}"
                                    class="bg-white"></tool-header>
                                <variant-interpreter-browser-rd
                                    .opencgaSession="${opencgaSession}"
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .cellbaseClient="${this.cellbaseClient}"
                                    .settings="${{
                                        ...this.settings.browsers["RD"],
                                        hideGenomeBrowser: !!this.settings.hideGenomeBrowser,
                                    }}"
                                    @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}"
                                    @genomeBrowserRegionChange="${e => this.onGenomeBrowserRegionChange(e)}"
                                    @samplechange="${this.onSampleChange}">
                                </variant-interpreter-browser-rd>
                            </div>
                        `;
                    }
                });
            } else {
                if (type === "CANCER") {
                    // Add somatic variant browser
                    items.push({
                        id: "cancer-somatic-variant-browser",
                        name: "Somatic Small Variants",
                        active: true,
                        render: (clinicalAnalysis, active, opencgaSession) => {
                            return html`
                                <div class="col-md-12">
                                    <tool-header
                                        title="Somatic Variant Browser - ${this._somaticSample?.id}"
                                        class="bg-white"></tool-header>
                                    <variant-interpreter-browser-cancer
                                        .opencgaSession="${opencgaSession}"
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .cellbaseClient="${this.cellbaseClient}"
                                        .settings="${{
                                            ...this.settings.browsers["CANCER_SNV"],
                                            hideGenomeBrowser: !!this.settings.hideGenomeBrowser,
                                        }}"
                                        @genomeBrowserRegionChange="${e => this.onGenomeBrowserRegionChange(e)}"
                                        @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                    </variant-interpreter-browser-cancer>
                                </div>
                            `;
                        }
                    });

                    // Add CNV Variant browser
                    if (this.settings.browsers["CANCER_CNV"]) {
                        items.push({
                            id: "somatic-cnv-variant-browser",
                            name: "Somatic CNV Variants",
                            active: false,
                            render: (clinicalAnalysis, active, opencgaSession) => html`
                                <div class="col-md-12">
                                    <tool-header
                                        title="Somatic CNV Variant Browser - ${this._somaticSample?.id}"
                                        class="bg-white">
                                    </tool-header>
                                    <variant-interpreter-browser-cnv
                                        .opencgaSession="${opencgaSession}"
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .query="${this.query}"
                                        .cellbaseClient="${this.cellbaseClient}"
                                        .settings="${{
                                            ...this.settings.browsers["CANCER_CNV"],
                                            hideGenomeBrowser: !!this.settings.hideGenomeBrowser,
                                        }}"
                                        @genomeBrowserRegionChange="${e => this.onGenomeBrowserRegionChange(e)}"
                                        @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                    </variant-interpreter-browser-cnv>
                                </div>
                            `,
                        });
                    }

                    // Check for adding rearrangements variant browser
                    if (this.settings.browsers["REARRANGEMENT"]) {
                        items.push({
                            id: "cancer-somatic-rearrangement-variant-browser",
                            name: "Somatic Rearrangement Variants",
                            render: (clinicalAnalysis, active, opencgaSession) => html`
                                <div class="col-md-12">
                                    <tool-header
                                        title="Somatic Rearrangement Variant Browser - ${this._somaticSample?.id}"
                                        class="bg-white">
                                    </tool-header>
                                    <variant-interpreter-browser-rearrangement
                                        .opencgaSession="${opencgaSession}"
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .cellbaseClient="${this.cellbaseClient}"
                                        .settings="${{
                                            ...this.settings.browsers["REARRANGEMENT"],
                                            hideGenomeBrowser: !!this.settings.hideGenomeBrowser,
                                        }}"
                                        ?active="${active}"
                                        @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                    </variant-interpreter-browser-rearrangement>
                                </div>
                            `,
                        });
                    }

                    // Check for adding germline browser
                    if (this._germlineSample) {
                        items.push({
                            id: "cancer-germline-variant-browser",
                            name: "Germline Small Variants",
                            render: (clinicalAnalysis, active, opencgaSession) => {
                                return html`
                                    <div class="col-md-12">
                                        <tool-header
                                            title="Germline Variant Browser - ${this._germlineSample?.id}"
                                            class="bg-white">
                                        </tool-header>
                                        <variant-interpreter-browser-rd
                                            .opencgaSession="${opencgaSession}"
                                            .clinicalAnalysis="${clinicalAnalysis}"
                                            .cellbaseClient="${this.cellbaseClient}"
                                            .settings="${{
                                                ...this._config,
                                                hideGenomeBrowser: !!this.settings.hideGenomeBrowser,
                                            }}"
                                            @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}"
                                            @genomeBrowserRegionChange="${e => this.onGenomeBrowserRegionChange(e)}"
                                            @samplechange="${this.onSampleChange}">
                                        </variant-interpreter-browser-rd>
                                    </div>
                                `;
                            },
                        });
                        items.push({
                            id: "rearrangement-germline-variant-browser",
                            name: "Germline Rearrangement Variants",
                            render: (clinicalAnalysis, active, opencgaSession) => html`
                                <div class="col-md-12">
                                    <tool-header
                                        title="Germline Rearrangement Variant Browser - ${this._germlineSample?.id}"
                                        class="bg-white">
                                    </tool-header>
                                    <variant-interpreter-browser-rearrangement
                                        .opencgaSession="${opencgaSession}"
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .somatic="${false}"
                                        .cellbaseClient="${this.cellbaseClient}"
                                        .settings="${{
                                            ...this.settings.browsers["REARRANGEMENT"],
                                            hideGenomeBrowser: !!this.settings.hideGenomeBrowser,
                                        }}"
                                        ?active="${active}"
                                        @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                    </variant-interpreter-browser-rearrangement>
                                </div>
                            `,
                        });
                    }
                }
            }

            // Append genome browser
            if (this.settings.hideGenomeBrowser === undefined || this.settings.hideGenomeBrowser === false) {
                items.push({
                    id: "genome-browser",
                    name: "Genome Browser (Beta)",
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <div style="margin-top:16px;">
                            <genome-browser
                                .opencgaSession="${opencgaSession}"
                                .region="${clinicalAnalysis.interpretation?.primaryFindings?.[0] || ""}"
                                .active="${active}"
                                .config="${genomeBrowserConfig}"
                                .tracks="${genomeBrowserTracks}">
                            </genome-browser>
                        </div>
                    `,
                });
            }
        }

        // Return tabs configuration
        return {
            // title: "Variant Interperter Browser",
            display: {
                align: "center",
            },
            items: items,
        };
    }

}

customElements.define("variant-interpreter-browser", VariantInterpreterBrowser);
