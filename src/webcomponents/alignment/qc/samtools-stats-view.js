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

class SamtoolsStatsView extends LitElement {

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
            file: {
                type: Object
            },
            files: {
                type: Array
            },
            samtoolsStats: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.samtoolsStats = [];
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("file")) {
            this.fileObserver();
        }
        if (changedProperties.has("files")) {
            this.filesObserver();
        }
        if (changedProperties.has("config")) {
            this.config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    fileObserver() {
        this.files = [this.file];
        this.filesObserver();
    }

    filesObserver() {
        const _samtoolsStats = [];
        const _columns = [];
        if (this.files) {
            for (const file of this.files) {
                // Store Samtools stats
                if (file.qualityControl?.alignment?.samtoolsStats) {
                    _samtoolsStats.push(file.qualityControl.alignment.samtoolsStats);

                    // Configure the table columns only if not provided
                    if (!this.config.columns) {
                        _columns.push(
                            {
                                name: `${file.name}`,
                                classes: ""
                            }
                        );
                    }
                }
            }
        }
        this.config.columns = _columns;
        this.samtoolsStats = _samtoolsStats;
    }

    onDownload(e) {
        const header = this.config?.columns?.length ? this.config.columns.map(col => col.name) : this.samtoolsStats.map(stat => stat.sampleId);
        const d = this.config.rows.map(variable => [variable.name, ...this.samtoolsStats.map(stat => stat[variable.field] ?? "N/A")].join("\t"));
        if (e.currentTarget.dataset.downloadOption.toUpperCase() === "TAB") {
            const dataString = [
                ["#key", ...header].join("\t"),
                d.join("\n")];
            UtilsNew.downloadData(dataString, "samtools_stats.txt", "text/plain");
        } else {
            UtilsNew.downloadData(JSON.stringify(this.samtoolsStats, null, "\t"), "samtools_stats.json", "application/json");
        }
    }

    render() {
        if (this.samtoolsStats?.length === 0) {
            return html`
                <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> Samtools Stats not found.</div>`;
        }

        return html`
            <div>
                <!-- Render the Download button -->
                <div class="dropdown float-end mb-3">
                    <button type="button" class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-download pe-1" aria-hidden="true"></i> Download
                    </button>
                    <ul class="dropdown-menu">
                        ${this.config.download?.length ?
                            this.config.download.map(item => html`
                                <li>
                                    <a href="javascript:;" data-download-option="${item}" @click="${this.onDownload}">${item}</a>
                                </li>`
                            ) : null
                        }
                    </ul>
                </div>

                <!-- Render the table -->
                <div>
                    <table class="table table-hover">
                        <thead>
                        <tr>
                            ${this.config?.columns?.length ?
                                this.config.columns.map(col => html`
                                    <th class="${col.classes}">${col.name}</th>`) :
                                this.samtoolsStats?.map(stat => {
                                    const splitFields = stat.fileId.split(":");
                                    return html`<th>${splitFields[splitFields.length - 1]}</th>`;
                                })
                            }
                        </tr>
                        </thead>
                        <tbody>
                        ${this.config.rows.map(variable => html`
                            <tr>
                                <td>
                                    <label class="fw-bold">${variable.name}</label>
                                </td>
                                ${this.samtoolsStats?.map(stat => html`<td>${stat[variable.field] ?? "N/A"}</td>`) }
                            </tr>
                        `)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            // title: "Samtools Stats",
            // columns: [
            //     {
            //         name: "ISDBM322015",
            //         classes: "text-danger"
            //     },
            //     {
            //         name: "ISDBM322016",
            //         classes: ""
            //     },
            //     {
            //         name: "ISDBM322017",
            //         classes: ""
            //     }
            // ],
            rows: [
                {
                    name: "rawTotalSequences",
                    field: "rawTotalSequences"
                },
                {
                    name: "filteredSequences",
                    field: "filteredSequences"
                },
                {
                    name: "readsDuplicated",
                    field: "readsDuplicated"
                },
                {
                    name: "insertSizeAverage",
                    field: "insertSizeAverage"
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
            ],
            download: ["Tab", "JSON"]
        };
    }

}

customElements.define("samtools-stats-view", SamtoolsStatsView);
