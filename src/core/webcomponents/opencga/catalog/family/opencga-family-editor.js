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
import "../individual/opencga-individual-browser.js";

export default class OpencgaFamilyEditor extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            id: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ofe-" + Utils.randomString(6) + "_";

        this._config = this.getDefaultConfig();
    }

    /*    static get observers() {
        return ['mainObserver(id, opencgaSession, config)'];
    }*/

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("id") || changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this.mainObserver();
        }

    }

    mainObserver(id, opencgaSession, config) {
        this.study = opencgaSession.study.fqn;
        this.opencgaClient = opencgaSession.opencgaClient;

        this.selectedIndividuals = [];
        this.phenotypes = [];

        this.individualBrowserConfig = {
            title: "Individual Browser",
            showTitle: true,
            showAggregationStats: false,
            showComparator: false,
            filter: {

            },
            grid: {
                pageSize: 10,
                pageList: [10, 25, 50],
                detailView: false,
                multiSelection: false
            },
            variableSetIds: []
        };
    }

    configObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
    }

    showIndividualSelector(e) {
        e.preventDefault();
        this.individualModal = UtilsNew.isUndefined(this.individualModal) ? true : !this.individualModal;
        $("#" + this._prefix + "IndividualBrowser").modal("show");
    }


    autocompleteIndividuals(e) {
        const individualId = PolymerUtils.getElementById(`${this._prefix}-individual-input`).value;
        if (UtilsNew.isNotUndefinedOrNull(individualId) && individualId.length >= 3) {
            const _this = this;
            const params = {
                id: `~^${individualId}`,
                study: this.study,
                limit: 10,
                skipCount: true,
                include: "id"
            };
            _this.opencgaClient.individuals().search(params, {})
                .then(function(response) {
                    let options = "";
                    for (const id of response.response[0].result) {
                        options += `<option value="${id.id}">`;
                    }
                    PolymerUtils.innerHTML(_this._prefix + "IndividualDatalist", options);
                });
        }
    }

    addIndividual(e) {
        const individualId = PolymerUtils.getElementById(`${this._prefix}-individual-input`).value;
        if (UtilsNew.isNotEmpty(individualId)) {
            const _this = this;
            const params = {
                study: this.study
            };
            _this.opencgaClient.individuals().info(individualId, params, {})
                .then(function(response) {
                    const individual = response.response[0].result[0];
                    _this._addIndividualToSelectedArray(individual);
                    _this.computePhenotypes();
                    // if (UtilsNew.isNotUndefinedOrNull(individual.father)) {
                    //     _this.selectedIndividuals.push(_this._parseIndividual(individual.father));
                    // }
                    // if (UtilsNew.isNotUndefinedOrNull(individual.mother)) {
                    //     _this.selectedIndividuals.push(_this._parseIndividual(individual.mother));
                    // }
                })
                .catch(function(response) {
                    NotificationUtils.showNotify(response.error, "ERROR");
                });
        } else {
            NotificationUtils.showNotify("Please start typing an individual id", "WARNING");
        }
    }

    removeSelectedIndividual(e) {
        const selectedIndividuals = [];
        for (let i = 0; i < this.selectedIndividuals.length; i++) {
            if (this.selectedIndividuals[i].id !== e.currentTarget.dataId) {
                selectedIndividuals.push(this.selectedIndividuals[i]);
            }
        }
        this.set("selectedIndividuals", selectedIndividuals);
        this.computePhenotypes();
    }

    computePhenotypes() {
        const phenotypes = new Set();
        for (let i = 0; i < this.selectedIndividuals.length; i++) {
            if (UtilsNew.isNotUndefinedOrNull(this.selectedIndividuals[i].member.phenotypes)) {
                for (let j = 0; j < this.selectedIndividuals[i].member.phenotypes.length; j++) {
                    phenotypes.add(this.selectedIndividuals[i].member.phenotypes[j].id);
                }
            }
        }

        this.set("phenotypes", Array.from(phenotypes));
    }

    _addIndividualToSelectedArray(individual) {
        for (let i = 0; i < this.selectedIndividuals.length; i++) {
            if (this.selectedIndividuals[i].id === individual.id) {
                NotificationUtils.showNotify(`Individual ${individual.id} already added`, "WARNING");
                // The individual was already added
                return;
            }
        }

        this.push("selectedIndividuals", {
            id: individual.id,
            sex: individual.sex,
            father: (UtilsNew.isNotEmpty(individual.father) && UtilsNew.isNotEmpty(individual.father.id)) ? individual.father.id : "-",
            mother: (UtilsNew.isNotEmpty(individual.mother) && UtilsNew.isNotEmpty(individual.mother.id)) ? individual.mother.id : "-",
            affectationStatus: (UtilsNew.isNotEmpty(individual.affectationStatus)) ? individual.affectationStatus : "-",
            lifeStatus: (UtilsNew.isNotEmpty(individual.lifeStatus)) ? individual.lifeStatus : "-",
            dateOfBirth: UtilsNew.isNotEmpty(individual.dateOfBirth) ? moment(individual.dateOfBirth, "YYYYMMDD").format("YYYY") : "-",
            creationDate: moment(individual.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY"),
            status: individual.status.name,
            member: individual
        });
    }

    createFamily(e) {
        const params = this.obtainAllFamilyParameters();
        if (UtilsNew.isNotUndefinedOrNull(params)) {
            const _this = this;
            this.opencgaClient.families().create({study: this.study}, params)
                .then(function(response) {
                    _this.resetFields();
                    NotificationUtils.showNotify(`Family ${response.response[0].result[0].id} created successfully`, "SUCCESS");
                })
                .catch(function(response) {
                    console.error(response);
                    NotificationUtils.showNotify(response.error, "ERROR");
                });
        }
    }

    resetFields() {
        PolymerUtils.setValue(`${this._prefix}-id-input`, "");
        PolymerUtils.setValue(`${this._prefix}-description-input`, "");
        this.selectedIndividuals = [];
        this.phenotypes = [];
    }

    obtainAllFamilyParameters(params) {
        const missingFields = [];

        const id = PolymerUtils.getValue(`${this._prefix}-id-input`);
        if (UtilsNew.isEmpty(id)) {
            missingFields.push("id");
        }

        const description = PolymerUtils.getValue(`${this._prefix}-description-input`);
        if (UtilsNew.isEmpty(description)) {
            missingFields.push("description");
        }

        const members = [];
        if (UtilsNew.isEmptyArray(this.selectedIndividuals)) {
            missingFields.push("members");
        } else {
            for (let i = 0; i < this.selectedIndividuals.length; i++) {
                members.push({id: this.selectedIndividuals[i].id});
            }
        }

        if (UtilsNew.isNotEmptyArray(missingFields)) {
            NotificationUtils.showNotify("Missing " + missingFields.join(", ") + " fields", "ERROR");
            return null;
        }

        return {
            id: id,
            description: description,
            members: members,
            phenotypes: this.phenotypes
        };
    }

    getDefaultConfig() {
        return {
            title: "Family Editor",
            showTitle: true,
            showAggregationStats: true,
            showComparator: true,
            filter: {

            },
            grid: {
                pageSize: 10,
                pageList: [10, 25, 50],
                detailView: false,
                multiSelection: false
            },
            gridComparator: {
                pageSize: 5,
                pageList: [5, 10],
                detailView: true,
                multiSelection: true
            }
        };
    }


    render() {
        return html`
        <style>
        </style>

        <div class="row">
            <div class="col-md-10 col-md-offset-1">

                <div class="browser-subsection">
                    <h3>Family Info</h3>
                </div>

                <div style="padding: 5px 0px;">

                    <div class="form-group">
                        <label for="${this._prefix}-id-input" class="col-2 col-form-label">ID</label>
                        <div class="col-10">
                            <input class="form-control" type="text" value="" id="${this._prefix}-id-input">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="${this._prefix}-description-input" class="col-2 col-form-label">Description</label>
                        <div class="col-10">
                            <input class="form-control" type="text" value="" id="${this._prefix}-description-input">
                        </div>
                    </div>

                </div>

                <div class="browser-subsection">
                    <h3>Members And Phenotypes</h3>
                </div>

                <form class="form-inline" style="padding-top: 10px;">
                    <div class="form-group">
                        Select Individual
                        <input style="margin: 0px 5px; width: 200px;" class="form-control" type="text" value=""
                               @keyup="${this.autocompleteIndividuals}" list="${this._prefix}IndividualDatalist"
                               placeholder="Type an individual id" id="${this._prefix}-individual-input">
                        <datalist id="${this._prefix}IndividualDatalist"></datalist>

                        <button type="button" class="btn btn-primary" @click="${this.addIndividual}">Add</button>
                        <span style="margin: 0px 10px;">
                            or
                            <button type="button" id="${this._prefix}-browseIndividual" class="btn btn-sm btn-primary"
                                    data-toggle="modal" data-placement="bottom" @click="${this.showIndividualSelector}"
                                    style="display: inline">Browse</button>
                        </span>
                    </div>
                </form>

                <div style="width: 90%; padding-top: 10px;">
                    <table class="table table-hover table-no-bordered">
                        <thead>
                        <tr class="table-header">
                            <th>ID</th>
                            <th>Sex</th>
                            <th>Father</th>
                            <th>Mother</th>
                            <th>Affectation Status</th>
                            <th>Life Status</th>
                            <th>Year of Birth</th>
                            <th>Creation Date</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${this.selectedIndividuals && this.selectedIndividuals.length ? this.selectedIndividuals.map(member => html`
                            <tr class="detail-view-row">
                                <td>${member.id}</td>
                                <td>${member.sex}</td>
                                <td>${member.father}</td>
                                <td>${member.mother}</td>
                                <td>${member.affectationStatus}</td>
                                <td>${member.lifeStatus}</td>
                                <td>${member.dateOfBirth}</td>
                                <td>${member.creationDate}</td>
                                <td>${member.status}</td>
                                <td>
                                    <button type="button" class="btn btn-xs btn-danger" data-id="${member.id}"
                                            @click="${this.removeSelectedIndividual}">
                                        <i class="fa fa-trash fa-lg"> </i>
                                        Remove
                                    </button>
                                </td>
                            </tr>

                        `) : null }
                        </tbody>
                    </table>
                </div>

                <div style="padding-top: 10px;">
                    Phenotypes:
                    ${this.phenotypes && this.phenotypes.length ? this.phenotypes.map(phenotype => html`
                        <span style="color: white; border-radius: 5px; padding: 4px; width: fit-content; display: inline-block;
                            margin: 2px 0px; background: #ffb42b; border: 1px solid orange">${phenotype}</span>
                    `) : null}
                </div>

                <div class="browser-subsection">
                    <h3>Relationship</h3>
                </div>

                <button type="button" class="btn btn-primary" @click="${this.createFamily}">Create Family</button>

            </div>
        </div>

        <div class="modal fade" id="${this._prefix}IndividualBrowser" tabindex="-1" role="dialog" aria-labelledby="individualBrowserLabel">
            <div class="modal-dialog modal-lg" role="document" style="width: 90%;">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="${this._prefix}IndividualBrowserLabel">Family Selector</h4>
                    </div>
                    <div class="modal-body" style="height: 780px">
                        <opencga-individual-browser .opencgaSession="${this.opencgaSession}"
                                                    .config="${this.individualBrowserConfig}">
                        </opencga-individual-browser>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${this.onIndividualSelected}">
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-family-editor", OpencgaFamilyEditor);
