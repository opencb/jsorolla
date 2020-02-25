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
            },
            populationFrequencyAlt: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "pff-" + Utils.randomString(6) + "_";
        this.populationFrequenciesQuery = [];
    }

    updated(_changedProperties) {
        let pfArray = [];
        if (this.populationFrequencyAlt) {
            pfArray = this.populationFrequencyAlt.split(new RegExp("[,;]"));
            // reset and update input fields and select fields
            //$("." + this._prefix + "FilterTextInput").val(""); //it is useless and it causes a bug when you use the set all field
            //$("." + this._prefix + "FilterTextInput").prop("disabled", false);
            if (typeof this.populationFrequencies !== "undefined" && typeof this.populationFrequencies.studies !== "undefined" && this.populationFrequencies.studies.length > 0) {
                pfArray.forEach(queryElm => {
                    const popFreq = queryElm.split(/[<=>]+/);
                    const [study, population] = popFreq[0].split(":");
                    const value = popFreq[1];
                    const operator = queryElm.split(/[-A-Za-z0-9._:]+/)[1];
                    this.querySelector("#" + this._prefix + study + population).value = value;
                    $("#" + this._prefix + study + population + "Operator").val(operator);
                });
            }
        } else {
            // this covers the case of opencga-active-filters deletes all populationFrequencyAlt filters
            $("." + this._prefix + "FilterTextInput").val("");
            //$("." + this._prefix + "FilterTextInput").prop("disabled", false);
        }
    }

    filterChange(e) {
        // TODO refactor!
        const popFreq = [];
        if (this.populationFrequencies.studies && this.populationFrequencies.studies.length) {
            this.populationFrequencies.studies.forEach(study => {
                const study_id = study.id;
                if (study.populations && study.populations.length) {
                    study.populations.forEach(population => {
                        const population_id = population.id;
                        const studyTextbox = this.querySelector("#" + this._prefix + study_id + population_id);
                        if (studyTextbox && studyTextbox.value) {
                            const operator = this.querySelector("#" + this._prefix + study_id + population_id + "Operator");
                            const pf = study_id + ":" + population_id + operator.value + studyTextbox.value;
                            popFreq.push(pf);
                        }
                    });
                }
            });
        }
        const event = new CustomEvent("filterChange", {
            detail: {
                value: popFreq ? popFreq.join(";") : null
            }
        });
        this.dispatchEvent(event);
    }

    handleCollapseAction(e) {
        const id = e.target.dataset.id;
        const elem = $("#" + id)[0];
        elem.hidden = !elem.hidden;
        if (elem.hidden) {
            e.target.className = "fa fa-plus";
        } else {
            e.target.className = "fa fa-minus";
        }
    }

    keyUpAllPopFreq(e) {
        const studyId = e.target.getAttribute("data-study");
        const study = this.populationFrequencies.studies.find(study => study.id === studyId);
        study.populations.forEach(popFreq => {
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
                                    <input id="${this._prefix}${study.id}Input" type="number" data-study="${study.id}"
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
                                    <input id="${this._prefix}${study.id}${popFreq.id}" type="number"
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
