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
import {guardPage} from "../../commons/html-utils.js";
import ExtensionsManager from "../../extensions-manager.js";
import "./variant-interpreter-qc-overview.js";
import "./variant-interpreter-qc-gene-coverage.js";
import "../../commons/view/detail-tabs.js";
import "../../sample/sample-variant-stats-browser.js";
import "../../variant/analysis/family-qc-analysis.js";
import "../../variant/analysis/individual-qc-analysis.js";

class VariantInterpreterQc extends LitElement {

    // Defaults tabs for the interpreter qc
    // Customisable via external settings in variant-interpreter.settings.js
    static DEFAULT_TABS = [
        {id: "overview"},
        {id: "sampleVariantStats"},
        {id: "somaticVariantStats"},
        {id: "germlineVariantStats"},
        {id: "geneCoverage"}
    ];

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cellbaseClient: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            settings: {
                type: Object
            },
        };
    }

    #init() {
        this._tabs = [];
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        super.update(changedProperties);
    }

    settingsObserver() {
        this._tabs = this.settings?.tabs || VariantInterpreterQc.DEFAULT_TABS;
        this._config = this.getDefaultConfig();
    }

    clinicalAnalysisObserver() {
        if (this.clinicalAnalysis && this.clinicalAnalysis.proband?.samples) {
            if (this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
                this.somaticSample = this.clinicalAnalysis.proband.samples.find(elem => elem.somatic);
                // Germline sample is optional in cancer, it might not exist
                this.sample = this.clinicalAnalysis.proband.samples.find(elem => !elem.somatic);
            } else {
                // We only expect one sample in non cancer cases
                this.sample = this.clinicalAnalysis.proband.samples[0];
            }
        }
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    // this.clinicalAnalysisObserver();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession?.project) {
            return guardPage();
        }

        if (!this.clinicalAnalysis) {
            return html`
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-lock me-1"></i> No Case open
                </div>
            `;
        }

        if (!this.clinicalAnalysis.proband?.samples?.length) {
            return html`
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-circle me-1"></i> No sample available for Proband
                </div>
            `;
        }

        if (this._tabs.length === 0) {
            return html`
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-circle me-1"></i> No QC tab available. Check the tool configuration.
                </div>
            `;
        }

        return html`
            <detail-tabs
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        const items = [];

        if (this.clinicalAnalysis && this._tabs.length > 0) {
            const type = this.clinicalAnalysis.type.toUpperCase();
            const probandId = this.clinicalAnalysis.proband.id;
            const extensionsTabs = ExtensionsManager.getInterpretationQcTabs();

            this._tabs.forEach(tab => {
                switch (tab.id) {
                    case "overview":
                        items.push({
                            id: "overview",
                            name: "Overview",
                            active: true,
                            render: (clinicalAnalysis, active, opencgaSession) => {
                                return html`
                                    <div class="col-md-10 offset-md-1">
                                        <tool-header title="Quality Control Overview - ${probandId}" class="bg-white"></tool-header>
                                        <variant-interpreter-qc-overview
                                            .opencgaSession="${opencgaSession}"
                                            .clinicalAnalysis="${clinicalAnalysis}"
                                            .active="${active}"
                                            .settings="${this.settings?.tabs?.find(tab => "overview" === tab.id)?.settings}">
                                        </variant-interpreter-qc-overview>
                                    </div>
                                `;
                            },
                        });
                        break;
                    case "sampleVariantStats":
                        if (type === "SINGLE") {
                            items.push({
                                id: "individual-qc-analysis",
                                name: "Individual QC Analysis",
                                render: (clinicalAnalysis, active, opencgaSession) => {
                                    return html`
                                        <div class="col-md-12">
                                            <tool-header title="Individual QC Analysis - ${probandId}" class="bg-white"></tool-header>
                                            <individual-qc-analysis
                                                .toolParams="${{individual: clinicalAnalysis.proband?.id}}"
                                                .opencgaSession="${opencgaSession}"
                                                .config=${{title: ""}}>
                                            </individual-qc-analysis>
                                        </div>
                                    `;
                                },
                            });
                            items.push({
                                id: "sample-variant-stats",
                                name: "Sample Variant Stats",
                                render: (clinicalAnalysis, active, opencgaSession) => {
                                    return html`
                                        <div class="col-md-12">
                                            <tool-header title="Sample Variant Stats - ${probandId} (${this.sample?.id})" class="bg-white"></tool-header>
                                            <sample-variant-stats-browser
                                                .opencgaSession="${opencgaSession}"
                                                .cellbaseClient="${this.cellbaseClient}"
                                                .sample="${this.sample}"
                                                .active="${active}"
                                                .settings="${this.settings?.tabs?.find(tab => "sampleVariantStats" === tab.id)?.settings}">
                                            </sample-variant-stats-browser>
                                        </div>
                                    `;
                                },
                            });
                        }
                        if (type === "FAMILY") {
                            items.push({
                                id: "family-qc-analysis",
                                name: "Family QC Analysis",
                                render: (clinicalAnalysis, active, opencgaSession) => {
                                    return html`
                                        <div class="col-md-10 offset-md-1">
                                            <tool-header title="Family QC Analysis - ${probandId} (${clinicalAnalysis.family?.id})" class="bg-white"></tool-header>
                                            <family-qc-analysis
                                                .toolParams="${{family: clinicalAnalysis.family?.id}}"
                                                .opencgaSession="${opencgaSession}"
                                                .config=${{title: ""}}>
                                            </family-qc-analysis>
                                        </div>
                                    `;
                                },
                            });
                            items.push({
                                id: "individual-qc-analysis",
                                name: "Individual QC Analysis",
                                render: (clinicalAnalysis, active, opencgaSession) => {
                                    return html`
                                        <div class="col-md-10 offset-md-1">
                                            <tool-header title="Individual QC Analysis - ${probandId}" class="bg-white"></tool-header>
                                            <individual-qc-analysis
                                                .toolParams="${{individual: clinicalAnalysis.proband?.id}}"
                                                .opencgaSession="${opencgaSession}"
                                                .config=${{title: ""}}>
                                            </individual-qc-analysis>
                                        </div>
                                    `;
                                },
                            });
                            items.push({
                                id: "sample-variant-stats-family",
                                name: "Sample Variant Stats",
                                render: (clinicalAnalysis, active, opencgaSession) => {
                                    return html`
                                        <div class="col-md-10 offset-md-1">
                                            <tool-header title="Sample Variant Stats - ${probandId} (${this.sample?.id})" class="bg-white"></tool-header>
                                            <sample-variant-stats-browser
                                                .opencgaSession="${opencgaSession}"
                                                .cellbaseClient="${this.cellbaseClient}"
                                                .sample="${this.sample}"
                                                .active="${active}"
                                                .settings="${this.settings?.tabs?.find(tab => "sampleVariantStats" === tab.id)?.settings}">
                                            </sample-variant-stats-browser>
                                        </div>
                                    `;
                                },
                            });
                        }
                        break;
                    case "somaticVariantStats":
                        if (type === "CANCER") {
                            items.push({
                                id: "somatic-variant-stats",
                                name: "Somatic Variant Stats",
                                render: (clinicalAnalysis, active, opencgaSession) => {
                                    return html`
                                        <div class="col-md-12">
                                            <tool-header title="Somatic Variant Stats - ${probandId} (${this.somaticSample?.id})" class="bg-white"></tool-header>
                                            <sample-variant-stats-browser
                                                .opencgaSession="${opencgaSession}"
                                                .cellbaseClient="${this.cellbaseClient}"
                                                .sample="${this.somaticSample}"
                                                .active="${active}"
                                                .settings="${this.settings?.tabs?.find(tab => "sampleVariantStats" === tab.id)?.settings}">
                                            </sample-variant-stats-browser>
                                        </div>
                                    `;
                                },
                            });
                        }
                        break;
                    case "germlineVariantStats":
                        if (type === "CANCER" && !!this.sample) {
                            items.push({
                                id: "germline-variant-stats",
                                name: "Germline Variant Stats",
                                render: (clinicalAnalysis, active, opencgaSession) => {
                                    return html`
                                        <div class="col-md-12">
                                            <tool-header title="Germline Variant Stats - ${probandId} (${this.sample?.id})" class="bg-white"></tool-header>
                                            <sample-variant-stats-browser
                                                .opencgaSession="${opencgaSession}"
                                                .cellbaseClient="${this.cellbaseClient}"
                                                .sample="${this.sample}"
                                                .active="${active}"
                                                .settings="${this.settings?.tabs?.find(tab => "sampleVariantStats" === tab.id)?.settings}">
                                            </sample-variant-stats-browser>
                                        </div>
                                    `;
                                },
                            });
                        }
                        break;
                    case "geneCoverage":
                        items.push({
                            id: "gene-coverage",
                            name: "Gene Coverage Stats",
                            render: (clinicalAnalysis, active, opencgaSession) => {
                                return html`
                                    <div class="col-md-12">
                                        <tool-header title="Gene Coverage Stats - ${probandId}" class="bg-white"></tool-header>
                                        <variant-interpreter-qc-gene-coverage
                                            .opencgaSession="${opencgaSession}"
                                            .cellbaseClient="${this.cellbaseClient}"
                                            .clinicalAnalysis="${clinicalAnalysis}"
                                            .active="${active}">
                                        </variant-interpreter-qc-gene-coverage>
                                    </div>
                                `;
                            },
                        });
                        break;
                    default:
                        // Check if the tab is defined in the extensions tabs list
                        const extensionTab = extensionsTabs.find(extension => extension.id === tab.id);
                        if (extensionTab && typeof extensionTab.render === "function") {
                            items.push({
                                ...extensionTab,
                                name: tab?.name || extensionTab.name,
                                render: (clinicalAnalysis, active, opencgaSession) => {
                                    return extensionTab.render(clinicalAnalysis, active, opencgaSession, tab);
                                },
                            });
                        }
                }
            });
        }

        return {
            display: {
                classes: "justify-content-center"
            },
            items: items,
        };
    }

}

customElements.define("variant-interpreter-qc", VariantInterpreterQc);
