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
import NotificationUtils from "../../commons/utils/notification-utils.js";
import "../../commons/forms/data-form.js";

export default class IndividualQcMendelianErrors extends LitElement {

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
            individualId: {
                type: String
            },
            individual: {
                type: Object
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }

        super.update(changedProperties);
    }

    individualIdObserver() {
        if (this.individualId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.individuals()
                .info(this.individualId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this.individual = response.responses[0].results[0];
                })
                .catch(response => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                });
        }
    }

    onDownload(event) {
        if (this.individual?.qualityControl?.mendelianErrorReports) {
            const format = event.currentTarget.dataset.format || "JSON";
            const mendelianErrorReport = this.individual.qualityControl.mendelianErrorReports[0];
            const sampleAggregation = mendelianErrorReport.sampleAggregation.find(sampleAggregation => {
                return sampleAggregation.sample === this.individual.samples[0]?.id;
            });
            const fileName = `mendelian-errors-${sampleAggregation.sample}-${this.opencgaSession.study.id}`;

            switch (format.toUpperCase()) {
                case "TAB":
                    const tableFields = ["sample", "totalNumErrors", "ratio", "chromosome", "errorCode", "numErrors"];
                    const tableContent = (sampleAggregation.chromAggregation || [])
                        .map(chromAggregation => {
                            return Object.keys(chromAggregation?.errorCodeAggregation).map(key => ({
                                sample: sampleAggregation.sample,
                                totalNumErrors: sampleAggregation.numErrors,
                                ratio: sampleAggregation.ratio.toFixed(4),
                                chromosome: chromAggregation.chromosome,
                                errorCode: key,
                                numErrors: chromAggregation.errorCodeAggregation[key],
                            }));
                        })
                        .flat();
                    const data = UtilsNew.toTableString(tableContent, tableFields, {});
                    UtilsNew.downloadData(data, `${fileName}.tsv`, "text/plain");
                    break;
                case "JSON":
                    UtilsNew.downloadData(JSON.stringify(sampleAggregation, null, "    "), `${fileName}.json`, "application/json");
                    break;
            }
        }
    }

    renderChromosomeAggregationRow(sampleAggregation, chromAggregation) {
        return Object.keys(chromAggregation?.errorCodeAggregation).map(key => {
            return html`
                <tr>
                    <td>
                        <label>${sampleAggregation.sample}</label>
                    </td>
                    <td>${chromAggregation.chromosome}</td>
                    <td>${key}</td>
                    <td>${chromAggregation.errorCodeAggregation[key]}</td>
                </tr>
            `;
        });
    }

    renderTable() {
        if (this.individual?.qualityControl?.mendelianErrorReports) {
            const mendelianErrorReport = this.individual.qualityControl.mendelianErrorReports[0];
            const sampleAggregation = mendelianErrorReport.sampleAggregation.find(sampleAggregation => {
                return sampleAggregation.sample === this.individual.samples[0]?.id;
            });

            sampleAggregation.chromAggregation = sampleAggregation.chromAggregation.filter(ch => {
                return !isNaN(ch.chromosome) || ["X", "Y", "MT"].includes(ch.chromosome);
            });
            sampleAggregation.chromAggregation.sort((a, b) => {
                const chA = a.chromosome;
                const chB = b.chromosome;
                const A = Boolean(parseInt(chA));
                const B = Boolean(parseInt(chB));
                if (A && !B) return -1;
                if (!A && B) return 1;
                if (!A && !B) return chA.length < chB.length ? -1 : chA < chB ? -1 : 1;
                return chA - chB;
            });

            const roles = {
                [this.individual.father?.id]: "FATHER",
                [this.individual.mother?.id]: "MOTHER",
            };

            return html`
                <h4 class="pt-3">Summary</h4>
                <table class="table table-hover">
                    <thead>
                    <tr>
                        <th>Sample ID</th>
                        <th>Role</th>
                        <th>Number of Mendelian Errors</th>
                        <th>Rate of Mendelian Errors</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${mendelianErrorReport.sampleAggregation.map(sampleAggregation => html`
                        <tr>
                            <td>
                                <label>${sampleAggregation.sample}</label>
                            </td>
                            <td>${roles[sampleAggregation.sample] || "-"}</td>
                            <td>${sampleAggregation.numErrors}</td>
                            <td>${sampleAggregation.ratio.toFixed(4)}</td>
                            <td>
                                <span>
                                    ${sampleAggregation.ratio < 0.05 ? html`
                                        <i class='fa fa-check' style='color: green'></i>` : html`
                                        <i class='fa fa-times' style='color: red'></i>`
                                    }
                                </span>
                            </td>
                        </tr>
                    `)}
                    </tbody>
                </table>

                <!-- Print errors for Individual -->
                <h4 class="pt-3">Mendelian Errors of ${this.individual.id}</h4>
                <table class="table table-hover">
                    <thead>
                    <tr>
                        <th>Sample ID</th>
                        <th>Chromosome</th>
                        <th>Error Code</th>
                        <th>Number of Mendelian Errors</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${sampleAggregation?.chromAggregation.map(item => this.renderChromosomeAggregationRow(sampleAggregation, item))}
                    </tbody>
                </table>
            `;
        }
    }

    render() {
        if (!this.individual?.qualityControl?.mendelianErrorReports?.length) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle"></i> No QC data are available yet.
                </div>
            `;
        }

        return html`
            <div>
                <div class="btn-group float-end">
                    <button type="button" class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-download pe-1" aria-hidden="true"></i> Download
                    </button>
                    <ul class="dropdown-menu">
                        ${this._config.download?.length && this._config.download.map(item => html`
                            <li>
                                <a class="dropdown-item" href="javascript: void 0" data-format="${item}" @click="${this.onDownload}">${item}</a>
                            </li>
                        `)}
                    </ul>
                </div>
                <div>
                    ${this.renderTable()}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            download: ["Tab", "JSON"]
        };
    }

}

customElements.define("individual-qc-mendelian-errors", IndividualQcMendelianErrors);
