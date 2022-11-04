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
import "../../commons/forms/data-form.js";

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
        this._prefix = UtilsNew.randomString(8);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.setAlignmentstats();
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
                    this.setAlignmentstats();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    setAlignmentstats() {
        if (this.clinicalAnalysis && this.clinicalAnalysis.files) {
            const _alignmentStats = [];
            for (const file of this.clinicalAnalysis.files) {
                if (file.format === "BAM" && file.annotationSets) {
                    for (const annotationSet of file.annotationSets) {
                        if (annotationSet.id.toUpperCase() === "OPENCGA_ALIGNMENT_STATS") {
                            _alignmentStats.push(annotationSet.annotations);
                            break;
                        }
                    }
                }
            }
            this.alignmentStats = _alignmentStats;
        }
        this.requestUpdate();
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                <div>
                    <h3>
                        <i class="fas fa-lock"></i>
                        No public projects available to browse. Please login to continue
                    </h3>
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

        // Alignment stats are the same for FAMILY and CANCER analysis
        return html`
            <div class="container" style="margin-bottom: 20px">
                ${this.alignmentStats ? html`
                    <data-form
                        .data="${this.alignmentStats[0]}"
                        .config="${this._config}">
                    </data-form>
                ` : html`No Stats available.`}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                buttonsVisible: false,
                collapsable: true,
                titleVisible: false,
                titleWidth: 3,
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
                            title: "File",
                            field: "fileId"
                        },
                        {
                            title: "Sample ID",
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
                            title: "rawTotalSequences",
                            field: "rawTotalSequences"
                        },
                        {
                            title: "filteredSequences",
                            field: "filteredSequences"
                        },
                        {
                            title: "sequences",
                            field: "sequences"
                        },
                        {
                            title: "isSorted",
                            field: "isSorted"
                        },
                        {
                            title: "firstFragments",
                            field: "firstFragments"
                        },
                        {
                            title: "lastFragments",
                            field: "lastFragments"
                        },
                        {
                            title: "readsMapped",
                            field: "readsMapped"
                        },
                        {
                            title: "readsMappedAndPaired",
                            field: "readsMappedAndPaired"
                        },
                        {
                            title: "readsUnmapped",
                            field: "readsUnmapped"
                        },
                        {
                            title: "readsProperlyPaired",
                            field: "readsProperlyPaired"
                        },
                        {
                            title: "readsPaired",
                            field: "readsPaired"
                        },
                        {
                            title: "readsDuplicated",
                            field: "readsDuplicated"
                        },
                        {
                            title: "readsMq0",
                            field: "readsMq0"
                        },
                        {
                            title: "readsQcFailed",
                            field: "readsQcFailed"
                        },
                        {
                            title: "nonPrimaryAlignments",
                            field: "nonPrimaryAlignments"
                        },
                        {
                            title: "totalLength",
                            field: "totalLength"
                        },
                        {
                            title: "totalFirstFragmentLength",
                            field: "totalFirstFragmentLength"
                        },
                        {
                            title: "totalLastFragmentLength",
                            field: "totalLastFragmentLength"
                        },
                        {
                            title: "basesMapped",
                            field: "basesMapped"
                        },
                        {
                            title: "basesMappedCigar",
                            field: "basesMappedCigar"
                        },
                        {
                            title: "basesTrimmed",
                            field: "basesTrimmed"
                        },
                        {
                            title: "basesDuplicated",
                            field: "basesDuplicated"
                        },
                        {
                            title: "mismatches",
                            field: "mismatches"
                        },
                        {
                            title: "errorRate",
                            field: "errorRate"
                        },
                        {
                            title: "averageLength",
                            field: "averageLength"
                        },
                        {
                            title: "averageFirstFragmentLength",
                            field: "averageFirstFragmentLength"
                        },
                        {
                            title: "averageLastFragmentLength",
                            field: "averageLastFragmentLength"
                        },
                        {
                            title: "maximumLength",
                            field: "maximumLength"
                        },
                        {
                            title: "maximumFirstFragmentLength",
                            field: "maximumFirstFragmentLength"
                        },
                        {
                            title: "maximumLastFragmentLength",
                            field: "maximumLastFragmentLength"
                        },
                        {
                            title: "averageQuality",
                            field: "averageQuality"
                        },
                        {
                            title: "insertSizeAverage",
                            field: "insertSizeAverage"
                        },
                        {
                            title: "insertSizeStandardDeviation",
                            field: "insertSizeStandardDeviation"
                        },
                        {
                            title: "inwardOrientedPairs",
                            field: "inwardOrientedPairs"
                        },
                        {
                            title: "outwardOrientedPairs",
                            field: "outwardOrientedPairs"
                        },
                        {
                            title: "pairsWithOtherOrientation",
                            field: "pairsWithOtherOrientation"
                        },
                        {
                            title: "pairsOnDifferentChromosomes",
                            field: "pairsOnDifferentChromosomes"
                        },
                        {
                            title: "percentageOfProperlyPairedReads",
                            field: "percentageOfProperlyPairedReads"
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("variant-interpreter-qc-alignment", VariantInterpreterQcAlignment);
