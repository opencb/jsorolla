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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import "../commons/view/data-form.js";


export default class OpencgaIndividualRelatednessView extends LitElement {

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
            individualId: {
                type: String
            },
            individual: {
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
        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    individualIdObserver() {
        if (this.opencgaSession && this.individualId) {
            this.opencgaSession.opencgaClient.individuals().info(this.individualId, {study: this.opencgaSession.study.fqn})
                .then( response => {
                    this.individual = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    renderTable() {
        if (this.individual && this.individual.qualityControl.metrics && this.individual.qualityControl.metrics[0].relatednessReport) {
            // Prepare roles
            let roles = {};
            roles[this.individual.id + "-" + this.individual.father?.id] = "FATHER";
            roles[this.individual.id + "-" + this.individual.mother?.id] = "MOTHER";
            roles[this.individual.father?.id + "-" + this.individual.mother?.id] = "SPOUSE";
            roles[this.individual.mother?.id + "-" + this.individual.father?.id] = "HUSBAND";

            let _cellPadding = "padding: 0px 15px";
            let relatednessReport = this.individual.qualityControl.metrics[0].relatednessReport;
            return html`
                <table class="table table-hover table-no-bordered">
                    <thead>
                        <tr>
                            <th>Sample ID 1</th>
                            <th>Sample ID 2</th>
                            <th>Reported Relationship</th>
                            <th style="text-align: center">IBD0</th>
                            <th style="text-align: center">IBD1</th>
                            <th style="text-align: center">IBD2</th>
                            <th style="text-align: center">Pi-Hat</th>
                            <th>Inferred Relationship</th>
                            <th style="text-align: center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${relatednessReport.scores.map(score => {
                            let role = roles[score.sampleId1 + "-" + score.sampleId2];
                            return html`
                                <tr>
                                    <td style="${_cellPadding}">
                                        <label>${score.sampleId1}</label>
                                    </td>
                                    <td style="${_cellPadding}">
                                        <label>${score.sampleId2}</label>
                                    </td>
                                    <td style="${_cellPadding}">
                                        <span style="color: ${role === score.inferredRelationship ? "black" : "red"}">
                                            ${role ? role : "-"}
                                        </span>
                                    </td>
                                    <td style="text-align: right; ${_cellPadding}">${score.values.IBD0}</td>
                                    <td style="text-align: right; ${_cellPadding}">${score.values.IBD1}</td>
                                    <td style="text-align: right; ${_cellPadding}">${score.values.IBD2}</td>
                                    <td style="text-align: right; ${_cellPadding}">${score.values.PiHat}</td>
                                    <td style="${_cellPadding}">
                                        <span style="color: ${role === score.inferredRelationship ? "black" : "red"}">
                                            ${score.inferredRelationship}
                                        </span>
                                    </td>
                                    <td style="text-align: center; ${_cellPadding}">
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
        }
    }

    render() {
        if (!this.individual?.qualityControl?.metrics?.[0]?.relatednessReport) {
            return html`<div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No QC data are available yet.</div>`;
        }

        return html`
            <div>
                <div class="btn-group pull-right">
                    <button type="button" class="btn btn-default ripple btn-sm dropdown-toggle" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-download" aria-hidden="true" style="padding-right: 5px"></i> Download <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu btn-sm">
                        ${this._config.download && this._config.download.length ? this._config.download.map(item => html`
                                <li><a href="javascript:;" data-download-option="${item}" @click="${this.onDownload}">${item}</a></li>
                        `) : null}
                    </ul>
                </div>
                                
                ${this.renderTable()}
            </div>
        `;
    }

}

customElements.define("opencga-individual-relatedness-view", OpencgaIndividualRelatednessView);
