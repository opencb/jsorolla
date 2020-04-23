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
import Utils from "./../../utils.js";
import UtilsNew from "../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "../commons/filters/select-field-filter.js";

// TODO complete refactor

export default class OpencgaVariantFilterClinical extends LitElement {

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
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ovfc" + Utils.randomString(6);

        this.sampleFilters = [];
        this.fileFilters = [];
        this.modeOfInheritance = "none";
        this.modeOfInheritanceSelect = [
            {id: "CUSTOM", name: "Custom", selected: true},
            {id: "MONOALLELIC", name: "Autosomal Dominant"},
            {id: "BIALLELIC", name: "Autosomal Recessive"},
            {id: "XLINKED_MONOALLELIC", name: "X-linked Dominant"},
            {id: "XLINKED_BIALLELIC", name: "X-linked Recessive"},
            {id: "YLINKED", name: "Y-linked"},
            {id: "COMPOUND_HETEROZYGOUS", name: "Compound Heterozygous"},
            {id: "DE_NOVO", name: "De Novo"}
        ];
        this.showModeOfInheritance = true;

        this.mode = "CUSTOM";

        this._query = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("config")) {
            // this.configObserver();
        }
    }

    firstUpdated(_changedProperties) {
        // Render the first time after preparing the DOM
        // this.clinicalAnalysisObserver();
        $("select.selectpicker", this).selectpicker("render");
    }

    clinicalAnalysisObserver() {
        console.log("clinicalAnalysisObserver ", this.sampleFilters);
        if (UtilsNew.isUndefinedOrNull(this.clinicalAnalysis)) {
            console.log("clinicalAnalysis is undefined or null: ", this.clinicalAnalysis);
            return;
        }

        /*
         * First, get and render individual options
         * Second, get and render files options
         */

        // We read Individuals from Clinical Analysis
        let individuals = [];

        if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.family) && UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.family.members)) {
            individuals = this.clinicalAnalysis.family.members;
            this.showModeOfInheritance = true;
        } else {
            if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.proband)) {
                individuals = [this.clinicalAnalysis.proband];
            }
            this.showModeOfInheritance = false;
        }

        // Set new individuals setting the previous values selected
        if (UtilsNew.isNotEmptyArray(individuals)) {

            // Prepare data to be easier to query
            const _sampleFiltersMap = {};
            console.log("sampleFilters", this.sampleFilters);
            if (UtilsNew.isNotEmptyArray(this.sampleFilters)) {
                for (const sampleFilter of this.sampleFilters) {
                    _sampleFiltersMap[sampleFilter.id] = sampleFilter;
                }
            }

            // We iterate the individuals copying the previous values
            const _sampleFilters = [];
            for (const individual of individuals) {
                if (UtilsNew.isNotEmptyArray(individual.samples)) {
                    let fatherId = "-";
                    // If possible we use sample ID
                    if (individual.father !== undefined && individual.father.id !== undefined) {
                        fatherId = individual.father.id;
                        for (const ind of individuals) {
                            if (individual.father.id === ind.id) {
                                fatherId = UtilsNew.isNotEmptyArray(ind.samples) ? ind.samples[0].id : ind.id;
                                break;
                            }
                        }
                    }

                    let motherId = "-";
                    // If possible we use sample ID
                    if (individual.mother !== undefined && individual.mother.id !== undefined) {
                        motherId = individual.mother.id;
                        for (const ind of individuals) {
                            if (individual.mother.id === ind.id) {
                                motherId = UtilsNew.isNotEmptyArray(ind.samples) ? ind.samples[0].id : ind.id;
                                break;
                            }
                        }
                    }

                    // There should be just one sample per individual in the Clinical Analysis
                    const sample = individual.samples[0];
                    const _sampleFilter = {
                        id: sample.id,
                        proband: this.clinicalAnalysis.proband && individual.id === this.clinicalAnalysis.proband.id,
                        affected: this.clinicalAnalysis.disorder && individual.disorders.length ? individual.disorders.some(disorder => disorder.id === this.clinicalAnalysis.disorder.id) : false, // some() returns either true or false, false of the ternary operator is useless
                        sex: individual.sex,
                        // father: (individual.father !== undefined && individual.father.id !== undefined) ? individual.father.id : "-",
                        // mother: (individual.mother !== undefined && individual.mother.id !== undefined) ? individual.mother.id : "-",
                        father: fatherId,
                        mother: motherId,
                        genotypes: (UtilsNew.isNotUndefinedOrNull(_sampleFiltersMap[sample.id])) ? _sampleFiltersMap[sample.id].genotypes : this._config.defaultGenotypes,
                        dp: (UtilsNew.isNotUndefinedOrNull(_sampleFiltersMap[sample.id])) ? _sampleFiltersMap[sample.id].dp : ""
                    };

                    _sampleFilters.push(_sampleFilter);
                }
            }
            this.sampleFilters = _sampleFilters;
        } else {
            // There is an event and no individuals have been found
            this.sampleFilters = [];
        }

        // this.renderSampleTable();
        this.sampleFilters = $.extend([], this.sampleFilters);
        // this.requestUpdate();

        // TODO temp commented
        console.warn("sampleFiltersChange temp. commented");
        // this.sampleFiltersChange();
    }

    /**
     * This function can not add or remove samples or file, this just changes the filters applied, if not present then is left empty.
     * @param query
     */
    queryObserver(query) {
        if (UtilsNew.isEmptyArray(this.sampleFilters) && UtilsNew.isEmptyArray(this.fileFilters)) {
            console.error("this.sampleFilters or this.fileFilters is empty");
            return;
        }

        if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            // Reset all genotypes
            for (const sampleFilter of this.sampleFilters) {
                sampleFilter.genotypes = [];
            }

            if (UtilsNew.isNotUndefinedOrNull(this.query.genotype)) {
                // Assign new passed genotypes to EXISTING samples
                const genotypes = this.query.genotype.split(";");
                for (const genotype of genotypes) {
                    const sampleAndGenotype = genotype.split(":");
                    for (const sampleFilter of this.sampleFilters) {
                        if (sampleFilter.id === sampleAndGenotype[0]) {
                            sampleFilter.genotypes = sampleAndGenotype[1].split(",");
                            break;
                        }
                    }
                }
                delete this._query.sample;
            } else {
                // let _sampleIds = [];
                // for (let sampleFilter of this.sampleFilters) {
                //     _sampleIds.push(sampleFilter.id);
                // }
                // debugger
                // this._query.sample = _sampleIds.join(",");
                // debugger
            }
            this.sampleFilters = $.extend([], this.sampleFilters);
            // console.error("queryObserver in modal", this.sampleFilters)
            this.requestUpdate();
        }
    }

    sampleFiltersChange() {
        // let compHet = false;
        // const missing = this.querySelector("#" + this._prefix + "MissingCheckbox").checked;

        const _sampleFilters = this.sampleFilters;
        console.log("sampleFiltersChange", this.sampleFilters);
        if (this.mode === "COMPOUND_HETEROZYGOUS" || this.mode === "DE_NOVO") {
            // _sampleFilters = this.sampleFilters.filter( sample => sample.proband);
            // _sampleFilters.genotype = [this.mode]
        }

        // Notify the sample change
        this.dispatchEvent(new CustomEvent("sampleFiltersChange", {
            detail: {
                sampleFilters: _sampleFilters,
                modeOfInheritance: this.modeOfInheritance,
                mode: this.mode
                // compoundHeterozygous: compHet,
                // missing: missing
                // fileFilters: this.fileFilters,
                // qual: _qual,
                // filter: _filter
            },
            bubbles: true,
            composed: true
        }));
    }

    onModeOfInheritance(e) {
        this.modeOfInheritance = e.target.value;
        const _this = this;
        this.opencgaSession.opencgaClient.variants().genotypesFamily(this.modeOfInheritance, {
            study: this.opencgaSession.study.fqn,
            family: this.clinicalAnalysis.family.id,
            disorder: this.clinicalAnalysis.disorder.id,
            completePenetrance: true
        }).then(function(response) {
            const genotypeResults = response.response[0].result[0];
            if (UtilsNew.isNotUndefinedOrNull(genotypeResults)) {
                const individualToSampleMap = {};
                for (const member of _this.clinicalAnalysis.family.members) {
                    if (UtilsNew.isNotEmptyArray(member.samples)) {
                        individualToSampleMap[member.samples[0].id] = member.id;
                    }
                }
                let countGenoypes = 0;
                for (const sampleFilter of _this.sampleFilters) {
                    // sampleFilter.genotypes = genotypeResults[sampleFilter.id];
                    sampleFilter.genotypes = genotypeResults[individualToSampleMap[sampleFilter.id]];
                    console.log("genotypes", sampleFilter.genotypes);
                    countGenoypes += sampleFilter.genotypes.length;
                }
                // _this.renderSampleTable()
                _this.sampleFilters = $.extend([], _this.sampleFilters);
                _this.requestUpdate();

                if (countGenoypes > 0) {
                    PolymerUtils.hide(_this._prefix + "Warning");
                } else {
                    PolymerUtils.show(_this._prefix + "Warning");
                }

                _this.sampleFiltersChange();
            }
        }).catch(function(response) {
            console.error(response);
        });
    }

    async onSampleTableChange(e) {
        e.preventDefault();
        const table = PolymerUtils.getElementById(this._prefix + "BasicTable");
        const counter = 0;
        const {gt, sampleId} = e.target.dataset;
        console.log("GT", gt, sampleId);
        const sampleIndex = this.sampleFilters.findIndex(sample => sample.id === sampleId);
        console.log("checked", e.target.checked);
        console.log("sample", sampleIndex);

        console.log("sampleFilters before", this.sampleFilters);

        if (e.target.checked) {
            this.sampleFilters[sampleIndex].genotypes.push(gt);
            // console.log("added", this.sampleFilters[sampleIndex].genotypes);
        } else {
            this.sampleFilters[sampleIndex].genotypes.splice(this.sampleFilters[sampleIndex].genotypes.indexOf(gt), 1);
            // console.log("removed", this.sampleFilters[sampleIndex].genotypes);
        }

        console.log("sampleFilters after", this.sampleFilters);
        this.sampleFilters = [...this.sampleFilters];
        // this.sampleFilters = $.extend(true, [], this.sampleFilters);
        // this.requestUpdate();

        // Set MoI select to 'none' when clicked in GT
        if (UtilsNew.isNotUndefinedOrNull(e.currentTarget.dataset.gt)) {
            this.modeOfInheritance = "none";
            $("#" + this._prefix + "ModeOfInheritance").selectpicker("val", "none");
            PolymerUtils.hide(this._prefix + "Warning");
        }

        // 'console.log("this.sampleFilters",this.sampleFilters);
        await this.requestUpdate();
        this.sampleFiltersChange();
    }

    setMode(e) {
        this.mode = e.detail.value;

        if (this.mode === "CUSTOM") {
            // remove the "segregation" values
            for (const sample of this.sampleFilters) {
                sample.genotypes = sample.genotypes.filter(gt => ~["0/0", "0/1", "1/1"].indexOf(gt));
            }
        }
        // segregation
        if (this.modeOfInheritanceSelect.map(_ => _.id).includes(this.mode)) {
            this.onModeOfInheritance(e);
        }

        if (this.mode === "COMPOUND_HETEROZYGOUS") {
            this.sampleFiltersChange();
        }

        if (this.mode === "DE_NOVO") {
            this.sampleFiltersChange();
        }
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            // defaultGenotypes: ["0/1", "1/1"],
            defaultGenotypes: [],
            sexIconMap: {
                MALE: "fa-mars",
                FEMALE: "fa-venus",
                UNKNOWN: "fa-genderless"
            }
        };
    }

    render() {
        return html`
        <style include="jso-styles">
            #opencga-variant-filter-clinical {
                font-size: 12px;
            }
            
/*            #opencga-variant-filter-clinical .checkbox-container input[type=radio]:checked ~ label:before {
                font-family: "Font Awesome 5 Free";
                content: "\\f111";        
            }
            #opencga-variant-filter-clinical .checkbox-container input[type=radio] {
                display: none;
            }*/
            
            #segregation-select {
                width: 200px;
            }
    
            #opencga-variant-filter-clinical .mode-button > div {
                margin-right: 20px;
                display: inline-block;
                vertical-align: top;
            }
            
            #opencga-variant-filter-clinical .select-field-filter-wrapper {
                display: inline-block;
                width: 180px;
            }
        </style>

        <div id="opencga-variant-filter-clinical" class="row">

            <div class="col-md-12">
                <!--<h4>Select Sample Filters</h4>
                <div style="padding: 5px 20px">
                    You can select the sample genotypes manually or select a <span style="font-weight: bold;margin: 0px">Mode of Inheritance</span>
                    in the dropdown below the table, this option is only available for Family analysis. Please, notice that if you want to execute a
                    <span style="font-weight: bold;margin: 0px">Compound Heterozygous</span> or <span style="font-weight: bold;margin: 0px">de Novo</span>
                    analysis you can go to the corresponding tools in the analysis toolbar.
                </div>-->

                <div class="form-check">
                    <div class="form-check-label mode-button">
                    
                        <!--<select-field-filter ?multiple="${true}" ?disabled=${false} ?required=${true} .data="${["GT", "LT"]}" .value="${"LT"}" maxOptions="2" @filterChange="${e => console.log("ID", e.detail.value)}"></select-field-filter>-->
                        <select-field-filter .data="${this.modeOfInheritanceSelect}" value=${this.mode} @filterChange="${this.setMode}"></select-field-filter>

                        <!--<div>
                            <button class="btn btn-default ripple ${this.mode === "custom" ? "active" : ""}" value="custom" @click="${this.setSample}">Custom</button>
                        </div>
                        <div>
                            <button class="btn btn-default ripple ${this.mode === "segregation" ? "active" : ""}" value="segregation" @click="${this.setSample}">Segregation</button>
                            <div class="select-field-filter-wrapper"><select-field-filter ?disabled="${this.mode !== "segregation"}" .data="${[{id: "MONOALLELIC", name: "Autosomal Dominant"}, {id: "BIALLELIC", name: "Autosomal Recessive"}, {id: "XLINKED_MONOALLELIC", name: "X-linked Dominant"}, {id: "XLINKED_BIALLELIC", name: "X-linked Recessive"}, {id: "YLINKED", name: "Y-linked"}]}" .value=${"A"} @filterChange="${e => this.onModeOfInheritance(e)}"></select-field-filter></div>
                        </div>
                        <div>
                            <button class="btn btn-default ripple ${this.mode === "COMPOUND_HETEROZYGOUS" ? "active" : ""}" value="ch" @click="${this.setSample}">Compound Heterozygous</button>
                        </div>
                        <div>
                            <button class="btn btn-default ripple ${this.mode === "DE_NOVO" ? "active" : ""}" value="denovo" @click="${this.setSample}">De Novo</button>
                        </div> -->
                    </div>
                </div>
                <div>
                    <table id="${this._prefix}BasicTable" class="table table-hover table-no-bordered">
                        <thead>
                        <tr>
                            <th rowspan="2">Sample</th>
                            <th rowspan="2">Proband</th>
                            <th rowspan="2">Affected</th>
                            <th rowspan="2">Father</th>
                            <th rowspan="2">Mother</th>
                            <th rowspan="1" colspan="3" style="text-align: center">Genotypes</th>
                            <th rowspan="2">Min. Depth</th>
                        </tr>
                        <tr>
                            <th scope="col">HOM_REF</th>
                            <th scope="col">HET</th>
                            <th scope="col">HOM_ALT</th>
                        </tr>
                        </thead>
                        <tbody id="${this._prefix}BasicTBody">
                            ${this.sampleFilters && this.sampleFilters.length ? this.sampleFilters.map(sampleFilter => html`
                                <tr data-sample="${sampleFilter.id}">
                                    <td style="vertical-align: middle">
                                        <div>
                                            <span style="${(sampleFilter.affected ? "color: darkred;" : "font-weight: normal;")}${sampleFilter.proband ? "font-weight: bold" : ""}"
                                                  data-toggle="tooltip"
                                                  data-placement="bottom">
                                                ${sampleFilter.id} &nbsp; <i class='fa ${this._config.sexIconMap[sampleFilter.sex]} fa-lg'></i>
                                            </span>
                                        </div>
                                    </td>
                                    <td style="padding-left: 20px">
                                        ${sampleFilter.proband ? html`
                                            <span data-toggle="tooltip" data-placement="bottom" title="Proband">
                                                <i class='fa fa-check' style='color: green'></i>
                                            </span>` : html`
                                            <span><i class='fa fa-times' style='color: red'></i></span>
                                        `}
                                    </td>
                                    <td style="padding-left: 20px">
                                        ${sampleFilter.affected ? html`
                                            <span data-toggle="tooltip" data-placement="bottom" title="Affected"><i class='fa fa-check' style='color: green'></i></span>` : html`
                                            <span><i class='fa fa-times' style='color: red'></i></span>`
        }
                                    </td>
                                    <td style="padding-left: 20px">
                                        <span>${sampleFilter.father}</span>
                                    </td>
                                    <td style="padding-left: 20px">
                                        <span>${sampleFilter.mother}</span>
                                    </td>
                                    <td style="padding-left: 20px">
                                        <input id="${this._prefix}${sampleFilter.id}00" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="0/0" data-sample-id="${sampleFilter.id}"
                                               .checked="${sampleFilter.genotypes.includes("0/0")}" ?disabled="${this.mode !== "CUSTOM"}" @change="${this.onSampleTableChange}">
                                    </td>
                                    <td style="padding-left: 20px">
                                        <input id="${this._prefix}${sampleFilter.id}01" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="0/1" data-sample-id="${sampleFilter.id}"
                                               .checked="${sampleFilter.genotypes.includes("0/1")}" ?disabled="${this.mode !== "CUSTOM"}" @change="${this.onSampleTableChange}">
                                    </td>
                                    <td style="padding-left: 20px">
                                        <input id="${this._prefix}${sampleFilter.id}11" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="1/1" data-sample-id="${sampleFilter.id}"
                                               .checked="${sampleFilter.genotypes.includes("1/1")}" ?disabled="${this.mode !== "CUSTOM"}" @change="${this.onSampleTableChange}">
                                    </td>
                                    <td style="padding-left: 10px">
                                        <input id="${this._prefix}${sampleFilter.id}DP" type="text" value="${sampleFilter.dp !== undefined && sampleFilter.dp > 0 ? sampleFilter.dp : ""}"
                                               class="form-control input-sm sample-dp-textbox" aria-label="..." placeholder="e.g. 15"
                                               style="width: 60px" @input="${this.onSampleTableChange}">
                                    </td>
                                </tr>
                             `) : ""}
                        </tbody>
                    </table>
                </div>
                <div id="${this._prefix}BasicTableMessage" style="text-align: center"><span style="font-weight: bold">No Samples selected</span></div>
            </div>

            ${this.showModeOfInheritance ? html`
                <div class="col-md-12" style="padding: 10px 20px">
                    <div class="alert alert-warning" role="alert" id="${this._prefix}Warning" style="display: none;padding: 10px">
                        <span style="font-weight: bold;font-size: 1.20em">Warning:</span>&nbsp;The selected Mode of Inheritance is not compatible with the family pedigree .
                    </div>
                </div>    
            ` : null}
            
            
            <!-- <div class="col-md-12" style="padding: 10px 20px">
                <div style="padding: 0 25px">
                    <label>Other options</label>
                </div>
                <div style="padding: 5px 30px">
                    <input id="${this._prefix}MissingCheckbox" type="checkbox" @click="${this.sampleFiltersChange}"><span style="padding-left: 5px">Include parent missing (non-ref) allele calls</span>
                </div>
            </div> -->
        </div>
        `;
    }

}

customElements.define("opencga-variant-filter-clinical", OpencgaVariantFilterClinical);
