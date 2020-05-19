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
import PolymerUtils from "../PolymerUtils.js";
import Pedigree from "../../visualisation/pedigree.js";
import "./opencga-clinical-analysis-browser.js";
import "../commons/view/data-view.js";
import "../pedigree-component.js";


export default class OpencgaClinicalAnalysisView extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            // title: {
            //     type: String,
            //     value: "Clinical Analysis Summary"
            // },
            // showTitle: {
            //     type: Boolean
            // },
            // showSummary: {
            //     type: Boolean,
            //     value: true,
            //     notify: true
            // },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ocav-" + UtilsNew.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")){
            this.clinicalAnalysisIdObserver();
        }
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("clinicalAnalysis") ||
            changedProperties.has("mode") ||
            changedProperties.has("config")) {
            this.propertyObserver();
        }
    }

    firstUpdated(_changedProperties) {

    }

    propertyObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);

        if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis)) {
            this._flags = (UtilsNew.isNotEmptyArray(this.clinicalAnalysis.flags)) ? this.clinicalAnalysis.flags.join(", ") : "-";
            this._assignee = (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.analyst) && UtilsNew.isNotEmpty(this.clinicalAnalysis.analyst.assignee)) ?
                this.clinicalAnalysis.analyst.assignee :
                "-";
            this._description = (UtilsNew.isNotEmpty(this.clinicalAnalysis.description)) ? this.clinicalAnalysis.description : "-";

            this._dueDate = moment(this.clinicalAnalysis.dueDate, "YYYYMMDDHHmmss").format("D MMM YY");
            this._creationDate = moment(this.clinicalAnalysis.creationDate, "YYYYMMDDHHmmss").format("D MMM YY");

            this._probandDisorders = "-";
            if (UtilsNew.isNotEmptyArray(this.clinicalAnalysis.proband.disorders)) {
                const disorders = [];
                for (const disorder of this.clinicalAnalysis.proband.disorders) {
                    disorders.push(disorder.name + " (" + disorder.id + ")");
                }
                this._probandDisorders = disorders.join(", ");
            }

            this._probandPhenotypes= "-";
            if (UtilsNew.isNotEmptyArray(this.clinicalAnalysis.proband.phenotypes)) {
                const phenotypes = [];
                for (const phenotype of this.clinicalAnalysis.proband.phenotypes) {
                    phenotypes.push(phenotype.name + " (" + phenotype.id + ")");
                }
                this._probandPhenotypes = phenotypes.join(", ");
            }

            this._probandFiles= "-";
            if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.files) && UtilsNew.isNotEmptyArray(this.clinicalAnalysis.proband.samples)) {
                const files = [];

                const probandFiles = this.clinicalAnalysis.files[this.clinicalAnalysis.proband.samples[0].id];
                if (UtilsNew.isNotEmptyArray(probandFiles)) {
                    for (const file of this.clinicalAnalysis.files[this.clinicalAnalysis.proband.samples[0].id]) {
                        files.push(file.name);
                    }
                }
                this._probandFiles = files.join(", ");
            }

            this._memberPhenotypes= [];
            if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.family) && UtilsNew.isNotEmptyArray(this.clinicalAnalysis.family.members)) {
                for (const member of this.clinicalAnalysis.family.members) {
                    const phenotypes = [];
                    for (const phenotype of member.phenotypes) {
                        phenotypes.push(phenotype.name + " (" + phenotype.id + ")");
                    }
                    this._memberPhenotypes.push(phenotypes.join(", "));
                    // PolymerUtils.setValue(this._prefix + member.id + "Cell", "bbb");
                }
            }
        }

        this.pedigreeRender();
    }
    /*
    _summaryOnClick() {
        if (this._summaryCollapsed) {
            $("#" + this._prefix + "SummaryCollapseIcon").removeClass("fa-plus-square-o").addClass("fa-minus-square-o");
            PolymerUtils.show(this._prefix + "ClinicalAnalysisViewPanel");
            PolymerUtils.show(this._prefix + "OtherPrioritisationsPanel");
        } else {
            $("#" + this._prefix + "SummaryCollapseIcon").removeClass("fa-minus-square-o").addClass("fa-plus-square-o");
            PolymerUtils.hide(this._prefix + "ClinicalAnalysisViewPanel");
            PolymerUtils.hide(this._prefix + "OtherPrioritisationsPanel");
        }
        this._summaryCollapsed = !this._summaryCollapsed;
    }
*/

    clinicalAnalysisIdObserver() {
        if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysisId)) {
            const params = {
                study: this.opencgaSession.study.fqn
            };
            const _this = this;
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, params)
                .then(function(response) {
                    _this.showSummary = false;
                    if (response.responses[0].numResults === 1) {
                        console.log("aysnc response", response.response[0].numResults)
                        _this.clinicalAnalysis = response.responses[0].results[0];
                        _this._dueDate = moment(_this.clinicalAnalysis.dueDate, "YYYYMMDDHHmmss").format("D MMM YY");
                        _this._creationDate = moment(_this.clinicalAnalysis.creationDate, "YYYYMMDDHHmmss").format("D MMM YY");
                        _this.showSummary = true;
                        //                                _this.title =  "Clinical Analysis Summary: " + _this.clinicalAnalysis.name;
                        _this.pedigreeRender();
                    }
                });
        }
    }


    pedigreeRender() {
        if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis) && UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.family)) {
            if (UtilsNew.isNotUndefined(this.svg) && PolymerUtils.getElementById(this._prefix + "PedigreeView").hasChildNodes()) {
                PolymerUtils.getElementById(this._prefix + "PedigreeView").removeChild(this.svg);
            }
            const family = Object.assign({}, this.clinicalAnalysis.family);
            const membersNew =[];

            if (UtilsNew.isNotEmpty(family.members)) {
                family.members.forEach(member => {
                    const newMember = Object.assign({}, member);
                    if (UtilsNew.isNotUndefinedOrNull(newMember.father)) {
                        const newFather = family.members.find(member => {
                            return member.id === newMember.father.id;
                        });
                        if (UtilsNew.isNotUndefinedOrNull(newFather)) {
                            newMember.father = newFather.id;
                        } else {
                            newMember.father = undefined;
                        }
                    }

                    if (UtilsNew.isNotUndefinedOrNull(newMember.mother)) {
                        const newMother = family.members.find(member => {
                            return member.id === newMember.mother.id;
                        });
                        if (UtilsNew.isNotUndefinedOrNull(newMother)) {
                            newMember.mother = newMother.id;
                        } else {
                            newMember.mother = undefined;
                        }
                    }
                    membersNew.push(newMember);
                });
                family.members = membersNew;
                // Render new Pedigree
                const querySelector = PolymerUtils.getElementById(this._prefix + "PedigreeView");
                const pedigree = new Pedigree(family, {selectShowSampleNames: true});
                this.svg = pedigree.pedigreeFromFamily(pedigree.pedigree, {
                    width: 640,
                    height: 240
                });

                if (UtilsNew.isNotUndefinedOrNull(querySelector)) {
                    querySelector.appendChild(this.svg);
                }
            }
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultVale: "-"
            },
            sections: [
                {
                    title: "Case Summary",
                    collapsed: false,
                    elements: [
                        {
                            name: "Analysis ID",
                            field: "id"
                        },
                        {
                            name: "Proband",
                            field: "proband.id"
                        },
                        {
                            name: "Disorder",
                            type: "complex",
                            display: {
                                template: "${disorder.name} (${disorder.id})"
                            }
                        },
                        {
                            name: "Analysis Type",
                            field: "type"
                        },
                        {
                            name: "Flags",
                            field: "flags",
                            type: "list",
                            display: {
                                separator: ", "
                            }
                        },
                        {
                            name: "Status",
                            field: "status.name"
                        },
                        {
                            name: "Priority",
                            field: "priority",
                            type: "custom",
                            display: {
                                render: field => html`<span class="${field}-priority">${field}</span>`
                            }
                        },
                        {
                            name: "Assigned To",
                            field: "analyst.assignee"
                        },
                        {
                            name: "Creation date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => html`${moment(field, "YYYYMMDDHHmmss").format("D MMM YY")}`
                            }
                        },
                        {
                            name: "Due date",
                            field: "dueDate",
                            type: "custom",
                            display: {
                                render: field => html`${moment(field, "YYYYMMDDHHmmss").format("D MMM YY")}`
                            }
                        },
                        {
                            name: "Description",
                            field: "description"
                        }
                    ]
                },
                {
                    title: "Proband",
                    elements: [
                        {
                            name: "Proband",
                            field: "proband.id"
                        },
                        {
                            name: "Sex (Karyotypic)",
                            type: "complex",
                            display: {
                                template: "${sex} (${karyotypicSex})",
                            }
                        },
                        {
                            name: "Date of Birth",
                            type: "complex",
                            display: {
                                template: "${proband.dateOfBirth} (${proband.lifeStatus})",
                            }
                        },
                        {
                            name: "Disorders",
                            field: "proband.disorders",
                            type: "list",
                            display: {
                                contentLayout: "bullets",
                                render: disorder => {
                                    let id = disorder.id;
                                    if (disorder.id.startsWith("OMIM:")) {
                                        id = html`<a href="https://omim.org/entry/${disorder.id.split(":")[1]}" target="_blank">${disorder.id}</a>`;
                                    }
                                    return html`${disorder.name} (${id})`
                                },
                                defaultValue: "N/A"
                            }
                        },
                        {
                            name: "Phenotypes",
                            field: "phenotypes",
                            type: "list",
                            display: {
                                contentLayout: "bullets",
                                render: phenotype => {
                                    let id = phenotype.id;
                                    if (phenotype.id.startsWith("HP:")) {
                                        id = html`<a href="https://hpo.jax.org/app/browse/term/${phenotype.id}" target="_blank">${phenotype.id}</a>`;
                                    }
                                    return html`${phenotype.name} (${id})`
                                },
                                defaultValue: "N/A"
                            }
                        },
                    ]
                },
                {
                    title: "Sample",
                    elements: [
                        {
                            name: "",
                            field: "proband.samples",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "ID", field: "id"
                                    },
                                    {
                                        name: "Files", field: ""
                                    },
                                    {
                                        name: "Collection Method", field: "collection.method"
                                    },
                                    {
                                        name: "Preparation Method", field: "processing.preparationMethod"
                                    },
                                    {
                                        name: "Somatic", field: "somatic"
                                    },
                                    {
                                        name: "Creation Date",
                                        field: "creationDate",
                                        type: "custom", // this is not needed. feels right though
                                        display: {
                                            render: field => html`${UtilsNew.dateFormatter(field)}`
                                        }
                                    },
                                    {
                                        name: "Status", field: "status.name"
                                    }
                                ],
                                defaultValue: "No sample found"
                            }
                        }
                    ]
                },
                {
                    title: "Family",
                    elements: [
                        {
                            name: "Family",
                            field: "family.id"
                        },
                        {
                            name: "Members",
                            field: "family.members",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "Individual ID", field: "id"
                                    },
                                    {
                                        name: "Sex", field: "sex"
                                    },
                                    {
                                        name: "Father", field: "father.id"
                                    },
                                    {
                                        name: "Mother", field: "mother.id"
                                    },
                                    {
                                        name: "Disorders", field: "disorders", display: {
                                            render: data => html`${data.map(d => d.name).join(", ")}`
                                        }
                                    },
                                    {
                                        name: "Phenotypes", field: "phenotypes", display: {
                                            render: data => html`${data.map(d => d.name).join(", ")}`
                                        }
                                    },
                                    {
                                        name: "Life Status", field: "lifeStatus"
                                    },
                                    {
                                        name: "Year of Birth", field: "dateOfBirth"
                                    },
                                    {
                                        name: "Creation Date",
                                        field: "creationDate",
                                        type: "custom",
                                        display: {
                                            render: field => html`${UtilsNew.dateFormatter(field)}`
                                        }
                                    },
                                    {
                                        name: "Status", field: "internal.status.name"
                                    }
                                ],
                                defaultValue: "No sample found"
                            }
                        }
                    ]
                },
                {
                    title: "Pedigree",
                    elements: [
                        {
                            name: "pedigree",
                            field: "family",
                            type: "json"
                        }
                    ]
                }
            ]
        }
    }

    render() {
        return html`
        <style include="jso-styles">
            .section-padding {
                padding: 10px 25px 5px 25px;
                /*padding-left: 25px;*/
                /*padding-right: 25px;*/
            }

            .hr-underline {
                margin: 1px 0px;
                border-top: 2px solid #eee;
            }

            .URGENT-priority {
                color: red;
            }

            .HIGH-priority {
                color: orange;
            }

            .MEDIUM-priority {
                color: blue;
            }

            .LOW-priority {
                color: green;
            }

            .form-section-title {
                padding: 5px 0px;
                width: 80%;
                border-bottom-width: 1px;
                border-bottom-style: solid;
                border-bottom-color: #ddd
                border-bottom-color: #ddd
            }

            .jso-label-title {
                width: 15em !important;
            }

            .pad-top-5 {
                padding-top: 5px !important;
            }

        </style>

        <data-view .data=${this.clinicalAnalysis} .config="${this._config}"></data-view>

        ${false ? html`
        <div class="container-fluid">
            <div class="row">
                ${this._config.showTitle ? html`
                    <div style="margin: 10px">
                            <span>
                                <!--<i id="${this._prefix}SummaryCollapseIcon" class="fa fa-minus-square-o" aria-hidden="true" on-click="_summaryOnClick" style="cursor: pointer"></i>-->
                                <h4 style="display: inline">&nbsp;${this.title}</h4>
                            </span>
                    </div>
                ` : null }
    
                ${this.clinicalAnalysis ? html`
                <div class="container">
                    <div id="${this._prefix}Summary" class="col-md-12 section-padding">
                        <!--<h3><span style="color: #8a6d3b;">{{clinicalAnalysis.id}}</span> - Analysis Summary</h3>-->
                        <!--<hr class="hr-underline">-->
        
                        <div>
                            <h4 class="form-section-title">Case Summary</h4>
                        </div>
        
                        <form class="form-horizontal" style="padding: 5px 10px">
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title">Analysis ID</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this.clinicalAnalysis.id}</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Proband</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this.clinicalAnalysis.proband.id}</span>
                                </div>
                            </div>
        
                            ${this.clinicalAnalysis.disorder ? html`
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title pad-top-5">Disorder</label>
                                    <div class="col-md-3 pad-top-5">
                                        <span>${this.clinicalAnalysis.disorder.name} (${this.clinicalAnalysis.disorder.id})</span>
                                    </div>
                                </div>` : null }
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Analysis Type</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this.clinicalAnalysis.type}</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Flags</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this._flags}</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Status</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this.clinicalAnalysis.status ? this.clinicalAnalysis.status.name : ""}</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Priority</label>
                                <div class="col-md-3 pad-top-5">
                                    <span class="${this.clinicalAnalysis.priority}-priority">${this.clinicalAnalysis.priority}</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Assigned To</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this._assignee}</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Creation Date</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this._creationDate}</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Due Date</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this._dueDate}</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Description</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this._description}</span>
                                </div>
                            </div>
                        </form>
                    </div>
    
                    <div id="${this._prefix}Proband" class="col-md-12 section-padding">
                        <div>
                            <h4 class="form-section-title">Proband</h4>
                        </div>
        
                        <form class="form-horizontal" style="padding: 10px 0px 0px 0px;">
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Proband</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this.clinicalAnalysis.proband.id}</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Sex (karyotype)</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this.clinicalAnalysis.proband.sex} &nbsp;&nbsp; (${this.clinicalAnalysis.proband.karyotypicSex})</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Date of Birth</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this.clinicalAnalysis.proband.dateOfBirth} &nbsp;&nbsp; (${this.clinicalAnalysis.proband.lifeStatus})</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Disorders</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this._probandDisorders}</span>
                                </div>
                            </div>
        
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title pad-top-5">Phenotypes</label>
                                <div class="col-md-3 pad-top-5">
                                    <span>${this._probandPhenotypes}</span>
                                </div>
                            </div>
        
                            <div class="form-group" style="padding-left: 25px; margin-bottom: 5px">
                                <!--<label class="col-md-12">Sample:</label>-->
                                <h4>Sample</h4>
                                <!--<label class="control-label col-md-1 jso-label-title pad-top-5">Sample</label>-->
                                <div class="col-md-12">
                                    <div style="width: 90%;padding-left: 10px">
                                        <table class="table">
                                            <thead>
                                            <tr class="table-header">
                                                <th>ID</th>
                                                <th>Files</th>
                                                <th>Collection Method</th>
                                                <th>Preparation Method</th>
                                                <th>Somatic</th>
                                                <th>Creation Date</th>
                                                <th>Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>${this.clinicalAnalysis.proband.samples?.[0].id}</td>
                                                <td>${this._probandFiles}</td>
                                                <td>${this.clinicalAnalysis.proband.samples?.[0]?.collection?.method}</td>
                                                <td>${this.clinicalAnalysis.proband.samples?.[0]?.processing?.preparationMethod}</td>
                                                <td>${this.clinicalAnalysis.proband.samples?.[0].somatic}</td>
                                                <td>${this.clinicalAnalysis.proband.samples?.[0].creationDate}</td>
                                                <td>${this.clinicalAnalysis.proband.samples?.[0]?.status?.name}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
    
                    <div id="${this._prefix}Family" class="col-md-12 section-padding">
                        <div>
                            <h4 class="form-section-title">Family</h4>
                        </div>
        
                        ${this.clinicalAnalysis.family && this.clinicalAnalysis.family.members ? html`
                        <form class="form-horizontal" style="padding: 10px 0px 0px 0px;">
        
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title pad-top-5">Family</label>
                                    <div class="col-md-3 pad-top-5">
                                        <span>${this.clinicalAnalysis.family.id}</span>
                                    </div>
                                </div>
        
                                <div class="form-group" style="padding-left: 25px; margin-bottom: 5px">
                                    <!--<label class="col-md-12">Members:</label>-->
                                    <h4>Members</h4>
                                    <div class="col-md-12">
                                        <div style="width: 90%;padding-left: 10px">
                                            <table class="table">
                                                <thead>
                                                <tr class="table-header">
                                                    <th>Individual ID</th>
                                                    <th>Sex</th>
                                                    <th>Father</th>
                                                    <th>Mother</th>
                                                    <th>Disorders</th>
                                                    <th>Phenotypes</th>
                                                    <th>Life Status</th>
                                                    <th>Year of Birth</th>
                                                    <th>Creation Date</th>
                                                    <th>Status</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                ${this.clinicalAnalysis.family && this.clinicalAnalysis.family.members ? this.clinicalAnalysis.family.members.map( member => html`
                                                    <tr>
                                                        <td>${member.id}</td>
                                                        <td>${member.sex}</td>
                                                        <td>${member.father.id}</td>
                                                        <td>${member.mother.id}</td>
                                                        <td>${member.disorders && member.disorders.length ? member.disorders[0].name : null }</td>
                                                        <td>${member.phenotypes && member.phenotypes.length ? member.phenotypes[0].name : null }</td>
                                                        <td>${member.lifeStatus}</td>
                                                        <td>${member.dateOfBirth}</td>
                                                        <td>${member.creationDate}</td>
                                                        <td>${member.internal.status.name}</td>
                                                    </tr>
                                                `) : null }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
        
                                <div class="form-group" style="margin: 0px 2px">
                                    <label class="col-md-12">Pedigree:</label>
                                    <div class="col-md-11 col-md-offset-1">
                                        <div id="${this._prefix}PedigreeView"></div>
                                    </div>
                                </div>
                            </form>
                        ` : null}
                    </div>
                </div>
            </div>
        </div>
        ` : null }
        `: null }
        `;
    }

}

customElements.define("opencga-clinical-analysis-view", OpencgaClinicalAnalysisView);
