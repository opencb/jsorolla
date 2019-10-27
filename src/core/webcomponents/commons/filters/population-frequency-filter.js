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

/*
* UX improvement: mouse drag for the numeric fields (e.g. jquery.stepper.js)
*
* */
export default class PopulationFrequencyFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            populationFrequencies: {
                type: Object
            },
            showSetAll: {
                type: Boolean
            }
        }
    }

    _init() {
        this._prefix = "pff-" + Utils.randomString(6) + "_";
        this.populationFrequenciesQuery = [];
    }

    firstUpdated(_changedProperties) {
        //TODO recheck block and debug
        let pfArray = [];
        if (this.query && typeof this.query["alternate_frequency"] !== "undefined") {
            pfArray = this.query["alternate_frequency"].split(new RegExp("[,;]"));
        }
        if (this.query && typeof  this.populationFrequencies !== "undefined" && typeof this.populationFrequencies.studies !== "undefined" && this.populationFrequencies.studies.length > 0) {
            for (let i = 0; i < this.populationFrequencies.studies.length; i++) {
                let study = this.populationFrequencies.studies[i].id;
                for (let j = 0; j < this.populationFrequencies.studies[i].populations.length; j++) {
                    let population = this.populationFrequencies.studies[i].populations[j].id;
                    if (pfArray.length > 0) {
                        for (let k = 0; k < pfArray.length; k++) {
                            let pf = pfArray[k];
                            if (pf.startsWith(study + ":" + population)) {
                                PolymerUtils.setValue(this._prefix + study + population, pf.split(/[<=>]+/)[1]);
                                PolymerUtils.setValue(this._prefix + study + population + "Operator", pf.split(/[-A-Za-z0-9._:]+/)[1]);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    filterChange(e) {
        //TODO refactor!
        let popFreq = [];
        if (this.populationFrequencies.studies && this.populationFrequencies.studies.length) {
            this.populationFrequencies.studies.forEach(study => {
                let study_id = study.id;
                if (study.populations && study.populations.length) {
                    study.populations.forEach(population => {
                        let population_id = population.id;
                        let studyTextbox = this.querySelector("#" + this._prefix + study_id + population_id);
                        if (studyTextbox && studyTextbox.value) {
                            let operator = this.querySelector("#" + this._prefix + study_id + population_id + "Operator");
                            let pf = study_id + ":" + population_id + operator.value + studyTextbox.value;
                            popFreq.push(pf);
                        }

                    })
                }
            })
        }
        console.log(popFreq);
        let event = new CustomEvent("filterChange", {
            detail: {
                value: popFreq ? popFreq.join(";") : null
            }
        });
        this.dispatchEvent(event);
    }

    handleCollapseAction(e) {
        let id = e.target.dataset.id;
        let elem = $("#" + id)[0];
        elem.hidden = !elem.hidden;
        if (elem.hidden) {
            e.target.className = "fa fa-plus";
        } else {
            e.target.className = "fa fa-minus";
        }
    }

    keyUpAllPopFreq(e) {
        let studyId = e.target.getAttribute("data-study");
        let study = this.populationFrequencies.studies.find( study => study.id === studyId);
        study.populations.forEach((popFreq) => {
            this.querySelector("#" + this._prefix + studyId + popFreq.id).value = e.target.value;
        });
        this.filterChange();
    }

    render() {
        return html`
            ${this.populationFrequencies.studies && this.populationFrequencies.studies.length && this.populationFrequencies.studies.map(study => html`
                <div style="padding-top: 10px">
                    <i id="${this._prefix}${study.id}Icon" data-id="${this._prefix}${study.id}" class="fa fa-plus"
                       style="cursor: pointer;padding-right: 10px" @click="${this.handleCollapseAction}"></i>
                    <strong>${study.title}</strong>
                    <div id="${this._prefix}${study.id}" class="form-horizontal" hidden>
                        ${this.showSetAll ? html`
                            <div class="form-group" style="margin: 5px 0px">
                                <span class="col-md-7 control-label" data-toggle="tooltip" data-placement="top"
                                      style="text-align: left;">Set all</span>
                                <div class="col-md-5" style="padding: 0px 10px">
                                    <input id="${this._prefix}${study.id}Input" type="number" data-study="${study.id}" value=""
                                           class="form-control input-sm ${this._prefix}FilterTextInput"
                                           name="${study.id}Input" @input="${this.keyUpAllPopFreq}">
                                </div>
                            </div>
                        ` : ""}
                        ${study.populations && study.populations.length && study.populations.map(popFreq => html`
                            <div class="form-group" style="margin: 5px 0px">
                                <span class="col-md-3 control-label" data-toggle="tooltip" data-placement="top" title="${popFreq.title}">${popFreq.id}</span>
                                <div class="col-md-4" style="padding: 0px 10px">
                                    <select id="${this._prefix}${study.id}${popFreq.id}Operator" name="${popFreq.id}Operator"
                                            class="form-control input-sm ${this._prefix}FilterSelect" style="padding: 0px 5px"
                                            @change="${this.filterChange}">
                                        <option value="<" selected>&lt;</option>
                                        <option value="<=">&le;</option>
                                        <option value=">">&gt;</option>
                                        <option value=">=">&ge;</option>
                                    </select>
                                </div>
                                <div class="col-md-5" style="padding: 0px 10px">
                                    <input id="${this._prefix}${study.id}${popFreq.id}" type="number" value="${this.commonValue}"
                                           class="form-control input-sm ${this._prefix}FilterTextInput"
                                           name="${study.id}_${popFreq.id}" @input="${this.filterChange}">
                                </div>
                            </div>
                        `)}
                    </div>
                </div>
            `)}
        `;
    }
}

customElements.define("population-frequency-filter", PopulationFrequencyFilter);
