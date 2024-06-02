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
import UtilsNew from "../../core/utils-new.js";
import PolymerUtils from "../PolymerUtils.js";
import Pedigree from "../../core/visualisation/pedigree.js";
import "../commons/view/pedigree-view.js";
import "../commons/forms/select-field-filter.js";

/**
 * @deprecated
 */
export default class VariantFamilyGenotypeFilter extends LitElement {

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
        this._prefix = "ovfc" + UtilsNew.randomString(6);

        this.sampleFilters = [];
        this.modeOfInheritance = "none";
        this.modeOfInheritanceList = MODE_OF_INHERITANCE;

        this.modeSelectData = [
            {id: "CUSTOM", name: "Custom", selected: true},
            {separator: true},
            ...this.modeOfInheritanceList,
            {separator: true},
            {id: "COMPOUND_HETEROZYGOUS", name: "Compound Heterozygous"},
            {id: "DE_NOVO", name: "De Novo"},
            {id: "MENDELIAN_ERROR", name: "Mendelian Error"}
        ];
        this.showModeOfInheritance = true;

        this.mode = "CUSTOM";

        // this._query = {};
        this.errorState = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("config")) {
            // this.configObserver();
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    firstUpdated(_changedProperties) {
        // Render the first time after preparing the DOM
        // this.clinicalAnalysisObserver();
        $("select.selectpicker", this).selectpicker("render");
    }

    clinicalAnalysisObserver() {
        console.log("clinicalAnalysisObserver ", this.sampleFilters);
        if (!this.clinicalAnalysis) {
            console.log("clinicalAnalysis is undefined or null: ", this.clinicalAnalysis);
            return;
        }
        /*
         * First, get and render individual options
         * Second, get and render files options
         */

        // We read Individuals from Clinical Analysis
        let individuals = [];
        if (this.clinicalAnalysis.family && this.clinicalAnalysis.family.members) {
            // We must use only the Individuals with samples
            individuals = this.clinicalAnalysis.family.members.filter(member => member.samples && member.samples.length > 0);
            this.showModeOfInheritance = true;
        } else {
            if (this.clinicalAnalysis.proband) {
                individuals = [this.clinicalAnalysis.proband];
            }
            this.showModeOfInheritance = false;
        }

        // Prepare data to be easier to query
        if (individuals && individuals.length > 0) {
            // Set new individuals keeping the previous values selected
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
                if (individual.samples && individual.samples.length > 0) {
                    // let fatherId = "-";
                    // if (individual.father !== undefined && individual.father.id !== undefined) {
                    //     fatherId = individual.father.id;
                    //     // If possible we use sample ID
                    //     for (const ind of individuals) {
                    //         if (individual.father.id === ind.id) {
                    //             fatherId = UtilsNew.isNotEmptyArray(ind.samples) ? ind.samples[0].id : ind.id;
                    //             break;
                    //         }
                    //     }
                    // }
                    //
                    // let motherId = "-";
                    // if (individual.mother !== undefined && individual.mother.id !== undefined) {
                    //     motherId = individual.mother.id;
                    //     // If possible we use sample ID
                    //     for (const ind of individuals) {
                    //         if (individual.mother.id === ind.id) {
                    //             motherId = UtilsNew.isNotEmptyArray(ind.samples) ? ind.samples[0].id : ind.id;
                    //             break;
                    //         }
                    //     }
                    // }

                    // TODO recheck individual?.disorders?.length. It seems it silently fails in case disorders is undefined.
                    // There should be just one sample per individual in the Clinical Analysis
                    const sample = individual.samples[0];

                    // Proband must be "0/1", "1/1" by default
                    let genotypes;
                    if (_sampleFiltersMap[sample.id]) {
                        genotypes = _sampleFiltersMap[sample.id];
                    } else {
                        genotypes = this.clinicalAnalysis?.proband?.id === individual.id ? ["0/1", "1/1"] : this._config.defaultGenotypes;
                    }
                    const _sampleFilter = {
                        id: sample.id,
                        proband: this.clinicalAnalysis.proband && individual.id === this.clinicalAnalysis.proband.id,
                        affected: this.clinicalAnalysis.disorder && individual?.disorders?.length ? individual.disorders.some(disorder => disorder.id === this.clinicalAnalysis.disorder.id) : false,
                        sex: individual.sex,
                        karyotypicSex: individual.karyotypicSex,
                        role: this.clinicalAnalysis?.family?.roles[this.clinicalAnalysis.proband.id][individual.id] || "PROBAND",
                        // genotypes: _sampleFiltersMap[sample.id] ? _sampleFiltersMap[sample.id].genotypes : this._config.defaultGenotypes,
                        genotypes: genotypes,
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
        //this.sampleFilters = $.extend([], this.sampleFilters);
        // this.requestUpdate();

        //this.pedigreeRender();

        this.notifySampleFilterChange();
    }

    /**
     * This function can not add or remove samples, this just changes the filters applied, if not present then is left empty.
     * @param query
     */
    queryObserver(query) {

        if (UtilsNew.isEmptyArray(this.sampleFilters)) {
            // console.error("this.sampleFilters or this.fileFilters is empty");
            return;
        }

        if (this.query && this.query.sample) {
            // Reset all genotypes
            for (const sampleFilter of this.sampleFilters) {
                sampleFilter.genotypes = [];
            }

            // Assign new passed genotypes to EXISTING samples
            const samples = this.query.sample.split(";");
            for (const sample of samples) {
                const sampleAndGenotype = sample.split(":");
                for (const sampleFilter of this.sampleFilters) {
                    if (sampleFilter.id === sampleAndGenotype[0]) {
                        // New sample filter makes genotypes optional
                        if (sampleAndGenotype.length > 1) {
                            sampleFilter.genotypes = sampleAndGenotype[1].split(",");
                        } else {
                            sampleFilter.genotypes = this._config.defaultGenotypes;
                        }
                        break;
                    }
                }
            }
            // delete this._query.sample;

            this.sampleFilters = $.extend([], this.sampleFilters);
            // console.error("queryObserver in modal", this.sampleFilters)
            // this.requestUpdate();
        }
    }

    notifySampleFilterChange() {
        // let compHet = false;
        // const missing = this.querySelector("#" + this._prefix + "MissingCheckbox").checked;

        // const _sampleFilters = this.sampleFilters;
        // console.log("sampleFiltersChange", this.sampleFilters);
        // if (this.mode === "COMPOUND_HETEROZYGOUS" || this.mode === "DE_NOVO") {
            // _sampleFilters = this.sampleFilters.filter( sample => sample.proband);
            // _sampleFilters.genotype = [this.mode]
        // }

        // Notify the sample change
        this.dispatchEvent(new CustomEvent("sampleFiltersChange", {
            detail: {
                sampleFilters: this.sampleFilters,
                modeOfInheritance: this.modeOfInheritance,
                mode: this.mode,
                // compoundHeterozygous: compHet,
                // missing: missing,
                errorState: this.errorState
            },
            bubbles: true,
            composed: true
        }));
    }

    onModeOfInheritance(mode) {
        this.modeOfInheritance = mode;

        this.opencgaSession.opencgaClient.variants().genotypesFamily(mode, {
            study: this.opencgaSession.study.fqn,
            family: this.clinicalAnalysis.family.id,
            disorder: this.clinicalAnalysis.disorder.id,
            completePenetrance: true
        }).then( response => {
            const genotypeResults = response.response[0].result[0];
            if (UtilsNew.isNotUndefinedOrNull(genotypeResults)) {
                const sampleToIndividualMap = {};
                for (const member of this.clinicalAnalysis.family.members) {
                    if (UtilsNew.isNotEmptyArray(member.samples)) {
                        sampleToIndividualMap[member.samples[0].id] = member.id;
                    }
                }

                let countGenoypes = 0;
                for (const sampleFilter of this.sampleFilters) {
                    // sampleFilter.genotypes = genotypeResults[sampleFilter.id];
                    sampleFilter.genotypes = genotypeResults[sampleToIndividualMap[sampleFilter.id]];
                    // console.log("genotypes", sampleFilter.genotypes);
                    countGenoypes += sampleFilter.genotypes.length;
                }
                // this.renderSampleTable()
                this.sampleFilters = $.extend([], this.sampleFilters);
                this.requestUpdate();


                if (countGenoypes > 0) {
                    this.errorState = false;
                } else {
                    this.errorState = true;
                }

                this.notifySampleFilterChange();
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
        //console.log("checked", e.target.checked);
        //console.log("sample", sampleIndex);

        //console.log("sampleFilters before", this.sampleFilters);

        if (e.target.checked) {
            this.sampleFilters[sampleIndex].genotypes.push(gt);
            // console.log("added", this.sampleFilters[sampleIndex].genotypes);
        } else {
            this.sampleFilters[sampleIndex].genotypes.splice(this.sampleFilters[sampleIndex].genotypes.indexOf(gt), 1);
            // console.log("removed", this.sampleFilters[sampleIndex].genotypes);
        }

        //console.log("sampleFilters after", this.sampleFilters);
        this.sampleFilters = [...this.sampleFilters];
        // this.sampleFilters = $.extend(true, [], this.sampleFilters);
        // this.requestUpdate();

        /*// Set MoI select to 'none' when clicked in GT
        if (UtilsNew.isNotUndefinedOrNull(e.currentTarget.dataset.gt)) {
            this.modeOfInheritance = "none";
            $("#" + this._prefix + "ModeOfInheritance").selectpicker("val", "none");
            PolymerUtils.hide(this._prefix + "Warning");
        }*/

        // 'console.log("this.sampleFilters",this.sampleFilters);
        this.requestUpdate();
        await this.updateComplete;
        this.notifySampleFilterChange();
    }

    setMode(e) {
        this.mode = e.detail.value.toUpperCase();
        this.errorState = false;

        if (this.mode === "CUSTOM") {
            for (const sample of this.sampleFilters) {
                // remove the "segregation",  "COMPOUND_HETEROZYGOUS", "DE_NOVO" values (all not CUSTOM values)
                sample.genotypes = sample.genotypes.filter(gt => ~["0/0", "0/1", "1/1"].indexOf(gt));
            }
            this.notifySampleFilterChange();
        }

        // Mode of Inheritance
        if (this.modeOfInheritanceList.map(_ => _.id).includes(this.mode)) {
            this.onModeOfInheritance(this.mode);
        }

        if (this.mode === "COMPOUND_HETEROZYGOUS" || this.mode === "DE_NOVO" || this.mode === "MENDELIAN_ERROR") {
            this.sampleFilters.sample = this.clinicalAnalysis.proband.samples[0].id + ":" + this.mode;
            this.notifySampleFilterChange();
        }

        this.requestUpdate();
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
            // this.requestUpdate();
        }
    }
    getDefaultConfig() {
        return {
            defaultGenotypes: ["0/0", "0/1", "1/1"],
            // defaultGenotypes: [],
            showPedigree: false,
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
                #opencga-variant-filter-clinical {
                    /*font-size: 12px;*/
                }

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

                <div class="form-check col-md-12">
                    <div style="padding: 5px 5px 10px 5px; font-size: 14px">
                        You can manually select sample genotypes or select a <span style="font-weight: bold;margin: 0px">Mode of Inheritance</span>
                        such as RECESSIVE OR COMPOUND HETEROZYGOUS.
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="form-check-label mode-button">
                                <!--<select-field-filter ?multiple="\${true}" ?disabled=\${false} ?required=\${true} .data="\${["GT", "LT"]}" .value="\${"LT"}" maxOptions="2" @filterChange="\${e => console.log("ID", e.detail.value)}"></select-field-filter>-->
                        <select-field-filter
                            .data="${this.modeSelectData}"
                            value="${this.mode}"
                            .config="${{
                                liveSearch: false,
                                multiple: false
                            }}"
                            @filterChange="${this.setMode}">
                        </select-field-filter>
                                <!--<div>
                                    <button class="btn btn-default ripple \${this.mode === "custom" ? "active" : ""}" value="custom" @click="\${this.setSample}">Custom</button>
                                </div>
                                <div>
                                    <button class="btn btn-default ripple \${this.mode === "segregation" ? "active" : ""}" value="segregation" @click="\${this.setSample}">Segregation</button>
                                    <div class="select-field-filter-wrapper"><select-field-filter ?disabled="\${this.mode !== "segregation"}" .data="\${[{id: "MONOALLELIC", name: "Autosomal Dominant"}, {id: "BIALLELIC", name: "Autosomal Recessive"}, {id: "XLINKED_MONOALLELIC", name: "X-linked Dominant"}, {id: "XLINKED_BIALLELIC", name: "X-linked Recessive"}, {id: "YLINKED", name: "Y-linked"}]}" .value=\${"A"} @filterChange="\${e => this.onModeOfInheritance(e)}"></select-field-filter></div>
                                </div>
                                <div>
                                    <button class="btn btn-default ripple \${this.mode === "COMPOUND_HETEROZYGOUS" ? "active" : ""}" value="ch" @click="\${this.setSample}">Compound Heterozygous</button>
                                </div>
                                <div>
                                    <button class="btn btn-default ripple \${this.mode === "DE_NOVO" ? "active" : ""}" value="denovo" @click="\${this.setSample}">De Novo</button>
                                </div> -->
                    </div>
                </div>
                <div class="col-md-12">
                    <div>
                        <h4 style="padding-top: 10px; margin-bottom: 0px">Select Sample Genoypes</h4>
                        <table id="${this._prefix}BasicTable" class="table table-hover table-no-bordered">
                            <thead class="table-light">
                            <tr>
                                <th rowspan="2">Sample</th>
<!--                                <th rowspan="2">Proband</th>-->
                                <th rowspan="2">Role</th>
                                <th rowspan="2">Sex (karyotype)</th>
                                <th rowspan="2">Affected (${this.clinicalAnalysis.disorder.id})</th>
<!--                                <th rowspan="2">Father</th>-->
<!--                                <th rowspan="2">Mother</th>-->
                                <th rowspan="1" colspan="3" style="text-align: center">Genotypes</th>
                                <!--  <th rowspan="2">Min. Depth</th> -->
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
                                                      data-toggle="tooltip" data-placement="bottom">
                                                    ${sampleFilter.id}
                                                </span>
<!--                                                 &nbsp; <i class='fa \${this._config.sexIconMap[sampleFilter.sex]} fa-lg'></i>-->
                                            </div>
                                        </td>
                                        <td style="padding-left: 0px">
                                            <span style="color: ${sampleFilter.role.toUpperCase() === "PROBAND" ? "darkred" : "black"}">${sampleFilter.role}</span>
                                        </td>

                                        <td style="padding-left: 0px">
                                            <span>${sampleFilter.sex} (${sampleFilter.karyotypicSex})</span>
                                        </td>
                                        <td style="padding-left: 25px">
                                            ${sampleFilter.affected ? html`
                                                <span data-toggle="tooltip" data-placement="bottom" title="Affected"><i class='fa fa-check' style='color: green'></i></span>` : html`
                                                <span><i class='fa fa-times' style='color: red'></i></span>`
                                            }
                                        </td>
                                        <!--
                                            <td style="padding-left: 20px">
                                                <span>\${sampleFilter.father}</span>
                                            </td>
                                            <td style="padding-left: 20px">
                                                <span>\${sampleFilter.mother}</span>
                                            </td>
                                        -->
                                        <td style="padding-left: 20px">
                                            <input id="${this._prefix}${sampleFilter.id}00" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="0/0" data-sample-id="${sampleFilter.id}"
                                                   .checked="${sampleFilter.genotypes.includes("0/0")}" ?disabled="${this.mode !== "CUSTOM" || sampleFilter.role.toUpperCase() === "PROBAND"}" @change="${this.onSampleTableChange}">
                                        </td>
                                        <td style="padding-left: 20px">
                                            <input id="${this._prefix}${sampleFilter.id}01" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="0/1" data-sample-id="${sampleFilter.id}"
                                                   .checked="${sampleFilter.genotypes.includes("0/1")}" ?disabled="${this.mode !== "CUSTOM"}" @change="${this.onSampleTableChange}">
                                        </td>
                                        <td style="padding-left: 20px">
                                            <input id="${this._prefix}${sampleFilter.id}11" type="checkbox" class="sample-checkbox" aria-label="..." data-gt="1/1" data-sample-id="${sampleFilter.id}"
                                                   .checked="${sampleFilter.genotypes.includes("1/1")}" ?disabled="${this.mode !== "CUSTOM"}" @change="${this.onSampleTableChange}">
                                        </td>
                                        <!--<td style="padding-left: 10px">
                                            <input id="\${this._prefix}\${sampleFilter.id}DP" type="text" value="\${sampleFilter.dp !== undefined && sampleFilter.dp > 0 ? sampleFilter.dp : ""}"
                                                   class="form-control input-sm sample-dp-textbox" aria-label="..." placeholder="e.g. 15" data-sample-id="\${sampleFilter.id}"
                                                   style="width: 60px" @input="\${this.onSampleTableChange}">
                                        </td>-->
                                    </tr>
                                 `) : ""}
                            </tbody>
                        </table>
                    </div>
<!--                    <div id="\${this._prefix}BasicTableMessage" style="text-align: center"><span style="font-weight: bold">No Samples selected</span></div>-->
                </div>

                ${this.showModeOfInheritance && this.errorState? html`
                    <div class="col-md-12" style="padding: 10px 20px">
                        <div class="alert alert-danger" role="alert" id="${this._prefix}Warning">
                            <i class="fas fa-3x fa fa-exclamation-triangle align-middle"></i> The selected Mode of Inheritance is not compatible with the family pedigree.
                        </div>
                    </div>
                ` : null}



                ${this._config.showPedigree ? html`
                    <div class="col-md-12">
                        <h4 style="padding-top: 5px; padding-bottom: 10px">Pedigree</h4>
                        <pedigree-view .family="${this.clinicalAnalysis.family}"></pedigree-view>
                    </div>`
                : null}
            </div>
        `;
    }

}

customElements.define("variant-family-genotype-filter", VariantFamilyGenotypeFilter);
