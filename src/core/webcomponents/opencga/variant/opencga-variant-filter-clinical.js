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
        this.showModeOfInheritance = true;

        this._query = {};

        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    firstUpdated(_changedProperties) {
        // Render the first time after preparing the DOM
        this.clinicalAnalysisObserver();
        $("select.selectpicker", this).selectpicker("render");
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    clinicalAnalysisObserver() {
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
            if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.proband)) {
                individuals = [this.clinicalAnalysis.proband];
            }
            this.showModeOfInheritance = false;
        }

        // Set new individuals setting the previous values selected
        if (UtilsNew.isNotEmptyArray(individuals)) {

            // Prepare data to be easier to query
            const _sampleFiltersMap = {};
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
                        proband: false,
                        affected: false,
                        sex: individual.sex,
                        // father: (individual.father !== undefined && individual.father.id !== undefined) ? individual.father.id : "-",
                        // mother: (individual.mother !== undefined && individual.mother.id !== undefined) ? individual.mother.id : "-",
                        father: fatherId,
                        mother: motherId,
                        genotypes: (UtilsNew.isNotUndefinedOrNull(_sampleFiltersMap[sample.id])) ? _sampleFiltersMap[sample.id].genotypes : this._config.defaultGenotypes,
                        dp: (UtilsNew.isNotUndefinedOrNull(_sampleFiltersMap[sample.id])) ? _sampleFiltersMap[sample.id].dp : ""
                    };

                    if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.proband) && individual.id === this.clinicalAnalysis.proband.id) {
                        _sampleFilter.proband = true;
                    }

                    if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.disorder) && UtilsNew.isNotEmptyArray(individual.disorders)) {
                        for (const disorder of individual.disorders) {
                            if (disorder.id === this.clinicalAnalysis.disorder.id) {
                                _sampleFilter.affected = true;
                            }
                        }
                    }

                    _sampleFilters.push(_sampleFilter);
                }
            }
            this.sampleFilters = _sampleFilters;
        } else {
            // There is an event and no individuals have been found
            this.sampleFilters = [];
        }

        // this.renderSampleTable();
        this.sampleFilters = [...this.sampleFilters];
        this.requestUpdate();
        this.notify();
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
            this.sampleFilters = [...this.sampleFilters];
            this.requestUpdate();
        }
    }

    notify() {
        // let compHet = false;
        let missing = false;
        if (PolymerUtils.getElementById(this._prefix + "MissingCheckbox") !== null) {
            missing = PolymerUtils.getElementById(this._prefix + "MissingCheckbox").checked;
        }

        // File Filters
        // let _qual = undefined;
        // if (UtilsNew.isNotUndefinedOrNull(PolymerUtils.getElementById(this._prefix + "FileFilterQualCheckbox"))
        //     && PolymerUtils.getElementById(this._prefix + "FileFilterQualCheckbox").checked) {
        //     _qual = PolymerUtils.getElementById(this._prefix + "FileFilterQualInput").value;
        // }
        // let _filter = undefined;
        // if (UtilsNew.isNotUndefinedOrNull(PolymerUtils.getElementById(this._prefix + "FileFilterPass"))
        //     && PolymerUtils.getElementById(this._prefix + "FileFilterPass").checked) {
        //     _filter = "PASS";
        // }

        // Notify the sample change
        this.dispatchEvent(new CustomEvent("sampleFiltersChange", {
            detail: {
                sampleFilters: this.sampleFilters,
                modeOfInheritance: this.modeOfInheritance,
                // compoundHeterozygous: compHet,
                missing: missing
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
        this.opencgaSession.opencgaClient.variants().familyGenotypes({
            study: this.opencgaSession.study.fqn,
            family: this.clinicalAnalysis.family.id,
            disorder: this.clinicalAnalysis.disorder.id,
            modeOfInheritance: this.modeOfInheritance,
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
                    countGenoypes += sampleFilter.genotypes.length;
                }
                // _this.renderSampleTable()
                _this.sampleFilters = [..._this.sampleFilters];
                _this.requestUpdate();

                if (countGenoypes > 0) {
                    PolymerUtils.hide(_this._prefix + "Warning");
                } else {
                    PolymerUtils.show(_this._prefix + "Warning");
                }

                _this.notify();
            }
        }).catch(function(response) {
            console.error(response);
        });
    }

    renderSampleTable() {
        return html`
            ${this.sampleFilters && this.sampleFilters.length ? this.sampleFilters.map(sampleFilter => html`<tr data-sample="${sampleFilter.id}">
                <td style="vertical-align: middle">
                    <div>
                        <span data-toggle="tooltip" data-placement="bottom" title=""
                                                              style="${(sampleFilter.affected ? "color: darkred;" : "font-weight: normal;")}${sampleFilter.proband ? "font-weight: bold" : ""}">
                                                            ${sampleFilter.id} <i class='fa ${this._config.sexIConMap[sampleFilter.sex]} fa-lg'
                                                                                 style='padding-left: 5px'></i>
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
                    <input id="${this._prefix}${sampleFilter.id}00" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="0/0"
                           ${sampleFilter.genotypes.includes("0/0") ? "checked" : ""} @click="${this.onSampleTableChange}">
                </td>
                <td style="padding-left: 20px">
                    <input id="${this._prefix}${sampleFilter.id}01" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="0/1"
                           ${sampleFilter.genotypes.includes("0/1") ? "checked" : ""} @click="${this.onSampleTableChange}">
                </td>
                <td style="padding-left: 20px">
                    <input id="${this._prefix}${sampleFilter.id}11" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="1/1"
                           ${sampleFilter.genotypes.includes("1/1") ? "checked" : ""} @click="${this.onSampleTableChange}">
                </td>
                <td style="padding-left: 10px">
                    <input id="${this._prefix}${sampleFilter.id}DP" type="text" value="${sampleFilter.dp !== undefined && sampleFilter.dp > 0 ? sampleFilter.dp : ""}"
                           class="form-control input-sm sample-dp-textbox" aria-label="..." placeholder="e.g. 15"
                           style="width: 60px" @input="${this.onSampleTableChange}">
                </td>
            </tr>
            `) : ""}
        `;
    }

    onSampleTableChange(e) {
        const table = PolymerUtils.getElementById(this._prefix + "BasicTable");
        let counter = 0;

        for (const row of table.rows) {
            if (row.dataset.sample !== undefined) {
                // Set GT values reading columns 5, 6 and 7
                this.sampleFilters[counter].genotypes = [];
                for (let i = 5; i <= 7; i++) {
                    if (row.children[i].children[0].checked) {
                        this.sampleFilters[counter].genotypes.push(row.children[i].children[0].dataset.gt);
                    }

                }

                // Set DP value
                this.sampleFilters[counter].dp = row.children[8].children[0].value;

                counter++;
            }
        }
        this.sampleFilters = [...this.sampleFilters];
        console.log("this.sampleFilters", this.sampleFilters);
        this.requestUpdate();

        // Set MoI select to 'none' when clicked in GT
        if (UtilsNew.isNotUndefinedOrNull(e.currentTarget.dataset.gt)) {
            this.modeOfInheritance = "none";
            $("#" + this._prefix + "ModeOfInheritance").selectpicker("val", "none");
            PolymerUtils.hide(this._prefix + "Warning");
        }

        this.notify();
    }

    getDefaultConfig() {
        return {
            // defaultGenotypes: ["0/1", "1/1"],
            defaultGenotypes: [],
            sexIConMap: {
                MALE: "fa-mars",
                FEMALE: "fa-venus",
                UNKNOWN: "fa-genderless"
            }
        };
    }

    render() {
        return html`
       <style include="jso-styles">
        </style>

        <div class="row">

            <div class="col-md-12" style="padding: 0px 20px">
                <h4>Select Sample Filters</h4>
                <div style="padding: 5px 20px">
                    You can select the sample genotypes manually or select a <span style="font-weight: bold;margin: 0px">Mode of Inheritance</span>
                    in the dropdown below the table, this option is only available for Family analysis. Please, notice that if you want to execute a
                    <span style="font-weight: bold;margin: 0px">Compound Heterozygous</span> or <span style="font-weight: bold;margin: 0px">de Novo</span>
                    analysis you can go to the corresponding tools in the analysis toolbar.
                </div>
                <div style="padding: 0px 20px">
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
                            <th scope="col" rowspan="2">HOM_REF</th>
                            <th scope="col" rowspan="2">HET</th>
                            <th scope="col" rowspan="2">HOM_ALT</th>
                        </tr>
                        </thead>
                        <tbody id="${this._prefix}BasicTBody">
                           this.sampleFilters ${JSON.stringify(this.sampleFilters)}
                           <!-- renderSampleTable() -->
                            ${this.sampleFilters && this.sampleFilters.length ? this.sampleFilters.map(sampleFilter => html`
                                <tr data-sample="${sampleFilter.id}">
                                    <td style="vertical-align: middle">
                                        <div>
                                            <span   style="${(sampleFilter.affected ? "color: darkred;" : "font-weight: normal;")}${sampleFilter.proband ? "font-weight: bold" : ""}"
                                                    data-toggle="tooltip"
                                                    data-placement="bottom"
                                                    title="">
                                                        ${sampleFilter.id}
                                                        <i class='fa ${this._config.sexIConMap[sampleFilter.sex]} fa-lg' style='padding-left: 5px'></i>
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
                                        <input id="${this._prefix}${sampleFilter.id}00" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="0/0"
                                               .checked="${sampleFilter.genotypes.includes("0/0")}" @click="${this.onSampleTableChange}">
                                    </td>
                                    <td style="padding-left: 20px">
                                        <input id="${this._prefix}${sampleFilter.id}01" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="0/1"
                                               .checked="${sampleFilter.genotypes.includes("0/1")}" @click="${this.onSampleTableChange}">
                                    </td>
                                    <td style="padding-left: 20px">
                                        <input id="${this._prefix}${sampleFilter.id}11" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="1/1"
                                               .checked="${sampleFilter.genotypes.includes("1/1")}" @click="${this.onSampleTableChange}">
                                    </td>
                                    <td style="padding-left: 10px">
                                        <input id="${this._prefix}${sampleFilter.id}DP" type="text" value="${sampleFilter.dp !== undefined && sampleFilter.dp > 0 ? sampleFilter.dp : ""}"
                                               class="form-control input-sm sample-dp-textbox" aria-label="..." placeholder="e.g. 15"
                                               style="width: 60px" @input="${this.onSampleTableChange}">
                                    </td>
                                </tr>
                             `) : "BOBO"}
                           
                           
                        </tbody>
                    </table>
                </div>
                <div id="${this._prefix}BasicTableMessage" style="text-align: center"><span style="font-weight: bold">No Samples selected</span></div>
            </div>

            ${this.showModeOfInheritance ? html`
                <div class="col-md-12" style="padding: 10px 20px">
                    <div class="col-md-2" style="padding: 10px 25px 5px 25px">
                        <label>Mode of Inheritance</label>
                    </div>
                    <div class="col-md-3">
                        <select class="selectpicker" id="${this._prefix}ModeOfInheritance" data-size="8" style="font-size: 12px"
                                @change="${this.onModeOfInheritance}">
                            <option value="none">None</option>
                            <option value="MONOALLELIC">Autosomal Dominant</option>
                            <option value="BIALLELIC">Autosomal Recessive</option>
                            <!--<option value="COMPOUND_HETEROZYGOUS">Compound Heterozygous (AR) </option>-->
                            <option value="XLINKED_MONOALLELIC">X-linked Dominant</option>
                            <option value="XLINKED_BIALLELIC">X-linked Recessive</option>
                            <option value="YLINKED">Y-linked</option>
                        </select>
                    </div>
                    <div class="col-md-7">
                        <div class="alert alert-warning" role="alert" id="${this._prefix}Warning" style="display: none;padding: 10px">
                            <span style="font-weight: bold;font-size: 1.20em">Warning:</span>&nbsp;The selected Mode of Inheritance is not compatible with the family pedigree .
                        </div>
                    </div>
                </div>    
            ` : null}
            
            
            <div class="col-md-12" style="padding: 10px 20px">
                <div style="padding: 0 25px">
                    <label>Other options</label>
                </div>
                <div style="padding: 5px 30px">
                    <input id="${this._prefix}MissingCheckbox" type="checkbox" @click="${this.notify}"><span style="padding-left: 5px">Include parent missing (non-ref) allele calls</span>
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-variant-filter-clinical", OpencgaVariantFilterClinical);
