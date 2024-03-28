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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import {guardPage} from "../../commons/html-utils.js";
import "../../alignment/gene-coverage-browser.js";

class VariantInterpreterQcGeneCoverage extends LitElement {

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
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
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
        this._prefix = "vcis-" + UtilsNew.randomString(6);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.file = this.clinicalAnalysis.files.find(file => file.format === "BAM");
            this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(restResponse => {
                    this.clinicalAnalysis = restResponse.getResult(0);
                    this.file = this.clinicalAnalysis.files.find(file => file.format === "BAM");
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    onSave(e) {
        // Search bamFile for the sample
        const bamFile = this.clinicalAnalysis.files.find(file => file.format === "BAM" && file.samples.some(sample => sample.id === this.sample.id));
        const variantStats = {
            id: this.save.id,
            query: this.executedQuery || {},
            description: this.save.description || "",
            stats: this.sampleVariantStats
        };

        // Check if a metric object for that bamFileId exists
        let metric = this.sample?.qualityControl?.metrics.find(metric => metric.bamFileId === bamFile.id);
        if (metric) {
            // Push the stats and signature in the existing metric object
            metric.variantStats.push(variantStats);
        } else {
            // create a new metric
            metric = {
                bamFileId: bamFile.id,
                variantStats: [variantStats]
            };
            // Check if this is the first metric object
            if (this.sample?.qualityControl?.metrics) {
                this.sample.qualityControl.metrics.push(metric);
            } else {
                this.sample["qualityControl"] = {
                    metrics: [metric]
                };
            }
        }

        this.opencgaSession.opencgaClient.samples().update(this.sample.id, {qualityControl: this.sample.qualityControl}, {study: this.opencgaSession.study.fqn})
            .then(restResponse => {
                console.log(restResponse);
            })
            .catch(restResponse => {
                console.error(restResponse);
            })
            .finally(() => {
                this.requestUpdate();
            });
    }

    getDefaultConfig() {
        return {
        };
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return guardPage();
        }

        return html`
            ${this.file ? html`
                <div class="d-flex justify-content-end">
                    <button class="btn btn-light" @click="${this.onSave}">
                        <i class="fas fa-save pe-1"></i> Save
                    </button>
                </div>
            ` : nothing}

            <div class="px-0 py-2">
                <gene-coverage-browser
                    .opencgaSession="${this.opencgaSession}"
                    .clinicalAnalysis="${this.clinicalAnalysis}"
                    .cellbaseClient="${this.cellbaseClient}"
                    .geneIds="${this.geneIds}"
                    .panelIds="${this.diseasePanelIds}"
                    .fileId="${this.file?.id}">
                </gene-coverage-browser>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-gene-coverage", VariantInterpreterQcGeneCoverage);
