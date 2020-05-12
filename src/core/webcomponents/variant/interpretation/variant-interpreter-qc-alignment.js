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
            fileId: {
                type: String
            },
            alignmentStats: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();
    }

    firstUpdated(_changedProperties) {

        this.file = {
            "fileId": "bam:SonsAlignedBamFile.bam",
            "sampleId": "ISDBM322015",
            "rawTotalSequences": 32116828,
            "filteredSequences": 0,
            "sequences": 32116828,
            "isSorted": 1,
            "firstFragments": 16058414,
            "lastFragments": 16058414,
            "readsMapped": 31299207,
            "readsMappedAndPaired": 31120474,
            "readsUnmapped": 817621,
            "readsProperlyPaired": 30066492,
            "readsPaired": 32116828,
            "readsDuplicated": 1121410,
            "readsMq0": 2369927,
            "readsQcFailed": 0,
            "nonPrimaryAlignments": 0,
            "totalLength": -1404452776,
            "totalFirstFragmentLength": 1445257260,
            "totalLastFragmentLength": 1445257260,
            "basesMapped": 2816928630,
            "basesMappedCigar": 2812285689,
            "basesTrimmed": 0,
            "basesDuplicated": 100926900,
            "mismatches": 8428924,
            "errorRate": 0.002997179,
            "averageLength": 90.0,
            "averageFirstFragmentLength": 90.0,
            "averageLastFragmentLength": 90.0,
            "maximumLength": 90,
            "maximumFirstFragmentLength": 90,
            "maximumLastFragmentLength": 90,
            "averageQuality": 34.8,
            "insertSizeAverage": 153.6,
            "insertSizeStandardDeviation": 46.3,
            "inwardOrientedPairs": 15081995,
            "outwardOrientedPairs": 452217,
            "pairsWithOtherOrientation": 12645,
            "pairsOnDifferentChromosomes": 13380,
            "percentageOfProperlyPairedReads": 93.6
        };

        this.coverage = {
            "fileId": "bam:SonsAlignedBamFile.bam",
            "sampleId": "ISDBM322015",
            "geneName": "TP53",
            "stats": [
                {
                    "transcriptId": "ENST00000514944",
                    "length": 467,
                    "depths": [
                        22.91220556745182,
                        22.91220556745182,
                        22.91220556745182,
                        12.84796573875803,
                        3.2119914346895073,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7579907,
                            "end": 7579912,
                            "depthAvg": 19.5,
                            "depthMin": 18
                        },
                        {
                            "start": 7579717,
                            "end": 7579721,
                            "depthAvg": 20,
                            "depthMin": 20
                        },
                        {
                            "start": 7578484,
                            "end": 7578554,
                            "depthAvg": 14.112676056338028,
                            "depthMin": 10
                        },
                        {
                            "start": 7578177,
                            "end": 7578181,
                            "depthAvg": 18.6,
                            "depthMin": 17
                        },
                        {
                            "start": 7577589,
                            "end": 7577608,
                            "depthAvg": 17.7,
                            "depthMin": 12
                        }
                    ]
                },
                {
                    "transcriptId": "ENST00000508793",
                    "length": 496,
                    "depths": [
                        19.35483870967742,
                        19.35483870967742,
                        19.35483870967742,
                        10.28225806451613,
                        3.024193548387097,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7579907,
                            "end": 7579912,
                            "depthAvg": 19.5,
                            "depthMin": 18
                        },
                        {
                            "start": 7579717,
                            "end": 7579721,
                            "depthAvg": 20,
                            "depthMin": 20
                        },
                        {
                            "start": 7579430,
                            "end": 7579443,
                            "depthAvg": 18.285714285714285,
                            "depthMin": 15
                        },
                        {
                            "start": 7578484,
                            "end": 7578554,
                            "depthAvg": 14.112676056338028,
                            "depthMin": 10
                        }
                    ]
                },
                {
                    "transcriptId": "ENST00000413465",
                    "length": 858,
                    "depths": [
                        21.328671328671327,
                        14.102564102564102,
                        14.102564102564102,
                        8.624708624708624,
                        2.4475524475524475,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7579907,
                            "end": 7579912,
                            "depthAvg": 19.5,
                            "depthMin": 18
                        },
                        {
                            "start": 7579717,
                            "end": 7579721,
                            "depthAvg": 20,
                            "depthMin": 20
                        },
                        {
                            "start": 7579430,
                            "end": 7579443,
                            "depthAvg": 18.285714285714285,
                            "depthMin": 15
                        },
                        {
                            "start": 7578484,
                            "end": 7578554,
                            "depthAvg": 14.112676056338028,
                            "depthMin": 10
                        },
                        {
                            "start": 7578177,
                            "end": 7578181,
                            "depthAvg": 18.6,
                            "depthMin": 17
                        },
                        {
                            "start": 7577589,
                            "end": 7577608,
                            "depthAvg": 17.7,
                            "depthMin": 12
                        },
                        {
                            "start": 7565257,
                            "end": 7565332,
                            "depthAvg": 1.5657894736842106,
                            "depthMin": 0
                        }
                    ]
                },
                {
                    "transcriptId": "ENST00000503591",
                    "length": 383,
                    "depths": [
                        8.616187989556137,
                        8.616187989556137,
                        8.616187989556137,
                        6.527415143603134,
                        3.91644908616188,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7579907,
                            "end": 7579912,
                            "depthAvg": 19.5,
                            "depthMin": 18
                        },
                        {
                            "start": 7579717,
                            "end": 7579721,
                            "depthAvg": 20,
                            "depthMin": 20
                        },
                        {
                            "start": 7579430,
                            "end": 7579443,
                            "depthAvg": 18.285714285714285,
                            "depthMin": 15
                        },
                        {
                            "start": 7578547,
                            "end": 7578554,
                            "depthAvg": 11,
                            "depthMin": 11
                        }
                    ]
                },
                {
                    "transcriptId": "ENST00000445888",
                    "length": 1182,
                    "depths": [
                        13.790186125211507,
                        13.790186125211507,
                        13.790186125211507,
                        7.7834179357022,
                        2.1150592216582065,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7579907,
                            "end": 7579912,
                            "depthAvg": 19.5,
                            "depthMin": 18
                        },
                        {
                            "start": 7579717,
                            "end": 7579721,
                            "depthAvg": 20,
                            "depthMin": 20
                        },
                        {
                            "start": 7579430,
                            "end": 7579443,
                            "depthAvg": 18.285714285714285,
                            "depthMin": 15
                        },
                        {
                            "start": 7578484,
                            "end": 7578554,
                            "depthAvg": 14.112676056338028,
                            "depthMin": 10
                        },
                        {
                            "start": 7578177,
                            "end": 7578181,
                            "depthAvg": 18.6,
                            "depthMin": 17
                        },
                        {
                            "start": 7577589,
                            "end": 7577608,
                            "depthAvg": 17.7,
                            "depthMin": 12
                        },
                        {
                            "start": 7577148,
                            "end": 7577155,
                            "depthAvg": 19.375,
                            "depthMin": 19
                        },
                        {
                            "start": 7573927,
                            "end": 7573960,
                            "depthAvg": 13.411764705882353,
                            "depthMin": 10
                        }
                    ]
                },
                {
                    "transcriptId": "ENST00000420246",
                    "length": 1026,
                    "depths": [
                        15.789473684210526,
                        15.789473684210526,
                        15.789473684210526,
                        7.992202729044834,
                        2.3391812865497075,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7579907,
                            "end": 7579912,
                            "depthAvg": 19.5,
                            "depthMin": 18
                        },
                        {
                            "start": 7579717,
                            "end": 7579721,
                            "depthAvg": 20,
                            "depthMin": 20
                        },
                        {
                            "start": 7579430,
                            "end": 7579443,
                            "depthAvg": 18.285714285714285,
                            "depthMin": 15
                        },
                        {
                            "start": 7578484,
                            "end": 7578554,
                            "depthAvg": 14.112676056338028,
                            "depthMin": 10
                        },
                        {
                            "start": 7578177,
                            "end": 7578181,
                            "depthAvg": 18.6,
                            "depthMin": 17
                        },
                        {
                            "start": 7577589,
                            "end": 7577608,
                            "depthAvg": 17.7,
                            "depthMin": 12
                        },
                        {
                            "start": 7577148,
                            "end": 7577155,
                            "depthAvg": 19.375,
                            "depthMin": 19
                        },
                        {
                            "start": 7576625,
                            "end": 7576657,
                            "depthAvg": 11.93939393939394,
                            "depthMin": 10
                        }
                    ]
                },
                {
                    "transcriptId": "ENST00000269305",
                    "length": 1182,
                    "depths": [
                        13.790186125211507,
                        13.790186125211507,
                        13.790186125211507,
                        7.7834179357022,
                        2.1150592216582065,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7579907,
                            "end": 7579912,
                            "depthAvg": 19.5,
                            "depthMin": 18
                        },
                        {
                            "start": 7579717,
                            "end": 7579721,
                            "depthAvg": 20,
                            "depthMin": 20
                        },
                        {
                            "start": 7579430,
                            "end": 7579443,
                            "depthAvg": 18.285714285714285,
                            "depthMin": 15
                        },
                        {
                            "start": 7578484,
                            "end": 7578554,
                            "depthAvg": 14.112676056338028,
                            "depthMin": 10
                        },
                        {
                            "start": 7578177,
                            "end": 7578181,
                            "depthAvg": 18.6,
                            "depthMin": 17
                        },
                        {
                            "start": 7577589,
                            "end": 7577608,
                            "depthAvg": 17.7,
                            "depthMin": 12
                        },
                        {
                            "start": 7577148,
                            "end": 7577155,
                            "depthAvg": 19.375,
                            "depthMin": 19
                        },
                        {
                            "start": 7573927,
                            "end": 7573960,
                            "depthAvg": 13.411764705882353,
                            "depthMin": 10
                        }
                    ]
                },
                {
                    "transcriptId": "ENST00000576024",
                    "length": 95,
                    "depths": [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": []
                },
                {
                    "transcriptId": "ENST00000359597",
                    "length": 1032,
                    "depths": [
                        12.5,
                        12.5,
                        12.5,
                        7.945736434108527,
                        2.3255813953488373,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7579907,
                            "end": 7579912,
                            "depthAvg": 19.5,
                            "depthMin": 18
                        },
                        {
                            "start": 7579717,
                            "end": 7579721,
                            "depthAvg": 20,
                            "depthMin": 20
                        },
                        {
                            "start": 7579430,
                            "end": 7579443,
                            "depthAvg": 18.285714285714285,
                            "depthMin": 15
                        },
                        {
                            "start": 7578484,
                            "end": 7578554,
                            "depthAvg": 14.112676056338028,
                            "depthMin": 10
                        },
                        {
                            "start": 7578177,
                            "end": 7578181,
                            "depthAvg": 18.6,
                            "depthMin": 17
                        },
                        {
                            "start": 7577589,
                            "end": 7577608,
                            "depthAvg": 17.7,
                            "depthMin": 12
                        },
                        {
                            "start": 7577148,
                            "end": 7577155,
                            "depthAvg": 19.375,
                            "depthMin": 19
                        },
                        {
                            "start": 7569524,
                            "end": 7569562,
                            "depthAvg": 0,
                            "depthMin": 0
                        }
                    ]
                },
                {
                    "transcriptId": "ENST00000455263",
                    "length": 1041,
                    "depths": [
                        16.234390009606148,
                        12.968299711815561,
                        12.39193083573487,
                        7.877041306436119,
                        2.3054755043227666,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7579907,
                            "end": 7579912,
                            "depthAvg": 19.5,
                            "depthMin": 18
                        },
                        {
                            "start": 7579717,
                            "end": 7579721,
                            "depthAvg": 20,
                            "depthMin": 20
                        },
                        {
                            "start": 7579430,
                            "end": 7579443,
                            "depthAvg": 18.285714285714285,
                            "depthMin": 15
                        },
                        {
                            "start": 7578484,
                            "end": 7578554,
                            "depthAvg": 14.112676056338028,
                            "depthMin": 10
                        },
                        {
                            "start": 7578177,
                            "end": 7578181,
                            "depthAvg": 18.6,
                            "depthMin": 17
                        },
                        {
                            "start": 7577589,
                            "end": 7577608,
                            "depthAvg": 17.7,
                            "depthMin": 12
                        },
                        {
                            "start": 7577148,
                            "end": 7577155,
                            "depthAvg": 19.375,
                            "depthMin": 19
                        },
                        {
                            "start": 7576537,
                            "end": 7576584,
                            "depthAvg": 2.7916666666666665,
                            "depthMin": 0
                        }
                    ]
                },
                {
                    "transcriptId": "ENST00000604348",
                    "length": 429,
                    "depths": [
                        17.482517482517483,
                        17.482517482517483,
                        17.482517482517483,
                        11.888111888111888,
                        3.4965034965034967,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7579907,
                            "end": 7579912,
                            "depthAvg": 19.5,
                            "depthMin": 18
                        },
                        {
                            "start": 7579717,
                            "end": 7579721,
                            "depthAvg": 20,
                            "depthMin": 20
                        },
                        {
                            "start": 7579430,
                            "end": 7579443,
                            "depthAvg": 18.285714285714285,
                            "depthMin": 15
                        },
                        {
                            "start": 7578484,
                            "end": 7578533,
                            "depthAvg": 15.22,
                            "depthMin": 11
                        }
                    ]
                },
                {
                    "transcriptId": "ENST00000509690",
                    "length": 597,
                    "depths": [
                        13.90284757118928,
                        13.90284757118928,
                        13.90284757118928,
                        9.547738693467336,
                        1.507537688442211,
                        0,
                        0,
                        0,
                        0,
                        0
                    ],
                    "lowCoverageThreshold": 20,
                    "lowCoverageRegions": [
                        {
                            "start": 7578484,
                            "end": 7578533,
                            "depthAvg": 15.22,
                            "depthMin": 11
                        },
                        {
                            "start": 7578177,
                            "end": 7578181,
                            "depthAvg": 18.6,
                            "depthMin": 17
                        },
                        {
                            "start": 7577589,
                            "end": 7577608,
                            "depthAvg": 17.7,
                            "depthMin": 12
                        },
                        {
                            "start": 7577148,
                            "end": 7577155,
                            "depthAvg": 19.375,
                            "depthMin": 19
                        }
                    ]
                }
            ]
        }

    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("fileId")) {
            this.fileIdObserver();
        }
        if (changedProperties.has("alignmentStats")) {
            this.alignmentStatsObserver();
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.clinicalAnalysisId) {
            let _this = this;
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    _this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
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
                <div>
                    <h3>Alignment Stats</h3>
                    ${this.file ? html`
                        <div class="row">
                            <div class="col-md-12">
                                ${Object.entries(this.file).map( ([k, v]) => html`
                                    <div class="form-horizontal">
                                        <div class="form-group">
                                            <label class="col-md-3 label-title">${k}</label>
                                            <span class="col-md-9">${v}</span>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        </div>
                    ` : html`No Stats available.`}
                </div>
            `;
    }

}

customElements.define("variant-interpreter-qc-alignment", VariantInterpreterQcAlignment);
