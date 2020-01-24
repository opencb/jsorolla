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

import {LitElement, html} from '/web_modules/lit-element.js';

export default class OpencgaVariantCohortStats extends LitElement {

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
            variant: {
                type: String,
                observer: "variantObserver"
            },
            active: {
                type: Boolean,
                observer: "activeObserver"
            },
            config: {
                type: Object
            }
        }
    }

    _init() {
        this._prefix = "ovcs-" + Utils.randomString(6) + "_";
        this.active = false;
    }

    updated(_changedProperties) {
        if(_changedProperties.has("variant")) {
            this.variantObserver();
        }

        if(_changedProperties.has("active")) {
            this.activeObserver();
        }
    }

    //TODO why 2 functions?
    activeObserver(e) {
        this._fetchCohortStats(e);
    }

    variantObserver(e) {
        this._fetchCohortStats(e);
    }

    _fetchCohortStats(e) {
        if (UtilsNew.isNotUndefinedOrNull(this.variant) && this.variant.split(':').length > 2 && this.active) {
            let [chromosome, start, ref, alt] = this.variant.split(":");
            this.region = new Region(chromosome + ":" + start);
            let params = {
                id: this.variant,
                studies: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
                includeStudy: "all",
                exclude: "annotation,studies.files,studies.samplesData",
                useSearchIndex: "no"
            };

            let cohorts = {};
            for (let section of this.config.sections) {
                for (let subsection of section.subsections) {
                    if (subsection.id === "cohort") {
                        // let _cohorts = subsection.cohorts[this.opencgaSession.project.id];
                        if (UtilsNew.isNotUndefinedOrNull(subsection.cohorts[this.opencgaSession.project.id])) {
                            for (let _study of Object.keys(subsection.cohorts[this.opencgaSession.project.id])) {
                                cohorts[_study] = new Set();
                                for (let cohort of subsection.cohorts[this.opencgaSession.project.id][_study]) {
                                    cohorts[_study].add(cohort.id);
                                }
                            }
                        }
                        break;
                    }
                }
            }

            let _this = this;
            this.opencgaSession.opencgaClient.variants().query(params)
                .then(function (response) {
                    if (typeof response.response[0].result[0] !== "undefined") {
                        let _variantStudies = response.response[0].result[0].studies;
                        for (let i = 0; i < _variantStudies.length; i++) {
                            let study = _variantStudies[i].studyId.split(':')[1];
                            let statsObject = _variantStudies[i].stats;
                            let statsArray = [];
                            Object.keys(statsObject).map(key => {
                                if (typeof statsObject[key].mafAllele !== "undefined" && statsObject[key].mafAllele !== -1
                                    && (cohorts[study] === undefined || cohorts[study].has(key))) {
                                    statsObject[key].maf = _this._freqFormatter(statsObject[key].maf || 0);
                                    statsObject[key].mafAllele = statsObject[key].mafAllele || '-';
                                    if (statsObject[key].alleleCount < 0) {
                                        statsObject[key].alleleCount = statsObject[key].refAlleleCount + statsObject[key].altAlleleCount;
                                    }
                                    statsObject[key].numSamples = Math.round(statsObject[key].alleleCount / 2);

                                    statsObject[key].refAlleleFreq = _this._freqFormatter(statsObject[key].refAlleleFreq || 0);
                                    // statsObject[key].alleleCountRef = statsObject[key].refAlleleCount;
                                    statsObject[key].altAlleleFreq = _this._freqFormatter(statsObject[key].altAlleleFreq || 0);
                                    // statsObject[key].alleleCountAlt = statsObject[key].altAlleleCount;

                                    statsObject[key].genotypeFreq.homref = _this._freqFormatter(statsObject[key].genotypeFreq["0/0"] || statsObject[key].genotypeFreq["0|0"] || 0);
                                    statsObject[key].genotypeFreq.het = _this._freqFormatter(statsObject[key].genotypeFreq["0/1"] || statsObject[key].genotypeFreq["0|1"] || 0);
                                    statsObject[key].genotypeFreq.homalt = _this._freqFormatter(statsObject[key].genotypeFreq["1/1"] || statsObject[key].genotypeFreq["1|1"] || 0);

                                    statsObject[key].genotypeCount.homref = statsObject[key].genotypeCount["0/0"] || statsObject[key].genotypeCount["0|0"] || 0;
                                    statsObject[key].genotypeCount.het = statsObject[key].genotypeCount["0/1"] || statsObject[key].genotypeCount["0|1"] || 0;
                                    statsObject[key].genotypeCount.homalt = statsObject[key].genotypeCount["1/1"] || statsObject[key].genotypeCount["1|1"] || 0;

                                    if (key === "ALL") {
                                        statsArray.unshift({
                                            name: key,
                                            value: statsObject[key],
                                            study: study
                                        })
                                    } else {
                                        statsArray.push({
                                            name: key,
                                            value: statsObject[key],
                                            study: study
                                        })
                                    }
                                }
                            });
                            _variantStudies[i].stats = statsArray;
                        }
                        _this.set("variantStudies", _variantStudies);
                    }
                })
                .catch(function (reason) {
                    console.error(reason)
                });
        }
    }

    // TODO remove this function in OpenCGA 1.4.x since we will use new Study.id instead of Study.alias
    getStudy(study) {
        if (study !== undefined) {
            let fields = study.split(':');
            return fields[fields.length - 1];
        }
        return "";
    }

    _freqFormatter(value) {
        if (value !== 0 && value !== 1) {
            return Number(value).toFixed(5);
        }
        return value;
    }

    handleCollapseAction(e) {
        let id = e.target.dataset.id;
        let elem = $('#' + this._prefix + id)[0];
        elem.hidden = !elem.hidden;
        if (elem.hidden) {
            e.target.className = "fa fa-plus-circle";
        } else {
            e.target.className = "fa fa-minus-circle";
        }
    }

    render() {
        return html`
                <style include="jso-styles"></style>
            
                ${this.variantStudies && this.variantStudies.length && this.variantStudies.map(study => html`
                    <h4 style="font-weight: bold;padding: 20px 0px 0px 0px">
                        <i class="fa fa-minus-circle" @click="${this.handleCollapseAction}" data-id="${this.getStudy(study.alias)}"
                           style="cursor: pointer"></i> #RECHECK data-id$#
                        &nbsp;${this.getStudy(study.studyId)}
                    </h4>
                    <div id="${this._prefix}${this.getStudy(study.alias)}">
                        ${study.stats.length ? html`
                            <div style="padding: 5px 20px">
                                <table class="table table-bordered">
                                    <thead style="background-color: #eee;">
                                    <tr>
                                        <th scope="col" rowspan="2">Cohort</th>
                                        <!--<th scope="col" rowspan="2">Reference</th>-->
                                        <!--<th scope="col" rowspan="2">Alternate</th>-->
                                        <th scope="col" rowspan="2">MAF (allele)</th>
                                        <th scope="col" rowspan="2">Number of Samples</th>
                                        <th colspan="2" scope="colgroup" style="text-align: center">Allele Frequencies</th>
                                        <th colspan="3" scope="colgroup" style="text-align: center">Genotype Frequencies</th>
                                    </tr>
                                    <tr>
                                        <th scope="col">Reference</th>
                                        <th scope="col">Alternate</th>
                                        <th scope="col">Ref/Ref</th>
                                        <th scope="col">Ref/Alt</th>
                                        <th scope="col">Alt/Alt</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    ${study.stats.map( cohort => html`
                                        <tr>
                                            <td>${this.cohort.name}}</td>
                                            <!--<td>${this.cohort.value.refAllele}</td>-->
                                            <!--<td>${this.cohort.value.altAllele}</td>-->
                                            <td>${this.cohort.value.maf} (${this.cohort.value.mafAllele})</td>
                                            <td>${this.cohort.value.numSamples}</td>
                                            <td>${this.cohort.value.refAlleleFreq} (${this.cohort.value.refAlleleCount})</td>
                                            <td>${this.cohort.value.altAlleleFreq} (${this.cohort.value.altAlleleCount})</td>
                                            <td>${this.cohort.value.genotypeFreq.homref} (${this.cohort.value.genotypeCount.homref})</td>
                                            <td>${this.cohort.value.genotypeFreq.het} (${this.cohort.value.genotypeCount.het})</td>
                                            <td>${this.cohort.value.genotypeFreq.homalt} (${this.cohort.value.genotypeCount.homalt})</td>
                                        </tr>                                    
                                    `)}
                                    </tbody>
                                </table>
                            </div>
                        ` : html`
                            <div style="padding: 5px 20px">
                                No Genotypes statistics available
                            </div>
                        `}
                    </div>
                `)}
        `;
    }
}

customElements.define('opencga-variant-cohort-stats', OpencgaVariantCohortStats);
