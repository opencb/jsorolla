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
import UtilsNew from "../../utilsNew.js";

class AlignmentStatsView extends LitElement {

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
            fileIds: {
                type: Array
            },
            alignmentStats: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);

        this.gridId = this._prefix + "GeneBrowserGrid";
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        this.alignmentStats = {
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
        this.requestUpdate();
    }

    updated(changedProperties) {
        if (changedProperties.has("alignmentStats")) {
            this.renderTable();
        }

        if (changedProperties.has("fileIds")) {
            this.fileIdsObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    fileIdsObserver() {
        if (this.opencgaSession && this.fileIds) {
            this.opencgaSession.opencgaClient.alignments().infoStats(this.fileIds.join(","), {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.alignmentStats = response.responses[0].results;
                    this.renderTable();
                    // this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    renderTable() {
        if (!Array.isArray(this.alignmentStats)) {
            this.alignmentStats = [this.alignmentStats, this.alignmentStats, this.alignmentStats];
        }

        if (this.alignmentStats) {
            let cols = [];
            cols.push(`<th>Key</th>`);

            // Read column name from configuration if exist, otherwise use sampleId from the stats object
            if (this._config.cols && this._config.cols.length > 0) {
                for (let col of this._config.cols) {
                    cols.push(`<th class="${col.classes}">${col.name}</th>`);
                }
            } else {
                for (let stat of this.alignmentStats) {
                    cols.push(`<th>${stat.sampleId}</th>`);
                }
            }

            let rows = [];
            for (let variable of this._config.rows) {
                let cells = [];
                cells.push(`<td><label>${variable.name}</label></td>`);
                for (let stat of this.alignmentStats) {
                    if (stat[variable.field] !== undefined && stat[variable.field] != null) {
                        cells.push(`<td>${stat[variable.field]}</td>`);
                    } else {
                        cells.push(`<td>N/A</td>`);
                    }
                }
                rows.push(`<tr>${cells.join("")}</tr>`)
            }

            let tableHtml = `
                <thead>
                    <tr>
                        ${cols.join("")}
                    </tr>
                </thead>
                <tbody>
                    ${rows.join("")}
                </tbody>
            `;

            document.getElementById(this.gridId).innerHTML = tableHtml;
        }
    }

    getDefaultConfig() {
        return {
            title: "Samtools Stats",
            cols: [
                {
                    name: "ISDBM322015",
                    classes: "text-danger"
                },
                {
                    name: "ISDBM322016",
                    classes: ""
                },
                {
                    name: "ISDBM322017",
                    classes: ""
                }
            ],
            rows: [
                {
                    name: "File",
                    field: "fileId"
                },
                {
                    name: "Sample ID",
                    field: "sampleId"
                },
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
        };
    }

    render() {
        // Alignment stats are the same for FAMILY and CANCER analysis
        return html`
            <div>
                <h3>${this._config.title}</h3>
            </div>
            <div>
                <table id="${this.gridId}" class="table table-hover table-no-bordered"></table>
            </div>
        `;
    }

}

customElements.define("alignment-stats-view", AlignmentStatsView);
