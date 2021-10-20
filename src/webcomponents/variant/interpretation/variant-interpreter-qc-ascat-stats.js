/*
 * Copyright 2015-present OpenCB
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
import "../../commons/forms/data-form.js";
import "../../sample/sample-files-view.js";

class VariantInterpreterQcAscatStats extends LitElement {

    constructor() {
        super();

        this._init();
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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
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
        if (this.opencgaSession && this.clinicalAnalysis) {
            const somaticSample = this.clinicalAnalysis.proband?.samples.find(s => s.somatic);
            // const germlineSample = this.clinicalAnalysis.proband?.samples.find(s => !s.somatic);
            if (somaticSample) {
                const bamFile = somaticSample.fileIds.filter(f => f.endsWith(".bam"));
                if (bamFile.length) {
                    const vcfFiles = [somaticSample.fileIds.find(f => f.endsWith(".vcf.gz"))];
                    this.opencgaSession.opencgaClient.files().info(vcfFiles.join(","), {study: this.opencgaSession.study.fqn})
                        .then(response => {
                            this.clinicalAnalysis.ascat = [response.responses[0].results[0].attributes];
                            this.clinicalAnalysis.ascat[0].file = vcfFiles[0];
                            this._config = {...this.getDefaultConfig(), ...this.config};
                            this.requestUpdate();
                        })
                        .catch(response => {
                            console.error("An error occurred fetching clinicalAnalysis: ", response);
                        });
                }
            }
        }
    }


    getDefaultConfig() {
        return {
            stats: {
                title: "",
                icon: "",
                display: {
                    collapsable: true,
                    showTitle: false,
                    labelWidth: 2,
                    defaultValue: "-",
                    defaultLayout: "horizontal",
                },
                sections: [
                    {
                        // title: "ASCAT Stats",
                        collapsed: false,
                        elements: [
                            {
                                name: "ASCAT Stats",
                                field: "ascat",
                                type: "table",
                                display: {
                                    columns: [
                                        {
                                            name: "ASCAT File",
                                            type: "custom",
                                            display: {
                                                render: data => html` <div>
                                                    <span
                                                        style="font-weight: bold"
                                                        >${data.file}</span
                                                    >
                                                </div>`,
                                            },
                                        },
                                        {
                                            name: "ASCAT Aberrant Fraction",
                                            type: "custom",
                                            display: {
                                                render: data => html` <div>
                                                    ${data.ascatAberrantCellFraction}
                                                </div>`,
                                            },
                                        },
                                        {
                                            name: "ASCAT Ploidy",
                                            type: "custom",
                                            display: {
                                                render: data => html` <div>
                                                    ${data.ascatPloidy}
                                                </div>`,
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
            plots: {
                imageOrder: [
                    "sunrise.png",
                    "rawprofile.png",
                    "ASCATprofile.png",
                    "ASPCF.png",
                    "germline.png",
                    "tumour.png"
                ],
            },
        };
    }

    render() {
        // Check if project exists
        if (!this.opencgaSession?.project) {
            return html`
                <div>
                    <h3><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        // Check Clinical Analysis exist
        if (!this.clinicalAnalysis) {
            return html`
                <div>
                    <h3><i class="fas fa-lock"></i> No Case found</h3>
                </div>
            `;
        }

        // Display ASCAT stats
        return html`
            <div class="container" style="margin: 20px 10px">
                <h3>ASCAT Stats</h3>
                <data-form 
                    .data=${this.clinicalAnalysis}
                    .config="${this._config.stats}">
                </data-form>
                <h3>ASCAT QC Plots</h3>
                <sample-files-view
                    .config="${this._config.plots}"
                    .mode="${"sample-qc"}"
                    .opencgaSession="${this.opencgaSession}"
                    .sampleId="${this.clinicalAnalysis.proband.samples?.[1]?.id}">
                </sample-files-view>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-ascat-stats", VariantInterpreterQcAscatStats);
