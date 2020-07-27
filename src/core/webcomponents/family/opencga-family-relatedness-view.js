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
import "../commons/view/data-form.js";


export default class OpencgaFamilyRelatednessView extends LitElement {

    constructor() {
        super();

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

    _init() {
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    familyIdObserver() {
        if (this.opencgaSession && this.familyId) {
            this.opencgaSession.opencgaClient.families().info(this.familyId, {study: this.opencgaSession.study.fqn})
                .then( response => {
                    this.family = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    onDownload(e) {
        let dataString = [];
        let mimeType = "";
        let extension = "";
        // Check if user clicked in Tab or JSON format
        if (e.currentTarget.dataset.downloadOption.toLowerCase() === "tab") {

            const relatedness = this.family?.qualityControl?.relatedness[0];

            const data = relatedness.scores.map(score => {
                return [
                    score.sampleId1,
                    score.sampleId2,
                    score.inferredRelationship,
                    score?.values?.z0,
                    score?.values?.z1,
                    score?.values?.z2,
                    score?.values?.PiHat,
                    score?.inferredRelationship
                ].join("\t")
            });

            dataString = [
                [
                    "Sample ID 1", "Sample ID 2", "Reported Relationship", "IBD0",	"IBD1",	"IBD2",	"PiHat", "Inferred Relationship"
                ].join("\t"),
                data.join("\n")
            ];
            //console.log(dataString);
            mimeType = "text/plain";
            extension = ".txt";
        } else {
            dataString = [JSON.stringify(this.family?.qualityControl?.relatedness[0], null, "\t")];
            mimeType = "application/json";
            extension = ".json";
        }

        // Build file and anchor link
        const data = new Blob([dataString.join("\n")], {type: mimeType});
        const file = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = file;
        a.download = this.opencgaSession.study.alias + extension;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
        }, 0);
    }

    renderTable() {
        if (this.family?.qualityControl?.relatedness?.length > 0) {
            let relatedness = this.family.qualityControl.relatedness[0];
            return html`
                <table class="table table-hover table-no-bordered text-center">
                    <thead>
                        <tr>
                            <th>Sample ID 1</th>
                            <th>Sample ID 2</th>
                            <th>Reported Relationship</th>
                            <th>IBD0</th>
                            <th>IBD1</th>
                            <th>IBD2</th>
                            <th>PiHat</th>
                            <th>Inferred Relationship</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${relatedness.scores.map(score => {
                            let role = this.family.roles[score.sampleId1][score.sampleId2];
                            return html`
                                <tr>
                                    <td>
                                        <label>${score.sampleId1}</label>
                                    </td>
                                    <td>
                                        <label>${score.sampleId2}</label>
                                    </td>
                                    <td>
                                        <span style="color: ${role === score.inferredRelationship ? "black" : "red"}">
                                            ${role ? role : "-"}
                                        </span>
                                    </td>
                                    <td style="text-align: right;">${score.values.z0}</td>
                                    <td style="text-align: right;">${score.values.z1}</td>
                                    <td style="text-align: right;">${score.values.z2}</td>
                                    <td style="text-align: right;">${score.values.PiHat}</td>
                                    <td>
                                        <span style="color: ${role === score.inferredRelationship ? "black" : "red"}">
                                            ${score.inferredRelationship}
                                        </span>
                                    </td>
                                    <td>
                                        <span>${role === score.inferredRelationship
                                            ? html`<i class='fa fa-check' style='color: green'></i>`
                                            : html`<i class='fa fa-times' style='color: red'></i>`
                                        }
                                        </span>
                                    </td>
                                </tr>
                            `})
                        }
                    </tbody>
                </table>`;
        }
    }

    getDefaultConfig() {
        return {
            download: ["Tab", "JSON"]
        }
    }

    render() {
        if (!this.family?.qualityControl?.relatedness || this.family.qualityControl.relatedness.length === 0) {
            return html`<div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No QC data are available yet.</div>`;
        }

        return html`
            <div>
                <div class="btn-group pull-right">
                    <button type="button" class="btn btn-default ripple btn-sm dropdown-toggle" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-download pad5" aria-hidden="true"></i> Download <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu btn-sm">
                        ${this._config?.download && this._config?.download?.length ? this._config.download.map(item => html`
                                <li><a href="javascript:;" data-download-option="${item}" @click="${this.onDownload}">${item}</a></li>
                        `) : null}
                    </ul>
                </div>
                
                <div class="row">
                    <div class="col-md-12">
                        <div class="col-md-2">
                            <label>Method:</label>
                        </div>
                        <div class="col-md-10">
                            <span>${this.family.qualityControl.relatedness[0].method}</span>
                        </div>
                    </div>
                    <div class="col-md-12">
                        <div class="col-md-2">
                            <label>MAF:</label>
                        </div>
                        <div class="col-md-10">
                            <span>${this.family.qualityControl.relatedness[0].maf || "-"}</span>
                        </div>
                    </div>
                    <div class="col-md-12">
                        <div class="col-md-12">
                            <label>Results:</label>
                        </div>
                        <div class="col-md-12">
                            ${this.renderTable()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-family-relatedness-view", OpencgaFamilyRelatednessView);
