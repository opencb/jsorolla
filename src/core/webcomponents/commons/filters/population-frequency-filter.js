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
import UtilsNew from "../../../utilsNew.js";
import "./number-field-filter.js";

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
        this._prefix = "pff-" + UtilsNew.randomString(6) + "_";
        this.populationFrequenciesQuery = [];
        this.state = {};
        this.defaultComparator = "<";
    }

    updated(_changedProperties) {
        if (_changedProperties.has("populationFrequencyAlt")) {
            this.populationFrequencyAltObserver();
        }
    }

    populationFrequencyAltObserver() {
        // 1kG_phase3:EUR<2;GNOMAD_GENOMES:ALL<1;GNOMAD_GENOMES:AMR<2
        let pfArray = [];
        if (this.populationFrequencyAlt) {

            if (!populationFrequencies?.studies?.length && !this.populationFrequencies) {
                console.error("populationFrequency data not available")
            }
            pfArray = this.populationFrequencyAlt.split(new RegExp("[,;]"));
            pfArray.forEach(queryElm => {
                const [, study, population, comparator, value] = queryElm.match(/([^\s]+):([^\s]+)(<=?|>=?)(-?\d*\.?\d+)/);
                this.state[study + ":" + population] = {
                    comparator,
                    value
                }
            });
        } else {
            this.state = {};
        }
        this.state = {...this.state};
        this.requestUpdate();
    }

    filterChange(e, studyAndPopCode) {
        //console.log("e?.detail?.value", e?.detail?.value, studyAndPopCode)
        if(e?.detail?.value) {
            e.stopPropagation();
            //const [, study, population, comparator, value] = e.detail.value.match(/([^\s]+):([^\s]+)(<=?|>=?)(-?\d*\.?\d+)/);
            //const [, comparator, value] = e.detail.value.match(/(<=?|>=?)(-?\d*\.?\d+)/);
            this.state[studyAndPopCode] = {comparator: e.detail.comparator, value: e.detail.numValue};
        }
        let r = [];
        for (let [study_popId, data] of Object.entries(this.state)) {
            r.push(study_popId + data.comparator + data.value)
        }
        const event = new CustomEvent("filterChange", {
            detail: {
                value: r.length ? r.join(";") : null
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
        const study = populationFrequencies.studies.find(study => study.id === studyId);
        study.populations.forEach(popFreq => {
            if (this.state[studyId + ":" + popFreq.id]) {
                this.state[studyId + ":" + popFreq.id].value = e.target.value;
            } else {
                this.state[studyId + ":" + popFreq.id] = {
                    comparator: "<",
                    value: e.target.value
                };
            }
        });
        this.state = {...this.state};
        this.requestUpdate();
        this.filterChange();
    }

    render() {
        if (!populationFrequencies?.studies?.length) {
            return html`No Population Frequencies defined`
        }
        return html`
            <style>
            .set-all-form-wrapper {
                    margin: 5px 0px;
                }              
                
                .set-all-form-wrapper > div:not(:first-child) {
                    padding: 0px 10px
                }
            </style>
            ${populationFrequencies.studies.map(study => html`
                <div style="padding-top: 10px">
                    <i id="${this._prefix}${study.id}Icon" data-id="${this._prefix}${study.id}" class="fa fa-plus"
                       style="cursor: pointer;padding-right: 10px" @click="${this.handleCollapseAction}"></i>
                    <strong>${study.title}</strong>
                    <div id="${this._prefix}${study.id}" class="form-horizontal" hidden>
                        ${this.showSetAll ? html`
                            <div class="set-all-form-wrapper form-group">
                                <div class="col-md-3 control-label" data-toggle="tooltip" data-placement="top">Set all</div>
                                <div class="col-md-3"></div>
                                <div class="col-md-6">
                                    <input id="${this._prefix}${study.id}Input" type="string" data-study="${study.id}"
                                           class="form-control input-sm ${this._prefix}FilterTextInput"
                                           name="${study.id}Input" @input="${this.keyUpAllPopFreq}">
                                </div>
                            </div>
                        ` : ""}
                        ${study.populations && study.populations.length && study.populations.map(popFreq => html`
                            <number-field-filter
                                .value="${this.state[study.id +":"+popFreq.id]?.value ? ((this.state[study.id +":"+popFreq.id]?.comparator ?? this.defaultComparator) + this.state[study.id +":"+popFreq.id]?.value) : "" }"
                                .config="${{comparator: true, layout: [3,3,6]}}" .label="${popFreq.id}"
                                type="string"
                                @filterChange="${e => this.filterChange(e, `${study.id}:${popFreq.id}`)}">
                            </number-field-filter>  
                        `)}
                    </div>
                </div>
            `)}
        `;
    }

}

customElements.define("population-frequency-filter", PopulationFrequencyFilter);
