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
import UtilsNew from "../../core/utilsNew.js";

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
            opencgaSession: {
                type: Object
            },
            // fileIds: {
            //     type: Array
            // },
            sample: {
                type: Object
            },
            samples: {
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
        this._prefix = UtilsNew.randomString(8);

        this.flagstats = [];
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        // if (changedProperties.has("fileIds")) {
        //     this.fileIdsObserver();
        // }

        if (changedProperties.has("sample")) {
            this.sampleObserver();
        }

        if (changedProperties.has("samples")) {
            this.samplesObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    // fileIdsObserver() {
    //     if (this.opencgaSession && this.fileIds) {
    //         this.opencgaSession.opencgaClient.alignments().infoStats(this.fileIds.join(","), {study: this.opencgaSession.study.fqn})
    //             .then(response => {
    //                 this.alignmentStats = response.responses[0].results;
    //                 this.requestUpdate();
    //             })
    //             .catch(response => {
    //                 console.error("An error occurred fetching clinicalAnalysis: ", response);
    //             });
    //     }
    // }

    sampleObserver() {
        if (this.sample && this.sample?.qualityControl?.alignmentMetrics?.length > 0  && this.sample.qualityControl.alignmentMetrics[0].samtoolsFlagstats) {
            // Get BAM file name and add it to the table
            let bamFileName = this.sample.qualityControl.alignmentMetrics[0].bamFileId || "N/A";
            if (this.sample.qualityControl.alignmentMetrics[0].bamFileId?.includes(":")) {
                let parts = this.sample.qualityControl.alignmentMetrics[0].bamFileId.split(":");
                bamFileName = parts[parts.length - 1];
            }

            // Configure the table
            this._config.columns = [
                {
                    name: `${bamFileName}`,
                    classes: ""
                }
            ];
            // St flagstats array
            this.flagstats = [this.sample.qualityControl.alignmentMetrics[0].samtoolsFlagstats];
        }
    }

    samplesObserver() {
        if (this.samples) {
            this._config.columns = [];
            let _flagstats = [];
            for (let sample of this.samples) {
                let alignmentMetric = sample?.qualityControl?.alignmentMetrics?.[0];
                // if (sample?.qualityControl?.alignmentMetrics?.length > 0 && sample.qualityControl.alignmentMetrics[0].samtoolsFlagstats) {
                if (alignmentMetric) {
                    _flagstats.push(alignmentMetric.samtoolsFlagstats);

                    // Get BAM file name and add it to the table
                    let bamFileName = alignmentMetric.bamFileId || "N/A";
                    if (alignmentMetric.bamFileId?.includes(":")) {
                        let parts = alignmentMetric.bamFileId.split(":");
                        bamFileName = parts[parts.length - 1];
                    }

                    // Configure the table
                    this._config.columns.push(
                        {
                            name: `${bamFileName}`,
                            classes: ""
                        });
                }
            }
            // Set flagstats array
            this.flagstats = _flagstats;
        }
    }

    renderTable() {
        return html`
            <table class="table table-hover table-no-bordered">
                <thead>
                    <tr>
                        <th></th>
                        ${// Read column name from configuration if exist, otherwise use sampleId from the stats object
                            this._config?.columns?.length
                                ? this._config.columns.map( col => html`<th class="${col.classes}">${col.name}</th>`)
                                : this.flagstats.map( stat => html`<th>Values</th>`)
                        }
                    </tr>
                </thead>
                <tbody>
                    ${this._config.rows.map(variable => html`
                        <tr>
                            <td>
                                <label>${variable.name}</label>
                            </td>
                            ${this.flagstats.map(stat => html`<td>${stat[variable.field].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? "N/A"}</td>`) }
                        </tr>
                    `)}
                </tbody>
            </table>`;
    }

    onDownload(e) {
        const header = this._config?.columns?.length ? this._config.columns.map( col => col.name) : this.flagstats.map( stat => stat.sampleId)
        const d = this._config.rows.map(variable => [variable.name, ...this.flagstats.map(stat => stat[variable.field] ?? "N/A")].join("\t"))
        if (e.currentTarget.dataset.downloadOption.toLowerCase() === "tab") {
            const dataString = [
                ["#key", ...header].join("\t"),
                d.join("\n")];
            UtilsNew.downloadData(dataString, "samtools_flagstats.txt", "text/plain");
        } else {
            UtilsNew.downloadData(JSON.stringify(this.flagstats, null, "\t"), this.opencgaSession.study.id + ".json", "application/json");
        }
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
            // ],

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
            ],
            download: ["Tab", "JSON"]
        };
    }

    render() {
        if (!this.flagstats || this.flagstats.length === 0) {
            return html`<div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> Samtools Flagstat not found.</div>`;
        }

        // Alignment stats are the same for FAMILY and CANCER analysis
        return html`
            <div>
                <div class="btn-group pull-right">
                    <button type="button" class="btn btn-default ripple btn-sm dropdown-toggle" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-download pad5" aria-hidden="true"></i> Download <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu btn-sm">
                        ${this._config.download.length
                            ? this._config.download.map(item => html`
                                <li><a href="javascript:;" data-download-option="${item}" @click="${this.onDownload}">${item}</a></li>`)
                            : null
                        }
                    </ul>
                </div>
                ${this.renderTable()}
            </div>
        `;
    }

}

customElements.define("samtools-flagstats-view", SamtoolsFlagstatsView);
