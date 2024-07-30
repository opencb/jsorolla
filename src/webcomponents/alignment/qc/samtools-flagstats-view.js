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

class SamtoolsFlagstatsView extends LitElement {

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
            flagstats: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.flagstats = [];
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
        // this.filesObserver();
    }

    filesObserver() {
        const _samtoolsFlagStats = [];
        const _columns = [];
        if (this.files) {
            for (const file of this.files) {
                // Store Samtools flag stats
                if (file.qualityControl?.alignment?.samtoolsFlagStats) {
                    _samtoolsFlagStats.push(file.qualityControl.alignment.samtoolsFlagStats);

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
        this.flagstats = _samtoolsFlagStats;
    }

    onDownload(e) {
        const header = this.config?.columns?.length ? this.config.columns.map(col => col.name) : this.flagstats.map(stat => stat.sampleId);
        const d = this.config.rows.map(variable => [variable.name, ...this.flagstats.map(stat => stat[variable.field] ?? "N/A")].join("\t"));
        if (e.currentTarget.dataset.downloadOption.toUpperCase() === "TAB") {
            const dataString = [
                ["#key", ...header].join("\t"),
                d.join("\n")];
            UtilsNew.downloadData(dataString, "samtools_flagstats.txt", "text/plain");
        } else {
            UtilsNew.downloadData(JSON.stringify(this.flagstats, null, "\t"), "samtools_flagstats.json", "application/json");
        }
    }

    render() {
        if (!this.flagstats || this.flagstats.length === 0) {
            return html`
                <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> Samtools Flagstats not found.</div>`;
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
                                    <a class="dropdown-item" href="javascript:;" data-download-option="${item}" @click="${this.onDownload}">${item}</a>
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
                        <th></th>
                            ${this.config?.columns?.length ?
                            this.config.columns.map(col => html`
                                    <th class="${col.classes}">${col.name}</th>`) :
                            this.flagstats.map(() => html`<th>Values</th>`)
                            }
                        </tr>
                        </thead>
                        <tbody>
                        ${this.config.rows.map(variable => html`
                            <tr>
                                <td>
                                    <label class="fw-bold">${variable.name}</label>
                                </td>
                                ${this.flagstats.map(stat => html`<td>${stat[variable.field].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? "N/A"}</td>`) }
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
            // columns: [
            //     {
            //         name: "ISDBM322015",
            //         classes: "text-danger"
            //     },
            //     {
            //         name: "ISDBM322016",
            //         classes: ""
            //     },
            // ],
            download: ["Tab", "JSON"],
            rows: [
                {
                    name: "totalReads",
                    field: "totalReads"
                },
                {
                    name: "totalQcPassed",
                    field: "totalQcPassed"
                },
                {
                    name: "mapped",
                    field: "mapped"
                },
                {
                    name: "secondaryAlignments",
                    field: "secondaryAlignments"
                },
                {
                    name: "supplementary",
                    field: "supplementary"
                },
                {
                    name: "duplicates",
                    field: "duplicates"
                },
                {
                    name: "pairedInSequencing",
                    field: "pairedInSequencing"
                },
                {
                    name: "read1",
                    field: "read1"
                },
                {
                    name: "read2",
                    field: "read2"
                },
                {
                    name: "properlyPaired",
                    field: "properlyPaired"
                },
                {
                    name: "selfAndMateMapped",
                    field: "selfAndMateMapped"
                },
                {
                    name: "singletons",
                    field: "singletons"
                },
                {
                    name: "mateMappedToDiffChr",
                    field: "mateMappedToDiffChr"
                },
                {
                    name: "diffChrMapQ5",
                    field: "diffChrMapQ5"
                },
            ]
        };
    }

}

customElements.define("samtools-flagstats-view", SamtoolsFlagstatsView);
