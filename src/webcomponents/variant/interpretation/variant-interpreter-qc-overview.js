/*
 * Copyright 2015-2024 OpenCB
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
import {guardPage} from "../../commons/html-utils.js";
import "./variant-interpreter-qc-summary.js";
import "./variant-interpreter-qc-variant-stats.js";
import "./variant-interpreter-qc-inferred-sex.js";
import "./variant-interpreter-qc-relatedness.js";
import "./variant-interpreter-qc-mendelian-errors.js";
import "./variant-interpreter-qc-gene-coverage-stats.js";
import "../../sample/sample-variant-stats-view.js";
import "../../file/file-preview.js";
import "../../file/qc/file-qc-ascat-metrics.js";
import "../../alignment/qc/samtools-stats-view.js";
import "../../alignment/qc/samtools-flagstats-view.js";

class VariantInterpreterQcOverview extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            active: {
                type: Boolean,
            },
            settings: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("settings")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.settings,
            };

            if (this.settings.tabs) {
                this._config = UtilsNew.mergeDataFormConfig(this._config, this.settings.tabs);
            }
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
        if (this.opencgaSession && this.clinicalAnalysis?.proband?.samples?.length > 0) {
            // Fetch sample of interest, in cancer this is the somatic one
            if (this.clinicalAnalysis.type?.toUpperCase() !== "CANCER") {
                this.sample = this.clinicalAnalysis.proband.samples[0];
            } else {
                this.sample = this.clinicalAnalysis.proband.samples.find(sample => sample.somatic);
            }

            // Bam files related to somatic samples will be added first
            const bamFileIds = [];
            this.clinicalAnalysis.proband.samples
                .sort(sample => sample.somatic ? -1 : 1)
                .forEach(sample => {
                    const bamFile = sample.fileIds.find(fileId => fileId.endsWith(".bam"));
                    if (bamFile) {
                        bamFileIds.push(bamFile);
                    }
                });

            if (bamFileIds.length > 0) {
                this.opencgaSession.opencgaClient.files().info(bamFileIds.join(","), {study: this.opencgaSession.study.fqn})
                    .then(response => {
                        this.bamFiles = response.responses[0].results;
                        this.alignmentStats = [];
                        for (const file of response.responses[0].results) {
                            const annotSet = file.annotationSets.find(annotSet => annotSet.id === "opencga_alignment_stats");
                            if (annotSet?.annotations) {
                                this.alignmentStats.push(annotSet.annotations);
                            }
                        }
                    })
                    .catch(response => {
                        console.error("An error occurred fetching clinicalAnalysis: ", response);
                    });
            }
        }
    }

    getDefaultConfig() {
        if (!this.clinicalAnalysis) {
            return;
        }

        if (this.clinicalAnalysis.type.toUpperCase() !== "CANCER") {
            return {
                title: "Quality Control Overview",
                sections: [
                    {
                        elements: [
                            {
                                id: "Summary",
                                title: "Summary"
                            },
                            {
                                id: "VariantStats",
                                title: "Variant Stats"
                            },
                            {
                                id: "InferredSex",
                                title: "Sex Inference"
                            },
                            {
                                id: "MendelianErrors",
                                title: "Mendelian Errors"
                            },
                            {
                                id: "Relatedness",
                                title: "Relatedness"
                            },
                            {
                                id: "SamtoolsPlots",
                                title: "Samtools Plots"
                            },
                            {
                                id: "Alignment",
                                title: "Samtools Stats",
                            },
                            {
                                id: "AlignmentStats",
                                title: "Samtools Flagstats",
                            },
                            /* {
                                id: "GeneCoverageStats",
                                title: "Gene Coverage Stats",
                            }*/
                        ]
                    }
                ]
            };
        } else {
            return {
                title: "Quality Control Overview",
                sections: [
                    {
                        elements: [
                            {
                                id: "Summary",
                                title: "Summary"
                            },
                            {
                                id: "VariantStats",
                                title: "Variant Stats"
                            },
                            {
                                id: "AscatMetrics",
                                title: "Ascat Metrics",
                            },
                            {
                                id: "SamtoolsPlots",
                                title: "Samtools Plots"
                            },
                            {
                                id: "Alignment",
                                title: "Samtools Stats",
                            },
                            {
                                id: "AlignmentStats",
                                title: "Samtools Flagstats",
                            },
                            // {
                            //     id: "GeneCoverageStats",
                            //     title: "Gene Coverage Stats",
                            // }
                        ]
                    }
                ]
            };
        }
    }

    onSideNavClick(e) {
        e.preventDefault();
        // Remove button focus highlight
        e.currentTarget.blur();
        const tabId = e.currentTarget.dataset.id;
        $(".interpreter-side-nav > button", this).removeClass("active");
        $(`.interpreter-side-nav > button[data-id=${tabId}]`, this).addClass("active");
        $(".interpreter-content-tab > div[role=tabpanel]", this).hide();
        $("#" + this._prefix + tabId, this).show();
        // for (const tab in this.activeTab) this.activeTab[tab] = false;
        // this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return guardPage();
        }

        return html`
            <div class="row variant-interpreter-overview mb-3 p-3">
                <div class="col-md-2 list-group interpreter-side-nav side-tabs side-nav">
                    ${this._config.sections[0].elements.filter(field => !field.disabled).map((field, i) => html`
                        <a
                            class="list-group-item p-3 ${i === 0 ? "active" : ""}"
                            data-bs-toggle="tab"
                            data-bs-target="#${this._prefix}${field.id}">
                            ${field.title}
                        </a>
                    `)}
                </div>

                <div class="col-md-10">
                    <div class="tab-content" style="margin: 0px 10px">
                        <div id="${this._prefix}Summary" role="tabpanel" class="tab-pane content-tab active">
                            <h3>Summary</h3>
                            <variant-interpreter-qc-summary
                                .opencgaSession=${this.opencgaSession}
                                .clinicalAnalysis=${this.clinicalAnalysis}>
                            </variant-interpreter-qc-summary>
                        </div>

                        <div id="${this._prefix}VariantStats" role="tabpanel" class="tab-pane content-tab">
                            <h3>Sample Variant Stats</h3>
                            <sample-variant-stats-view
                                .sampleId="${this.sample?.id}"
                                .opencgaSession="${this.opencgaSession}">
                            </sample-variant-stats-view>
                        </div>

                        <div id="${this._prefix}InferredSex" role="tabpanel" class="tab-pane content-tab">
                            <h3>Inferred Sex</h3>
                            <variant-interpreter-qc-inferred-sex
                                .opencgaSession=${this.opencgaSession}
                                .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-interpreter-qc-inferred-sex>
                        </div>

                        <div id="${this._prefix}MendelianErrors" role="tabpanel" class="tab-pane content-tab">
                            <h3>Mendelian Errors</h3>
                            <variant-interpreter-qc-mendelian-errors
                                .opencgaSession=${this.opencgaSession}
                                .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-interpreter-qc-mendelian-errors>
                        </div>

                        <div id="${this._prefix}Relatedness" role="tabpanel" class="tab-pane content-tab">
                            <h3>Relatedness</h3>
                            <variant-interpreter-qc-relatedness
                                .opencgaSession=${this.opencgaSession}
                                .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-interpreter-qc-relatedness>
                        </div>

                        <div id="${this._prefix}SamtoolsPlots" role="tabpanel" class="tab-pane content-tab">
                            <h3>Samtools Plots</h3>
                            <div class="row">
                                <!-- Display Samtools plots for each BAM file -->
                                ${this.bamFiles?.filter(file => file.qualityControl?.alignment?.samtoolsStats?.files?.length > 0).map(bamFile => html`
                                    <div class="col-md-6">
                                        <h4>${bamFile.name} <span class="badge">${bamFile.qualityControl.alignment.samtoolsStats.files.length}</span></h4>
                                        <file-preview
                                            .fileIds="${bamFile.qualityControl.alignment.samtoolsStats.files}"
                                            .active="${true}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{showFileSize: false}}">
                                        </file-preview>
                                    </div>
                                `)}
                            </div>
                        </div>

                        <div id="${this._prefix}Alignment" role="tabpanel" class="tab-pane content-tab">
                            <h3>Samtools Stats</h3>
                            <div style="padding: 15px">
                                <samtools-stats-view
                                    .files="${this.bamFiles}">
                                </samtools-stats-view>
                            </div>
                        </div>

                        <div id="${this._prefix}AlignmentStats" role="tabpanel" class="tab-pane content-tab">
                            <h3>Samtools Flagstats</h3>
                            <div style="padding: 15px">
                                <samtools-flagstats-view
                                    .files="${this.bamFiles}">
                                </samtools-flagstats-view>
                            </div>
                        </div>

                        <div id="${this._prefix}AscatMetrics" role="tabpanel" class="tab-pane content-tab">
                            <file-qc-ascat-metrics
                                .opencgaSession=${this.opencgaSession}
                                .sampleId="${this.sample?.id}">
                            </file-qc-ascat-metrics>
                        </div>

                        <!--
                        <div id="${this._prefix}GeneCoverageStats" role="tabpanel" class="tab-pane content-tab">
                            <h3>Gene Coverage Stats</h3>
                            <variant-interpreter-qc-gene-coverage-stats
                                .opencgaSession=${this.opencgaSession}
                                .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-interpreter-qc-gene-coverage-stats>
                        </div>
                        -->
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-overview", VariantInterpreterQcOverview);
