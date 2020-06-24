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
import UtilsNew from "../../../utilsNew.js";
import "../../alignment/alignment-stats-view.js";
// import "../../commons/view/data-form.js";

class VariantInterpreterQcAlignment extends LitElement {

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
        if (changedProperties.has("clinicalAnalysis")) {
            // this.setProbandBamFile();
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
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 3,
                defaultValue: "-"
            },
            sections: [
                {
                    title: "Summary",
                    display: {
                        collapsed: false,
                    },
                    elements: [
                        {
                            name: "File",
                            field: "fileId"
                        },
                        {
                            name: "Sample ID",
                            field: "sampleId"
                        }
                    ]
                },
                {
                    title: "Samtools Stats",
                    display: {
                        collapsed: false,
                    },
                    elements: [
                        {
                            name: "rawTotalSequences",
                            field: "rawTotalSequences"
                        },
                        {
                            name: "filteredSequences",
                            field: "filteredSequences"
                        },
                        {
                            name: "sequences",
                            field: "sequences"
                        },
                        {
                            name: "isSorted",
                            field: "isSorted"
                        },
                        {
                            name: "firstFragments",
                            field: "firstFragments"
                        },
                        {
                            name: "lastFragments",
                            field: "lastFragments"
                        },
                        {
                            name: "readsMapped",
                            field: "readsMapped"
                        },
                        {
                            name: "readsMappedAndPaired",
                            field: "readsMappedAndPaired"
                        },
                        {
                            name: "readsUnmapped",
                            field: "readsUnmapped"
                        },
                        {
                            name: "readsProperlyPaired",
                            field: "readsProperlyPaired"
                        },
                        {
                            name: "readsPaired",
                            field: "readsPaired"
                        },
                        {
                            name: "readsDuplicated",
                            field: "readsDuplicated"
                        },
                        {
                            name: "readsMq0",
                            field: "readsMq0"
                        },
                        {
                            name: "readsQcFailed",
                            field: "readsQcFailed"
                        },
                        {
                            name: "nonPrimaryAlignments",
                            field: "nonPrimaryAlignments"
                        },
                        {
                            name: "totalLength",
                            field: "totalLength"
                        },
                        {
                            name: "totalFirstFragmentLength",
                            field: "totalFirstFragmentLength"
                        },
                        {
                            name: "totalLastFragmentLength",
                            field: "totalLastFragmentLength"
                        },
                        {
                            name: "basesMapped",
                            field: "basesMapped"
                        },
                        {
                            name: "basesMappedCigar",
                            field: "basesMappedCigar"
                        },
                        {
                            name: "basesTrimmed",
                            field: "basesTrimmed"
                        },
                        {
                            name: "basesDuplicated",
                            field: "basesDuplicated"
                        },
                        {
                            name: "mismatches",
                            field: "mismatches"
                        },
                        {
                            name: "errorRate",
                            field: "errorRate"
                        },
                        {
                            name: "averageLength",
                            field: "averageLength"
                        },
                        {
                            name: "averageFirstFragmentLength",
                            field: "averageFirstFragmentLength"
                        },
                        {
                            name: "averageLastFragmentLength",
                            field: "averageLastFragmentLength"
                        },
                        {
                            name: "maximumLength",
                            field: "maximumLength"
                        },
                        {
                            name: "maximumFirstFragmentLength",
                            field: "maximumFirstFragmentLength"
                        },
                        {
                            name: "maximumLastFragmentLength",
                            field: "maximumLastFragmentLength"
                        },
                        {
                            name: "averageQuality",
                            field: "averageQuality"
                        },
                        {
                            name: "insertSizeAverage",
                            field: "insertSizeAverage"
                        },
                        {
                            name: "insertSizeStandardDeviation",
                            field: "insertSizeStandardDeviation"
                        },
                        {
                            name: "inwardOrientedPairs",
                            field: "inwardOrientedPairs"
                        },
                        {
                            name: "outwardOrientedPairs",
                            field: "outwardOrientedPairs"
                        },
                        {
                            name: "pairsWithOtherOrientation",
                            field: "pairsWithOtherOrientation"
                        },
                        {
                            name: "pairsOnDifferentChromosomes",
                            field: "pairsOnDifferentChromosomes"
                        },
                        {
                            name: "percentageOfProperlyPairedReads",
                            field: "percentageOfProperlyPairedReads"
                        }
                    ]
                }
            ]
        };
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                    <div>
                        <h3><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h3>
                    </div>`;
        }

        // Check Clinical Analysis exist
        if (!this.clinicalAnalysis) {
            return html`
                    <div>
                        <h3><i class="fas fa-lock"></i> No Case open</h3>
                    </div>`;
        }

        // Alignment stats are the same for FAMILY and CANCER analysis
        return html`
            <div class="container" style="margin-bottom: 20px">
                <div>
                    <h2>QC Alignment Stats</h2>
                </div>
                <div>
                    <alignment-stats-view .opencgaSession=${this.opencgaSession} .alignmentStats="${this.alignmentStats}"></alignment-stats-view>
                </div>
                <!--
                <div style="padding-left: 15px">
                    ${this.alignmentStats 
                        ? html`
                           <data-form .data="${this.alignmentStats}" .config="${this._config}"></data-form>` 
                        : html`No Stats available.`
                    }
                </div>
                -->
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-alignment", VariantInterpreterQcAlignment);
