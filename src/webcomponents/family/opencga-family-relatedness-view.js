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
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";

export default class OpencgaFamilyRelatednessView extends LitElement {

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
            familyId: {
                type: String
            },
            family: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    familyIdObserver() {
        if (this.opencgaSession && this.familyId) {
            this.opencgaSession.opencgaClient.families().info(this.familyId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.family = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    onDownload(e) {
        // Check if user clicked in Tab or JSON format
        const relatedness = this.family?.qualityControl?.relatedness[0];
        if (relatedness) {
            if (e.currentTarget.dataset.downloadOption.toLowerCase() === "tab") {
                const data = relatedness.scores.map(score => {
                    return [
                        score.sampleId1,
                        score.sampleId2,
                        score.reportedRelationship || "-",
                        score?.values?.PiHat,
                        score?.values?.z0,
                        score?.values?.z1,
                        score?.values?.z2,
                        score?.inferredRelationship,
                        score?.validation
                    ].join("\t");
                });
                const dataString = [
                    ["Sample ID 1", "Sample ID 2", "Reported Relationship", "PiHat", "IBD0", "IBD1", "IBD2", "Inferred Relationship", "Validation"].join("\t"),
                    data.join("\n")
                ];
                UtilsNew.downloadData(dataString, "family_relatedness" + this.opencgaSession.study.id + ".tsv", "text/plain");
            } else {
                UtilsNew.downloadData(JSON.stringify(relatedness, null, "\t"), this.opencgaSession.study.id + ".json", "application/json");
            }
        }
    }

    renderTable() {
        if (this.family?.qualityControl?.relatedness?.length > 0) {
            const relatedness = this.family.qualityControl.relatedness[0];
            return html`
                <table class="table table-hover">
                    <thead>
                    <tr>
                        <th>Sample ID 1</th>
                        <th>Sample ID 2</th>
                        <th>Reported Relationship</th>
                        <th>PiHat</th>
                        <th>IBD0</th>
                        <th>IBD1</th>
                        <th>IBD2</th>
                        <th>Inferred Relationship</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${relatedness.scores.map(score => {
                        return html`
                            <tr>
                                <td>
                                    <label>${score.sampleId1}</label>
                                </td>
                                <td>
                                    <label>${score.sampleId2}</label>
                                </td>
                                <td>
                                    <span>
                                        ${score.reportedRelationship || "-"}
                                    </span>
                                </td>
                                <td>${score.values.PiHat}</td>
                                <td>${score.values.z0}</td>
                                <td>${score.values.z1}</td>
                                <td>${score.values.z2}</td>
                                <td>
                                    <span>
                                        ${score.inferredRelationship}
                                    </span>
                                </td>
                                <td>
                                    <span>${score.validation === "PASS" || score.reportedRelationship === "UNKNOWN" ? html`
                                        <i class='fa fa-check' style='color: green'></i>` : html`
                                        <i class='fa fa-times' style='color: red'></i>`
                                    }
                                    </span>
                                </td>
                            </tr>
                        `;
                    })}
                    </tbody>
                </table>`;
        }
    }

    getDefaultConfig() {
        return {
            download: ["Tab", "JSON"]
        };
    }

    render() {
        if (!this.family?.qualityControl?.relatedness?.length) {
            return html`
                <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No Relatedness data are available yet.</div>
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
                        ${this._config?.download && this._config?.download?.length ? this._config.download.map(item => html`
                            <li><a class="dropdown-item" href="javascript:;" data-download-option="${item}" @click="${this.onDownload}">${item}</a></li>
                        `) : null}
                    </ul>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <h4>Information</h4>
                        <div class="col-md-2">
                            <label>Method:</label>
                        </div>
                        <div class="col-md-10">
                            <span>${this.family.qualityControl.relatedness[0]?.method}</span>
                        </div>
                    </div>
                    <div class="col-md-12">
                        <div class="col-md-2">
                            <label>MAF:</label>
                        </div>
                        <div class="col-md-10">
                            <span>${this.family.qualityControl.relatedness[0]?.maf || "-"}</span>
                        </div>
                    </div>
                    <div class="col-md-12">
                        <h4>Results</h4>
                        <div style="padding: 5px 20px">${this.renderTable()}</div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-family-relatedness-view", OpencgaFamilyRelatednessView);
