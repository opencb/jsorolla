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
import Utils from "./../../../utils.js";
import UtilsNew from "./../../../utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";
import CatalogUIUtils from "../commons/CatalogUIUtils.js";
import "../catalog/individual/opencga-individual-browser.js";
import "../catalog/family/opencga-family-editor.js";
import "../catalog/family/opencga-family-browser.js";

// TODO recheck functionality
//TODO CHECK on-dom-change="renderDomRepeat"

export default class OpencgaClinicalAnalysisEditor extends LitElement {

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
            mode: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ocab-" + Utils.randomString(6) + "_";

        this._config = this.getDefaultConfig();
        this._individuals = [];
        this._disorders = [];
        this.isCreate = false;
        this.notifyEnabled = true;

        this.catalogUiUtils = new CatalogUIUtils();

        this.createButtonStatus = "disabled";

        this.familyBrowserConfig = {
            title: "Family Browser",
            showTitle: true,
            showAggregationStats: false,
            showComparator: false,
            filter: {

            },
            grid: {
                pageSize: 5,
                pageList: [5, 10],
                detailView: false,
                multiSelection: false
            },
            variableSetIds: []
        };

        this.individualBrowserConfig = {
            title: "Individual Browser",
            showTitle: true,
            showAggregationStats: false,
            showComparator: false,
            filter: {

            },
            grid: {
                pageSize: 5,
                pageList: [5, 10],
                detailView: false,
                multiSelection: false
            },
            variableSetIds: []
        };
        this.mode = "create";
        this._clinicalAnalysis = {}; // FIXME quick fix needs a proper check
        //console.log("this._config",this._config)
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("clinicalAnalysis") ||
            changedProperties.has("mode") ||
            changedProperties.has("config")) {
            this.propertyObserver();
        }
    }

    firstUpdated(_changedProperties) {

        $("#" + this._prefix + "DuePickerDate").datetimepicker({
            format: "DD/MM/YYYY"
            // minDate: moment().add(1, "days"),
            // date: moment().add(1, "months")
        });

        $("select.selectpicker". this).selectpicker("render");

        // Render default values when clinicalAnalysis property is not set
        if (UtilsNew.isUndefinedOrNull(this.clinicalAnalysis)) {
            this._clinicalAnalysis = this.getDefaultClinicalAnalysis();
        } else {
            // Merge default and passed clinical analysis, then notify.
            // let defaultClinicalAnalysis = this.getDefaultClinicalAnalysis();
            // this._clinicalAnalysis = Object.assign(defaultClinicalAnalysis, this.clinicalAnalysis);
            this._clinicalAnalysis = this.clinicalAnalysis;
            // this.notifyClinicalAnalysis();
        }
        this.fillForm(this._clinicalAnalysis);

        this._updateCreateButtonStatus();

        // Render empty table
        // this.renderTable();
    }

    getDefaultClinicalAnalysis() {
        return {
            type: "FAMILY",
            priority: "MEDIUM",
            analyst: {
                assignee: this.opencgaSession.user.id
            },
            dueDate: moment().add(7, "days").format("DD/MM/YYYY")
        };
    }
    // TODO recheck functionality
    propertyObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);

        //console.log("this._config",this._config)
        // Set a private variable with all the users in this study: owner + @members group.
        // By default, the user creating the Case is selected as default
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study) &&
            UtilsNew.isNotEmptyArray(this.opencgaSession.study.groups)) {
            // let _studyUsers = [opencgaSession.user.id];
            for (const group of this.opencgaSession.study.groups) {
                if (group.id === "@members" || group.name === "@members") {
                    this._studyUsers = group.userIds;
                }
            }
        }

        if (UtilsNew.isNotUndefinedOrNull(this.mode)) {
            this.isCreate = this.mode.toLowerCase() === "create";
        }


        if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis)) {
            // Merge default and passed clinical analysis, then notify.
            // let defaultClinicalAnalysis = this.getDefaultClinicalAnalysis();
            // this._clinicalAnalysis = Object.assign(defaultClinicalAnalysis, clinicalAnalysis);
            this._clinicalAnalysis = this.clinicalAnalysis;
            this.fillForm(this._clinicalAnalysis);
            // this.notifyClinicalAnalysis();
        }

        //this.renderTable();
        //this.requestUpdate();
    }

    onSelectChange(e) {
        const field = e.currentTarget.dataset.field;
        const fieldCapital = field.charAt(0).toUpperCase() + field.slice(1);

        const select = PolymerUtils.getElementById(this._prefix + fieldCapital);
        if (UtilsNew.isNotUndefinedOrNull(select) && UtilsNew.isNotEmpty(select.value)) {
            const selected = PolymerUtils.querySelectorAll("option:checked", select);
            const values = [];

            selected.forEach(option => values.push(option.value));
            if (e.currentTarget.dataset.fieldType === "string") {
                this._clinicalAnalysis[field] = values.join(",");
            } else if (e.currentTarget.dataset.fieldType === "array") {
                this._clinicalAnalysis[field] = values;
            } else {
                // Get the first element of values which contains the Disorder 'object' we want
                this._clinicalAnalysis[field] = JSON.parse(selected[0].dataset.value);
            }

            this._clinicalAnalysis = Object.assign({}, this._clinicalAnalysis);
            this.notifyClinicalAnalysis();
        }
    }

    onInputChange(e) {
        const field = e.currentTarget.dataset.field;
        const fieldCapital = field.charAt(0).toUpperCase() + field.slice(1);

        const text = PolymerUtils.getElementById(this._prefix + fieldCapital);
        if (UtilsNew.isNotUndefinedOrNull(text)) { // && UtilsNew.isNotEmpty(text.value)
            this._clinicalAnalysis[field] = text.value;

            this._clinicalAnalysis = Object.assign({}, this._clinicalAnalysis);
            this.notifyClinicalAnalysis();

            this._updateCreateButtonStatus();
        }
    }

    //TODO move in template
    _updateCreateButtonStatus() {
        if (UtilsNew.isNotEmpty(this._clinicalAnalysis.id) && UtilsNew.isNotUndefinedOrNull(this._clinicalAnalysis.proband)) {
            PolymerUtils.getElementById(`${this._prefix}Ok`).disabled = false;
        } else {
            PolymerUtils.getElementById(`${this._prefix}Ok`).disabled = true;
        }
        this.requestUpdate();
    }

    fillForm(clinicalAnalysis) {
        if (UtilsNew.isUndefinedOrNull(clinicalAnalysis)) {
            console.log("'clinicalAnalysis' is undefined or null");
            return;
        }

        this.notifyEnabled = false;

        // We must first clear the form
        this.clear();

        // Calculate some internal data and render the sample table
        this._individuals = this.getIndividualsFromClinicalAnalysis(clinicalAnalysis);
        this._disorders = this.getDisordersFromIndividuals(this._individuals);
        this.renderTable();

        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.id)) {
            PolymerUtils.setValue(this._prefix + "Id", clinicalAnalysis.id);
        }

        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.type)) {
            $("#" + this._prefix + "Type").selectpicker("val", clinicalAnalysis.type);
        }

        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.assigned)) {
            $("#" + this._prefix + "Assigned").selectpicker("val", clinicalAnalysis.analyst.assignee);
        }

        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.priority)) {
            $("#" + this._prefix + "Priority").selectpicker("val", clinicalAnalysis.priority);
        }

        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.dueDate)) {
            PolymerUtils.setValue(this._prefix + "DueDate", clinicalAnalysis.dueDate);
        }

        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.flags)) {
            $("#" + this._prefix + "Flags").selectpicker("val", clinicalAnalysis.flags);
        }

        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.description)) {
            PolymerUtils.setValue(this._prefix + "Description", clinicalAnalysis.description);
        }

        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.disorder)) {
            $("#" + this._prefix + "Disorder").selectpicker("val", clinicalAnalysis.disorder.id);
        }

        this.notifyEnabled = true;
    }

    clear() {
        // Empty everything before rendering
        $("." + this._prefix + "Input").val("");
        $("." + this._prefix + "Input").prop("disabled", false);

        // Deselect bootstrap-select dropdowns
        $("#" + this._prefix + "Type").selectpicker("val", []);
        $("#" + this._prefix + "Assigned").selectpicker("val", []);
        $("#" + this._prefix + "Priority").selectpicker("val", []);
        $("#" + this._prefix + "Flags").selectpicker("val", []);
        $("#" + this._prefix + "Disorder").selectpicker("val", []);
    }

    notifyClinicalAnalysis() {
        // debugger
        if (this.notifyEnabled) {
            this.dispatchEvent(new CustomEvent("clinicalanalysischange", {
                detail: {
                    clinicalAnalysis: this._clinicalAnalysis
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    onIndividualSelect(e) {
        const individuals = [e.detail.individual];
        this._clinicalAnalysis.family = undefined;
        this.updateIndividual(individuals);
    }

    onFamilySelect(e) {
        this._clinicalAnalysis.family = e.detail.family;

        const individualIds = [];
        for (const individual of e.detail.family.members) {
            individualIds.push(individual.id);
        }

        const _this = this;
        this.opencgaSession.opencgaClient.individuals().search({
            id: individualIds.join(","),
            study: this.opencgaSession.study.fqn
        }).then(function(response) {
            _this._clinicalAnalysis.family.members = response.response[0].result;
            _this.updateIndividual(response.response[0].result);
        }
        );
    }

    updateIndividual(individuals) {
        this._clinicalAnalysis.files = {};
        // this._individuals = individuals;

        // Set the proband when there is just one individual
        console.warn("commented line for proband undefined (the case of one individual)")
        //this._clinicalAnalysis.proband = undefined;


        // FIXME add this comparison
        // && individuals.length === 1
        // if (UtilsNew.isNotEmptyArray(individuals) ) {
        //     this._clinicalAnalysis.proband = individuals[0];
        // }

        const sampleIds = [];
        for (const individual of individuals) {
            for (const sample of individual.samples) {
                sampleIds.push(sample.id);
            }
        }

        // This triggers the render of Disorder dropdown
        const disorders = this.getDisordersFromIndividuals(individuals);
        this._disorders = disorders;
        if (UtilsNew.isNotEmptyArray(disorders) && disorders.length === 1) {
            this._clinicalAnalysis.disorder = disorders[0];
        }

        if (UtilsNew.isNotEmptyArray(sampleIds)) {
            const promises = [];
            for (const sampleId of sampleIds) {
                // We look for the files related to the samples
                promises.push(this.opencgaSession.opencgaClient.files().search({
                    samples: sampleId,
                    format: "BAM,VCF,BIGWIG",
                    study: this.opencgaSession.study.fqn,
                    exclude: "samples"
                    // include: "id,name,format,bioformat,size"
                }).then(function(response) {
                    return {
                        sampleId: sampleId,
                        files: response.response[0].result
                    };
                }));
            }

            const files = {};
            Promise.all(promises).then(values => {
                for (const value of values) {
                    files[value.sampleId] = value.files;
                }
                this._clinicalAnalysis.files = files;

                this.fillForm(this._clinicalAnalysis);
                this.requestUpdate();
                this.notifyClinicalAnalysis();
            });
        } else {
            this.fillForm(this._clinicalAnalysis);
            this.notifyClinicalAnalysis();
        }
    }

    showIndividualSelector(e) {
        e.preventDefault();
        this.individualModal = UtilsNew.isUndefined(this.individualModal) ? true : !this.individualModal;
        $("#" + this._prefix + "IndividualBrowser").modal("show");
    }

    showFamilySelector(e) {
        e.preventDefault();
        this.familyModal = UtilsNew.isUndefined(this.familyModal) ? true : !this.familyModal;
        $("#" + this._prefix + "FamilyBrowser").modal("show");
    }

    showFamilyCreator(e) {
        e.preventDefault();
        this.createFamily = true;
        // this.familyModal = UtilsNew.isUndefined(this.familyModal) ? true : !this.familyModal;
        // $("#" + this._prefix + "FamilyBrowser").modal('show');
    }

    getIndividualsFromClinicalAnalysis(clinicalAnalysis) {
        let individuals = [];
        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis)) {
            if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.family)) {
                individuals = clinicalAnalysis.family.members;
            } else {
                if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.proband)) {
                    individuals = [clinicalAnalysis.proband];
                }
            }
        }
        return individuals;
    }

    getDisordersFromIndividuals(individuals) {
        const disorders = [];
        if (UtilsNew.isNotEmptyArray(individuals)) {
            for (const individual of individuals) {
                if (UtilsNew.isNotEmptyArray(individual.disorders)) {
                    for (const disorder of individual.disorders) {
                        // disorders array does not contain the element we're looking for
                        if (disorders.filter(e => e.id === disorder.id).length === 0) {
                            disorders.push(disorder);
                        }
                    }
                }
            }
        }
        return disorders;
    }

    isFamilyAnalysis(type) {
        if (type === "single" || type === "multiple" || type === "somatic") {
            return false;
        }
        return true;
    }

    renderDomRepeat(e) {
        $("select.selectpicker", this).selectpicker("refresh");
    }

    onClear() {
        this.clear();

        this._individuals = [];
        this._disorders = [];

        this._clinicalAnalysis = this.getDefaultClinicalAnalysis();
        this.fillForm(this._clinicalAnalysis);
        this.renderTable();
        this.notifyClinicalAnalysis();
    }

    onCreate() {
        const _clinicalAnalysis = Object.assign({}, this._clinicalAnalysis);
        _clinicalAnalysis.proband = {
            id: _clinicalAnalysis.proband.id,
            samples: [
                {
                    id: _clinicalAnalysis.proband.samples[0].id
                }
            ]
        };

        _clinicalAnalysis.analyst = {assignee: _clinicalAnalysis.analyst.assignee};
        // delete _clinicalAnalysis.assigned;

        if (UtilsNew.isNotUndefinedOrNull(_clinicalAnalysis.family)) {
            const _family = {
                id: _clinicalAnalysis.family.id,
                members: []
            };
            for (const member of _clinicalAnalysis.family.members) {
                _family.members.push({
                    id: member.id,
                    samples: [
                        {
                            id: member.samples[0].id
                        }
                    ]
                });
            }
            _clinicalAnalysis.family = _family;
        }

        if (UtilsNew.isNotUndefinedOrNull(_clinicalAnalysis.files)) {
            const _files = {};
            for (const sampleId in _clinicalAnalysis.files) {
                const fileIds = [];
                for (const file of _clinicalAnalysis.files[sampleId]) {
                    fileIds.push(file.id);
                }
                _files[sampleId] = fileIds;
            }
            _clinicalAnalysis.files = _files;
        }

        if (UtilsNew.isNotUndefinedOrNull(_clinicalAnalysis.dueDate)) {
            const dueDate = moment(_clinicalAnalysis.dueDate, "DD/MM/YYYY").format("YYYYMMDDHHMMSS");
            _clinicalAnalysis.dueDate = dueDate;
        }

        const _this = this;
        this.opencgaSession.opencgaClient.clinical().create({study: this.opencgaSession.study.fqn}, _clinicalAnalysis)
            .then(function(response) {
                _this.onClear();
                NotificationUtils.showNotify(`Family ${response.response[0].result[0].id} created successfully`, "SUCCESS");
            })
            .catch(function(response) {
                console.error(response);
                NotificationUtils.showNotify(response.error, "ERROR");
            });
    }

    /*
     * TABLE AND FORMATTERS
     */

    renderTable() {
        const columns = this._initTableColumns();

        console.log("columns",columns)
        const _this = this;

        console.log("_this._individuals",_this._individuals)

        $("#" + this._prefix + "IndividualBrowserGrid").bootstrapTable("destroy");
        $("#" + this._prefix + "IndividualBrowserGrid").bootstrapTable({
            columns: columns,
            data: _this._individuals,

            // Table properties
            pagination: _this._config.grid.pagination,
            // showExport: _this._config.grid.showExport,
            detailView: _this._config.grid.detailView,
            detailFormatter: _this._config.grid.detailFormatter,

            // Make Polymer components available to table formatters
            gridContext: _this,

            onPostBody: function(data) {
                $(".selectpicker", this).selectpicker("refresh");

                /**
                 *  returning a lit-html element in a formatter cause the print of [object Object].
                 *  the flowwing listerners are necessary as temp solution.
                 *  TODO find a better way to make bootstrap-table formatters and lit-html works together.
                 */

                const removeIndividualButtons = PolymerUtils.querySelectorAll(".removeIndividualButton");
                for (let i = 0; i < removeIndividualButtons.length; i++) {
                    removeIndividualButtons[i].addEventListener("click", _this.removeIndividualButtonClicked.bind(_this));
                }

                const probandRadio = PolymerUtils.querySelectorAll(".probandRadio");
                for (let i = 0; i < probandRadio.length; i++) {
                    probandRadio[i].addEventListener("click", _this.aaa.bind(_this));
                    // removeIndividualButtons[i].addEventListener('change', _this.aaa.bind(_this));
                }
                // Add tooltips
                _this.catalogUiUtils.addTooltip("div.phenotypesTooltip", "Phenotypes");
            }
        });
    }

    removeIndividualButtonClicked(e) {
        const individuals = [];
        for (let i = 0; i < this._individuals.length; i++) {
            if (this._individuals[i].id !== e.target.dataset.id) {
                individuals.push(this._individuals[i]);
            }
        }

        this._individuals = individuals;
        // Reload data of the table
        $("#" + this._prefix + "IndividualBrowserGrid").bootstrapTable("load", this._individuals);

        if (this._individuals.length === 0 && !this.isFamilyAnalysis(this._clinicalAnalysis.type)) {
            // Re-enable disabled buttons
            PolymerUtils.getElementById(`${this._prefix}-browseIndividual`).disabled = false;

            const buttons = PolymerUtils.getElementsByClassName(`${this._prefix}-type`);
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].disabled = false;
            }
        }

        this._clinicalAnalysis.family.members = this._individuals;
        delete this._clinicalAnalysis.files[e.target.dataset.id];

        this.notifyClinicalAnalysis(this._clinicalAnalysis);
    }

    detailFormatter(index, row) {
        // let result = `<div class='row' style="padding: 5px 10px 15px 10px">
        //                 <div class='col-md-12'>
        //                     <h5 style="font-weight: bold">Samples</h5>
        // `;
        //
        // if (UtilsNew.isNotEmptyArray(row.samples)) {
        //     if (row.samples.length === 1) {
        //         result += ""
        //     } else {
        //
        //     }
        // }

    }

    individualFormatter(value, row) {
        if (UtilsNew.isNotUndefinedOrNull(value) && UtilsNew.isNotUndefinedOrNull(row)) {
            const sampleIcon = this._config.sexIconMap[row.sex];
            let sampleIdStyle = "color: black";
            if (UtilsNew.isNotEmptyArray(row.disorders)) {
                for (const disorder of row.disorders) {
                    if (disorder.id === this._clinicalAnalysis.disorder.id) {
                        sampleIdStyle = "color: red";
                        break;
                    }
                }
            }
            return `<div>
                            <span data-toggle="tooltip" data-placement="bottom" style="${sampleIdStyle}" title="" >
                            ${value} <i class='fa ${sampleIcon} fa-lg' style='padding-left: 5px'></i>
                            </span>
                        </div>`;
        } else {
            return `-`;
        }
    }

    samplesFormatter(value, row) {

        if (UtilsNew.isNotEmptyArray(row.samples)) {
            // for (let sample of row.samples) {
            //     samples += `<div>${sample.id}</div>`;
            // }
            return `<span>${row.samples[0].id}</span>`
        } else {
            return `-`;
        }
    }

    probandFormatter(value, row) {
        return `<input type="radio" name="${this._prefix}-optradio" class="probandRadio" data-individual-id="${row.id}" @click="${this.aaa}">`;
    }

    //TODO change name
    aaa(e) {
        console.warn("change function name")
        const individualId = e.currentTarget.dataset.individualId;
        if (UtilsNew.isNotUndefinedOrNull(this._clinicalAnalysis.family) &&
            UtilsNew.isNotEmptyArray(this._clinicalAnalysis.family.members)) {
            for (const member of this._clinicalAnalysis.family.members) {
                if (member.id === individualId) {
                    this._clinicalAnalysis.proband = member;
                }
            }
            this.notifyClinicalAnalysis(this._clinicalAnalysis);
        }
        this._updateCreateButtonStatus();
    }

    disordersFormatter(value, row) {
        if (UtilsNew.isNotEmpty(value)) {
            let disordersHtml = "<div>";
            for (const disorder of value) {
                disordersHtml += `<span>${disorder.id}</span>`;
            }
            disordersHtml += "</div>";
            return disordersHtml;
        } else {
            return "-";
        }
    }

    phenotypesFormatter(value, row) {
        if (UtilsNew.isNotEmptyArray(value)) {
            let phenotypeTooltipText = "";
            for (const phenotype of value) {
                phenotypeTooltipText += "<div style=\"padding: 5px\">";
                if (UtilsNew.isNotUndefinedOrNull(phenotype.source) && phenotype.source.toUpperCase() === "HPO") {
                    phenotypeTooltipText += `<span><a target="_blank" href="https://hpo.jax.org/app/browse/term/${phenotype.id}">${phenotype.id} </a>(${phenotype.status})</span>`;
                } else {
                    phenotypeTooltipText += `<span>${phenotype.id} (${phenotype.status})</span>`;
                }
                phenotypeTooltipText += "</div>";
            }

            const html = `<div class="phenotypesTooltip" data-tooltip-text='${phenotypeTooltipText}'>
                                    <a style="cursor: pointer">
                                        ${value.length} terms found
                                    </a>
                           </div>
                    `;
            return html;
        } else {
            return "-";
        }
    }

    filesFormatter(value, row) {
        if (UtilsNew.isNotUndefinedOrNull(this._clinicalAnalysis.files)) {
            let html = "<div>";
            if (UtilsNew.isNotEmptyArray(row.samples)) {
                const files = this._clinicalAnalysis.files[row.samples[0].id];
                if (UtilsNew.isNotEmptyArray(files)) {
                    for (const file of files) {
                        html += `<div>${file.name}</div>`;
                    }
                }
            }
            html += "</div>";
            return html;
        }
    }

    //not used, not converted in litElement
/*    flagsFormatter(value, row) {
        const html = `<select class="selectpicker" data-id=${row.id}  data-width="100%" on-change="updateQuery"
                                    on-dom-change="renderDomRepeat" multiple data-selected-text-format="count > 1">
                                <template is="dom-repeat" items="${this._config.flags}">
                                    <option value="{{item}}">{{item}}</option>
                                </template>
                            </select>`;
        return html;
    }*/

    removeButtonFormatter(value, row) {
        return `<button data-id=${row.id} class='btn btn-sm btn-danger removeIndividualButton' @click="${this.removeIndividualButtonClicked}">
                        <i class="fa fa-trash" aria-hidden="true"></i> Remove</button>`;
    }

    _initTableColumns() {
        return [
            [
                {
                    title: "Individual",
                    field: "id",
                    formatter: this.individualFormatter.bind(this),
                    halign: this._config.grid.header.horizontalAlign
                },
                {
                    title: "Sample",
                    field: "samples",
                    formatter: this.samplesFormatter.bind(this),
                    halign: this._config.grid.header.horizontalAlign
                },
                {
                    title: "Proband",
                    formatter: this.probandFormatter.bind(this),
                    align: this._config.grid.header.horizontalAlign,
                    halign: this._config.grid.header.horizontalAlign
                },
                {
                    title: "Father",
                    field: "father.id",
                    halign: this._config.grid.header.horizontalAlign
                },
                {
                    title: "Mother",
                    field: "mother.id",
                    halign: this._config.grid.header.horizontalAlign
                },
                {
                    title: "Disorders",
                    field: "disorders",
                    formatter: this.disordersFormatter,
                    halign: this._config.grid.header.horizontalAlign
                },
                {
                    title: "Phenotypes",
                    field: "phenotypes",
                    formatter: this.phenotypesFormatter,
                    halign: this._config.grid.header.horizontalAlign
                },
                {
                    title: "Files",
                    field: "files",
                    formatter: this.filesFormatter.bind(this),
                    halign: this._config.grid.header.horizontalAlign
                },
                // {
                //     title: 'Flags',
                //     field: 'flags',
                //     // rowspan: 2,
                //     formatter: this.flagsFormatter.bind(this),
                //     align: this._config.grid.header.horizontalAlign
                // },
                {
                    title: "Remove",
                    field: "id",
                    formatter: this.removeButtonFormatter,
                    align: this._config.grid.header.horizontalAlign,
                    halign: this._config.grid.header.horizontalAlign
                }
            ], []
        ];
    }

    getDefaultConfig() {
        return {
            title: "Create Case",
            showTitle: true,
            grid: {
                pagination: false,
                // showExport: false,
                detailView: true,
                detailFormatter: this.detailFormatter,
                // multiSelection: false,
                header: {
                    horizontalAlign: "center",
                    verticalAlign: "bottom"
                }
            },
            flags: ["mixed_chemistries", "low_tumour_purity", "uniparental_isodisomy", "uniparental_heterodisomy",
                "unusual_karyotype", "suspected_mosaicism", "low_quality_sample"],
            sexIconMap: {
                MALE: "fa-mars",
                FEMALE: "fa-venus",
                UNKNOWN: "fa-genderless"
            }
        };
    }


    render() {
        return html`
        <style>
            .form-section-title {
                padding: 5px 0px;
                width: 80%;
                border-bottom-width: 1px;
                border-bottom-style: solid;
                border-bottom-color: #ddd
            }

            .jso-label-title {
                width: 15em !important;
            }
        </style>

        <div class="container-fluid">
                <div class="row">
                    <div class="col-md-12">
        
                        <!--<div>-->
                            <!--<h2 style="margin-top: 10px"></i> {{_config.title}}</h2>-->
                        <!--</div>-->
        
                        <div style="padding: 10px 10px;">
                            <div>
                                <h4 class="form-section-title">Case Information</h4>
                            </div>
        
                            <div class="form-horizontal" style="padding: 5px 10px">
        
                                <div class="form-group" style="padding-top: 10px">
                                    <label class="control-label col-md-1 jso-label-title">Analysis ID</label>
                                    <div class="col-md-3">
                                        ${this.isCreate ? html`
                                            <input type="text" id="${this._prefix}Id" class="${this._prefix}Input form-control"
                                                   placeholder="ID of the case" data-field="id" @input="${this.onInputChange}" value="${this._clinicalAnalysis.id}">
                                        ` : html`
                                            <div class="input-group">
                                                <input type="text" id="${this._prefix}Id" class="${this._prefix}Input form-control"
                                                       placeholder="ID of the case" data-field="id" @input="${this.onInputChange}">
                                                <span class="input-group-btn">
                                                <button class="btn btn-default" type="button">
                                                    <i class="fa fa-search" aria-hidden="true"></i>
                                                </button>
                                            </span>
                                            </div>
                                        `}
                                    </div>
                                </div>
        
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title">Analysis Type</label>
                                    <div class="col-md-3">
                                        <select class="selectpicker" data-width="100%" id="${this._prefix}Type" data-field="type" data-field-type="string"
                                                @change="${this.onSelectChange}">
                                            <option value="SINGLE">Single</option>
                                            <option value="FAMILY">Family</option>
                                            <option value="CANCER">Cancer</option>
                                            <option value="COHORT">Cohort</option>
                                            <option value="AUTOCOMPARATIVE">Autocomparative</option>
                                        </select>
                                    </div>
                                </div>
        
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title">Interpretation Flags</label>
                                    <div class="col-md-3">
                                        <!-- TODO CHECK on-dom-change="renderDomRepeat"-->
                                        <select class="selectpicker" data-width="100%" id="${this._prefix}Flags" data-field="flags" data-field-type="array"
                                                @change="${this.onSelectChange}" on-dom-change="renderDomRepeat" multiple data-selected-text-format="count > 2">
                                            ${this._config.flags && this._config.flags.length ? this._config.flags.map( item => html`
                                                <option value="${item}">${item}</option>
                                            `) : null }
                                        </select>
                                    </div>
                                </div>
        
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title">Priority</label>
                                    <div class="col-md-3">
                                        <select class="selectpicker" data-width="100%" id="${this._prefix}Priority" data-field="priority" data-field-type="string"
                                                @change="${this.onSelectChange}">
                                            <option style="color: red" value="URGENT">Urgent</option>
                                            <option style="color: orange" value="HIGH">High</option>
                                            <option style="color: blue" value="MEDIUM" selected>Medium</option>
                                            <option style="color: green" value="LOW">Low</option>
                                        </select>
                                    </div>
                                </div>
        
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title">Assigned To</label>
                                    <div class="col-md-3">
                                        <!-- TODO CHECK on-dom-change="renderDomRepeat"-->
                                        <select class="selectpicker" data-width="100%" id="${this._prefix}Assigned" data-field="assigned" data-field-type="object"
                                                @change="${this.onSelectChange}" on-dom-change="renderDomRepeat">
                                            ${this._studyUsers && this._studyUsers.length ? this._studyUsers.map( item => html`
                                                <option value="${item}" data-value="${item}">${item}</option>
                                            `) : null}
                                        </select>
                                    </div>
                                </div>
        
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title">Due Date</label>
                                    <div class="date col-md-3">
                                        <div class='input-group date' id="${this._prefix}DuePickerDate">
                                            <input type='text' id="${this._prefix}DueDate" class="${this._prefix}Input form-control" data-field="dueDate" @input="${this.onInputChange}" />
                                            <span class="input-group-addon">
                                            <span class="fa fa-calendar"></span>
                                        </span>
                                        </div>
                                    </div>
                                </div>
        
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title">Description</label>
                                    <div class="col-md-3">
                                        <textarea id="${this._prefix}Description" class="${this._prefix}Input form-control"
                                                  placeholder="Description of the case" data-field="description" @input="${this.onInputChange}"></textarea>
                                    </div>
                                </div>
                            </div>
        
        
                            <div>
                                <h4 class="form-section-title">Proband and Disease</h4>
                            </div>
        
                            <div class="form-horizontal" style="padding: 10px 10px">
                                ${this.isFamilyAnalysis(this._clinicalAnalysis.type) ? html`
                                    <div class="form-group" style="padding-top: 10px">
                                        <label class="control-label col-md-1 jso-label-title">Search Family</label>
                                        <div class="col-md-1">
                                            <!--Search family-->
                                            <button id="${this._prefix}-browseFamily2" class="btn btn-sm btn-primary"
                                                    data-toggle="modal" data-placement="bottom" @click="${this.showFamilySelector}"
                                                    style="display: inline">Browse...</button>
                                        </div>
                                        <div>
                                            <a @click="${this.showFamilyCreator}" class="col-md-2" style="cursor:pointer;">
                                                Don't have a family?
                                            </a>
                                        </div>
                                    </div>
                                ` : html`
                                    <div class="form-group" style="padding-top: 10px">
                                        <label class="control-label col-md-1 jso-label-title">Search Proband</label>
                                        <div class="col-md-1">
                                            <button id="${this._prefix}-browseIndividual2" class="btn btn-sm btn-primary"
                                                    data-toggle="modal" data-placement="bottom" @click="${this.showIndividualSelector}"
                                                    style="display: inline">Browse...</button>
                                        </div>
                                    </div>
                                `}
                                
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title">Disorder</label>
                                    <div class="col-md-3">
                                        <!-- TODO CHECK on-dom-change="renderDomRepeat"-->
                                        <select class="selectpicker" data-width="100%" id="${this._prefix}Disorder" data-field="disorder" data-field-type="object"
                                                @change="${this.onSelectChange}" on-dom-change="renderDomRepeat">
                                            ${this._disorders && this._disorders.length ? this._disorders.map( item => html`
                                                <option value="${item.id}" data-value="${item}">${item.id}</option>
                                            `) : null }
                                        </select>
                                    </div>
                                </div>
        
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title">Sample Configuration:</label>
                                    <div id="${this._prefix}GridTableDiv" class="col-md-11 col-md-offset-1" style="padding: 10px 20px">
                                        <table id="${this._prefix}IndividualBrowserGrid">
                                        </table>
                                    </div>
                                </div>
                            </div>
        
        
                        </div>
                    </div>
        
                    <div class="col-md-2 col-md-offset-2">
                        <!--<div class="form-group">-->
                        <!--<div class="col-md-2" style="float: right">-->
                        <button id="${this._prefix}Clear" class="btn btn-primary" @click="${this.onClear}">Clear</button>
                        <button id="${this._prefix}Ok" class="btn btn-primary" @click="${this.onCreate}">Create</button>
                        <!--</div>-->
                        <!--</div>-->
                    </div>
                </div>
        
                <!-- Modal: Individual browser -->
                <div class="modal fade" id="${this._prefix}IndividualBrowser" tabindex="-1" role="dialog" aria-labelledby="individualBrowserLabel">
                    <div class="modal-dialog modal-lg" role="document" style="width: 90%;">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 class="modal-title" id="${this._prefix}IndividualBrowserLabel">Individual Selector</h4>
                            </div>
                            <div class="modal-body" style="height: 780px">
                                <opencga-individual-browser .opencgaSession="${this.opencgaSession}"
                                                            .config="${this.individualBrowserConfig}"
                                                            @selectindividual="${this.onIndividualSelect}">
                                </opencga-individual-browser>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" data-dismiss="modal">
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        
                <!-- Modal: Family browser -->
                <div class="modal fade" id="${this._prefix}FamilyBrowser" tabindex="-1" role="dialog" aria-labelledby="familyBrowserLabel">
                    <div class="modal-dialog modal-lg" role="document" style="width: 90%;">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 class="modal-title" id="${this._prefix}FamilyBrowserLabel">Family Selector</h4>
                            </div>
                            <div class="modal-body" style="height: 780px">
                                <opencga-family-browser .opencgaSession="${this.opencgaSession}"
                                                        .config="${this.familyBrowserConfig}"
                                                        @selectfamily="${this.onFamilySelect}">
                                </opencga-family-browser>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" data-dismiss="modal">
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        </div>

        <!--<table id="${this._prefix}IndividualBrowserGrid">-->
        <!--<thead style="background-color: #eee"></thead>-->
        <!--</table>-->

        <!-- Same window: Family editor -->
        <!--<template is="dom-if" if="{{createFamily}}">-->
        <!--<button type="button" style="float: right; margin: 30px 30px 0px 0px;" class="btn btn-success" on-click="backToClinicalView">BACK</button>-->
        <!--<opencga-family-editor opencga-session="{{opencgaSession}}" config="[[familyBrowserConfig]]"></opencga-family-editor>-->
        <!--</template>-->
        `;
    }

}

customElements.define("opencga-clinical-analysis-editor", OpencgaClinicalAnalysisEditor);
