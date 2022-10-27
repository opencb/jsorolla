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
import UtilsNew from "../../../core/utils-new.js";
import "../forms/select-field-filter.js";
import "../forms/number-field-filter.js";


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
            populationFrequencyAlt: {
                type: String
            },
            populationFrequencyIndexConfiguration: {
                type: Object
            },
            allowedFrequencies: {
                type: String
            },
            showSetAll: {
                type: Boolean
            },
            onlyPopFreqAll: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.showSetAll = false;

        this.state = {};
        this.comparatorState = {};
        this.defaultComparator = "<";

        // forces to show just the ALL popFreq
        this.onlyPopFreqAll = false;
    }

    // updated(changedProperties) {
    //     if (changedProperties.has("populationFrequencyAlt")) {
    //         this.populationFrequencyAltObserver();
    //     }
    // }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("populationFrequencies")) {
            this.populationFrequenciesObserver();
        }
        if (changedProperties.has("populationFrequencyAlt")) {
            this.populationFrequencyAltObserver();
        }
        if (changedProperties.has("populationFrequencyIndexConfiguration")) {
            this.populationFrequencyIndexConfigurationObserver();
        }
        super.update(changedProperties);
    }

    populationFrequenciesObserver() {
        if (this.populationFrequencies?.studies?.length) {
            this.state = {};
            if (!this.onlyPopFreqAll) {
                this._populationFrequencies = this.populationFrequencies;
                for (const study of this.populationFrequencies.studies) {
                    for (const population of study.populations) {
                        this.state[study.id + ":" + population.id] = {comparator: "<"};
                    }
                }
            } else {
                this._populationFrequencies = {studies: []};
                for (const study of this.populationFrequencies.studies) {
                    this._populationFrequencies.studies.push({
                        ...study,
                        populations: study.populations.filter(study => study.id === "ALL")
                    });
                    this.state[study.id + ":ALL"] = {comparator: "<"};
                }
            }
        }
    }

    populationFrequencyAltObserver() {
        // Reset this.state with the existing populations and default comparator
        this.populationFrequenciesObserver();

        // 1kG_phase3:EUR<2;GNOMAD_GENOMES:ALL<1;GNOMAD_GENOMES:AMR<2
        let pfArray = [];
        if (this.populationFrequencyAlt) {
            pfArray = this.populationFrequencyAlt.split(new RegExp("[,;]"));
            pfArray.forEach(queryElm => {
                const [study, pop] = queryElm.split(":");
                const [populationId, comparator, value] = pop.split(/(<=?|>=?|=)/);
                this.state[study + ":" + populationId] = {
                    comparator,
                    value
                };
            });
        } else {
            $("input[data-mode=all]").val("");
        }
        this.state = {...this.state};
        // this.requestUpdate();
    }

    populationFrequencyIndexConfigurationObserver() {
        if (this.populationFrequencyIndexConfiguration) {
            const populationFrequencyStudies = [];
            const populationFrequencyStudiesIndexMap = {};
            for (const population of this.populationFrequencyIndexConfiguration.populations) {
                if (populationFrequencyStudiesIndexMap[population.study] === undefined) {
                    populationFrequencyStudies.push(
                        {
                            id: population.study,
                            title: population.study,
                            populations: []
                        }
                    );
                    populationFrequencyStudiesIndexMap[population.study] = populationFrequencyStudies.length - 1;
                }
                populationFrequencyStudies[populationFrequencyStudiesIndexMap[population.study]].populations.push(
                    {
                        id: population.population
                    }
                );
            }
            this.allowedFrequencies = this.populationFrequencyIndexConfiguration.thresholds.join(",");
            this.populationFrequencies = {
                studies: populationFrequencyStudies
            };
            this.populationFrequenciesObserver();
        }
    }

    filterSelectChange(e, studyAndPopCode, type) {
        e.stopPropagation();
        if (this.state[studyAndPopCode]) {
            this.state[studyAndPopCode][type] = e.detail.value;
        } else {
            this.state[studyAndPopCode] = {};
            this.state[studyAndPopCode][type] = e.detail.value;
        }
        this.notify();
    }

    filterChange(e, studyAndPopCode) {
        // e.detail.value is not defined iff you are changing the comparator and a value hasn't been set yet
        if (e?.detail?.value) {
            e.stopPropagation();
            this.state[studyAndPopCode] = {comparator: e.detail.comparator, value: e.detail.numValue ?? e.detail.value};
        } else {
            delete this.state[studyAndPopCode];
        }
        this.notify();
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

    onSetAllFreqChange(e) {
        const studyId = e.target.getAttribute("data-study");
        const study = this.populationFrequencies.studies.find(study => study.id === studyId);
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

        this.notify();
    }

    notify() {
        const popFreqFilters = [];
        for (const [studyPopulationId, data] of Object.entries(this.state)) {
            if (data.comparator && data.value) {
                popFreqFilters.push(studyPopulationId + data.comparator + data.value);
            }
        }
        const event = new CustomEvent("filterChange", {
            detail: {
                value: popFreqFilters.length ? popFreqFilters.join(";") : null
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            comparators: [{id: "=", name: "="}, {id: "<", name: "<"}, {id: "<=", name: "&#8804;"}, {id: ">", name: ">"}, {id: ">=", name: "&#8805;"}]
        };
    }

    render() {
        if (!this._populationFrequencies?.studies?.length) {
            return html`No Population Frequencies defined`;
        }

        if (this.allowedFrequencies) {
            // Convert the String into an Array one single time here
            const allowedFrequenciesArray = this.allowedFrequencies.split(",");
            return html`
                ${this._populationFrequencies.studies.map(study => html`
                    <div style="padding-top: 10px">
                        <div style="margin-bottom: 5px">
                            <i id="${this._prefix}${study.id}Icon" data-id="${this._prefix}${study.id}" class="fa fa-plus" data-cy="pop-freq-toggle-${study.id}"
                               style="cursor: pointer;padding-right: 5px" @click="${this.handleCollapseAction}">
                            </i>
                            <strong>${study.title}</strong>
                        </div>
                        <div id="${this._prefix}${study.id}" class="form-horizontal" hidden data-cy="pop-freq-codes-wrapper-${study.id}">
                            ${study.populations && study.populations.length && study.populations.map(popFreq => html`
                                <div class="form-group" style="padding: 0px 5px;margin: 0px">
                                    <div class="col-md-2" style="padding: 0px">
                                        <div style="margin: 10px 0px">${popFreq.id}</div>
                                    </div>
                                    <div class="col-md-5" style="padding: 0 2px;">
                                        <select-field-filter    .data="${this._config.comparators}"
                                                                .value="${this.state[study.id + ":" + popFreq.id]?.comparator}"
                                                                @filterChange="${e => {
                                                                    this.filterSelectChange(e, study.id + ":" + popFreq.id, "comparator");
                                                                }}">
                                        </select-field-filter>
                                    </div>
                                    <div class="col-md-5" style="padding: 0 0 0 5px;">
                                        <select-field-filter    .data="${allowedFrequenciesArray}"
                                                                .value="${this.state[study.id + ":" + popFreq.id]?.value}"
                                                                placeholder="Frequency ..."
                                                                @filterChange="${e => {
                                                                    this.filterSelectChange(e, study.id + ":" + popFreq.id, "value");
                                                                }}">
                                        </select-field-filter>
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                `)}
            `;
        } else {
            return html`
                <style>
                    .set-all-form-wrapper {
                        margin: 5px 0px;
                    }

                    .set-all-form-wrapper > div:not(:first-child) {
                        padding: 0px 10px
                    }
                </style>

                ${this._populationFrequencies.studies.map(study => html`
                    <div style="padding-top: 10px">
                        <div style="margin-bottom: 5px">
                            <i id="${this._prefix}${study.id}Icon" data-id="${this._prefix}${study.id}" class="fa fa-plus" data-cy="pop-freq-toggle-${study.id}"
                               style="cursor: pointer;padding-right: 5px" @click="${this.handleCollapseAction}">
                            </i>
                            <strong>${study.title}</strong>
                        </div>
                        <div id="${this._prefix}${study.id}" class="form-horizontal" hidden data-cy="pop-freq-codes-wrapper-${study.id}">
                            ${this.showSetAll ? html`
                                <div class="set-all-form-wrapper form-group">
                                    <div class="col-md-7" data-toggle="tooltip" data-placement="top">Set all</div>
                                    <!--<div class="col-md-5"></div>-->
                                    <div class="col-md-5" style="padding: 0px 2px;">
                                        <input id="${this._prefix}${study.id}Input" type="text" data-mode="all" data-study="${study.id}"
                                               class="form-control input-sm ${this._prefix}FilterTextInput"
                                               name="${study.id}Input" @input="${this.onSetAllFreqChange}">
                                    </div>
                                </div>
                            ` : ""}
                            ${study.populations && study.populations.length && study.populations.map(popFreq => html`
                                <number-field-filter
                                    .value="${this.state[study.id + ":" + popFreq.id]?.value ?
                                        ((this.state[study.id + ":" + popFreq.id]?.comparator ?? this.defaultComparator) + this.state[study.id + ":" + popFreq.id]?.value) :
                                        ""}"
                                    .config="${{comparator: true, layout: [2, 5, 5]}}"
                                    .label="${popFreq.id}"
                                    type="text"
                                    @filterChange="${e => this.filterChange(e, `${study.id}:${popFreq.id}`)}">
                                </number-field-filter>
                            `)}
                        </div>
                    </div>
                `)}
            `;
        }
    }

}

customElements.define("population-frequency-filter", PopulationFrequencyFilter);
