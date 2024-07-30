/*
 * Copyright 2015-2024 OpenCB
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
        const getStateValue = (state, study, popFreq) => state[study.id + ":" + popFreq.id]?.value ?
            ((state[study.id + ":" + popFreq.id]?.comparator ?? this.defaultComparator) + state[study.id + ":" + popFreq.id]?.value) : "";

        if (!this._populationFrequencies?.studies?.length) {
            return html`No Population Frequencies defined`;
        }

        if (this.allowedFrequencies) {
            // Convert the String into an Array one single time here
            const allowedFrequenciesArray = this.allowedFrequencies.split(",");
            return html`
                ${this._populationFrequencies.studies.map(study => html`
                    <div class="mb-2">
                        <i id="${this._prefix}${study.id}Icon" data-id="${this._prefix}${study.id}" class="fa fa-plus" data-cy="pop-freq-toggle-${study.id}"
                            style="cursor: pointer" @click="${this.handleCollapseAction}">
                        </i>
                        <span class="form-label fw-bold">${study.title}</span>
                        <div class="row g-2"  id="${this._prefix}${study.id}" hidden data-cy="pop-freq-codes-wrapper-${study.id}">
                            ${study.populations && study.populations.length && study.populations.map(popFreq => html`
                                <label class="col-md-3 col-sm-2 col-form-label">
                                    >${popFreq.id}
                                </label>
                                <div class="col-md-4">
                                    <select-field-filter
                                        .data="${this._config.comparators}"
                                        .value="${this.state[study.id + ":" + popFreq.id]?.comparator}"
                                        @filterChange="${e => {
                                            this.filterSelectChange(e, study.id + ":" + popFreq.id, "comparator");
                                        }}">
                                    </select-field-filter>
                                </div>
                                <div class="col-md-5">
                                    <select-field-filter
                                        .data="${allowedFrequenciesArray}"
                                        .value="${this.state[study.id + ":" + popFreq.id]?.value}"
                                        .config="${{
                                            placeholder: "Frequency ..."
                                        }}"
                                        @filterChange="${e => {
                                            this.filterSelectChange(e, study.id + ":" + popFreq.id, "value");
                                        }}">
                                    </select-field-filter>
                                </div>
                            `)}
                        </div>
                    </div>
                `)}
            `;
        } else {
            return html`
                ${this._populationFrequencies.studies.map(study => html`
                    <div class="mb-2">
                        <i class="fa fa-plus ps-1" id="${this._prefix}${study.id}Icon" data-id="${this._prefix}${study.id}" data-cy="pop-freq-toggle-${study.id}"
                            style="cursor: pointer;"
                            @click="${this.handleCollapseAction}">
                        </i>
                        <span class="text-break fw-bold">${study.title}</span>
                        <div class="row g-2" id="${this._prefix}${study.id}" hidden data-cy="pop-freq-codes-wrapper-${study.id}">
                            ${this.showSetAll ? html`
                                    <label class="form-label text-center col-sm-7 col-md-7" data-bs-toggle="tooltip">Set all</label>
                                    <div class="col-sm-5">
                                        <input class="form-control input-sm ${this._prefix}FilterTextInput" id="${this._prefix}${study.id}Input"
                                            type="text" data-mode="all" data-study="${study.id}"
                                            name="${study.id}Input" @input="${this.onSetAllFreqChange}">
                                    </div>
                            ` : ""}
                            ${study.populations && study.populations.length && study.populations.map(popFreq => {
                                const stateValue = getStateValue(this.state, study, popFreq);
                                return html`
                                    <number-field-filter
                                        .value="${stateValue}"
                                        .config="${{
                                            comparator: true,
                                            layout: [2, 5, 5]
                                        }}"
                                        .label="${popFreq.id}"
                                        data-study="${study.id}"
                                        type="text"
                                        @filterChange="${e => this.filterChange(e, `${study.id}:${popFreq.id}`)}">
                                    </number-field-filter>
                                `;
                            })}
                        </div>
                    </div>
                `)}
            `;
        }
    }

}

customElements.define("population-frequency-filter", PopulationFrequencyFilter);
