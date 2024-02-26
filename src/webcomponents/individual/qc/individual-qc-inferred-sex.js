/**
/**
 * Copyright 2015-2019 OpenCB
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

export default class IndividualQcInferredSex extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            individualId: {
                type: String
            },
            individual: {
                type: Object
            },
            individuals: {
                type: Array
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("individual")) {
            this.individuals = [this.individual];
        }

        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }

        super.update(changedProperties);
    }

    individualIdObserver() {
        if (this.individualId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.individuals()
                .info(this.individualId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.individuals = response.responses[0].results;
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    onDownload(e) {
        // Check if user clicked in Tab or JSON format
        if (e.currentTarget.dataset.downloadOption.toLowerCase() === "tab") {
            const data = this.individuals.map(individual => {
                const inferredSex = individual?.qualityControl?.inferredSexReports[0];
                return [
                    individual.id,
                    individual?.qualityControl?.sampleId ?? "N/A",
                    individual.karyotypicSex,
                    ...(inferredSex ?
                        [
                            inferredSex.values.ratioX.toFixed(4),
                            inferredSex.values.ratioY.toFixed(4),
                            inferredSex.inferredKaryotypicSex ?? "-",
                            inferredSex.method
                        ] : ["-", "-", "-", "-"])
                ].join("\t");
            });
            const dataString = [
                [
                    "Individual ID",
                    "Sample ID", "Sex",
                    "Reported Phenotypic Sex",
                    "Reported Karyotypic Sex",
                    "Ratio (avg. chrX/auto)",
                    "Ratio (avg. chrY/auto)",
                    "Inferred Karyotypic Sex",
                    "Method"
                ].join("\t"),
                data.join("\n")
            ];
            UtilsNew.downloadData(dataString, "inferred_sex_" + this.opencgaSession.study.id + ".tsv", "text/plain");
        } else {
            const data = this.individuals.map(individual => {
                return {
                    id: individual.id,
                    sampleId: individual?.qualityControl?.sampleId ?? "N/A",
                    karyotypicSex: individual.karyotypicSex,
                    ...individual?.qualityControl?.inferredSexReports[0]
                };
            });
            UtilsNew.downloadData(JSON.stringify(data, null, "\t"), this.opencgaSession.study.id + ".json", "application/json");
        }
    }

    renderTableRow(individual) {
        const inferredSex = individual?.qualityControl?.inferredSexReports[0];
        const hasSameSex = individual.karyotypicSex === inferredSex?.inferredKaryotypicSex;
        return html`
            <tr>
                <td>${individual.id}</td>
                <td>${inferredSex?.sampleId ?? "N/A"}</td>
                <td>${UtilsNew.isEmpty(individual?.sex) ? "Not specified" : individual.sex?.id || individual.sex}</td>
                <td>
                    <span style="color: ${!inferredSex || hasSameSex ? "black" : "red"}">
                        ${individual.karyotypicSex}
                    </span>
                </td>
                <td>${inferredSex.values.ratioX.toFixed(4)}</td>
                <td>${inferredSex.values.ratioY.toFixed(4)}</td>
                <td>
                    <span style="color: ${hasSameSex ? "black" : "red"}">
                        ${inferredSex.inferredKaryotypicSex || "-"}
                    </span>
                </td>
                <td>${inferredSex.method}</td>
            </tr>
        `;
    }

    renderTable() {
        if (this.individuals && Array.isArray(this.individuals)) {
            const individualsWithInferredSex = this.individuals.filter(individual => {
                return (individual?.qualityControl?.inferredSexReports || []).length > 0;
            });

            return html`
                <table class="table table-hover text-center">
                    <thead>
                        <tr>
                            <th>Individual ID</th>
                            <th>Sample ID</th>
                            <th>Reported Phenotypic Sex</th>
                            <th>Reported Karyotypic Sex</th>
                            <th>Ratio (avg. chrX/auto)</th>
                            <th>Ratio (avg. chrY/auto)</th>
                            <th>Inferred Karyotypic Sex</th>
                            <th>Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${individualsWithInferredSex.map(individual => this.renderTableRow(individual))}
                    </tbody>
                </table>
            `;
        }

        return null;
    }

    render() {
        if (!this.individual?.qualityControl && !this.individuals?.length) {
            return html`
                <div class="alert alert-warning">
                    No QC data are available yet.
                </div>
            `;
        }

        const individualsWithoutInferredSex = (this.individuals || [])
            .filter(individual => (individual?.qualityControl?.inferredSexReports || []).length === 0)
            .map(individual => individual.id);

        return html`
            <div>
                ${individualsWithoutInferredSex.length > 0 ? html`
                    <div class="alert alert-warning">
                        Inferred Sex data not available for individuals ${individualsWithoutInferredSex.join(", ")}.
                    </div>
                ` : null}
                ${individualsWithoutInferredSex.length !== this.individuals?.length ? html`
                    <div>
                        <div class="btn-group float-end">
                            <button type="button" class="btn btn-light btn-sm dropdown-toggle" data-bs-toggle="dropdown"
                                    aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-download pe-1" aria-hidden="true"></i> Download
                            </button>
                            <ul class="dropdown-menu btn-sm">
                                ${this._config?.download && this._config?.download?.length ? this._config.download.map(item => html`
                                    <li><a href="javascript:;" data-download-option="${item}" @click="${this.onDownload}">${item}</a></li>
                                `) : null}
                            </ul>
                        </div>
                        <div>
                            ${this.renderTable()}
                        </div>
                    </div>
                ` : null}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            download: ["Tab", "JSON"]
        };
    }

}

customElements.define("individual-qc-inferred-sex", IndividualQcInferredSex);
