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

export default class PopulationFrequencyFilter extends LitElement {

    constructor() {
        super();
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

    _init(){
        this._prefix = "pff-" + Utils.randomString(6) + "_";
    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    onChange(e) {
        //TODO fire a unique event
        console.log("populationFrequencyFilter change", e.target);
        let event = new CustomEvent('populationFrequencyFilterChange', {
            detail: {
                populationFrequency: e.target.value

            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
                        ${this.populationFrequencies.studies && this.populationFrequencies.studies.length && this.populationFrequencies.studies.map(study => html`
                            <div style="padding-top: 10px">
                                <i id="${this._prefix}${study.id}Icon" data-id="${this._prefix}${study.id}" class="fa fa-plus" style="cursor: pointer;padding-right: 10px" @click="${this.handleCollapseAction}"></i>
                                <strong>${study.title}</strong>
                                <div id="${this._prefix}${study.id}" class="form-horizontal" hidden>
                                    ${this.showSetAll ? html`
                                        <div class="form-group" style="margin: 5px 0px">
                                            <span class="col-md-7 control-label" data-toggle="tooltip" data-placement="top" style="text-align: left;">Set all</span>
                                            <div class="col-md-5" style="padding: 0px 10px">
                                                <input id="${this._prefix}${study.id}Input" type="text" data-study="${study.id}" value="" class="form-control input-sm ${this._prefix}FilterTextInput"
                                                name="${study.id}Input" @keyup="${this.keyUpAllPopFreq}" @change="${this.updateQueryFilters}" >
                                            </div>
                                        </div>
                                    ` : ""}
                                    ${study.populations && study.populations.length && study.populations.map(popFreq => html`
                                        <div class="form-group" style="margin: 5px 0px">
                                            <span class="col-md-3 control-label" data-toggle="tooltip" data-placement="top" title="${popFreq.title}">${popFreq.id}</span>
                                            <div class="col-md-4" style="padding: 0px 10px">
                                                <select id="${this._prefix}${study.id}${popFreq.id}Operator" name="${popFreq.id}Operator"
                                                        class="form-control input-sm ${this._prefix}FilterSelect" style="padding: 0px 5px" @change="${this.updateQueryFilters}">
                                                    <option value="<" selected><</option>
                                                    <option value="<="><=</option>
                                                    <option value=">">></option>
                                                    <option value=">=">>=</option>
                                                </select>
                                            </div>
                                            <div class="col-md-5" style="padding: 0px 10px">
                                                <input id="${this._prefix}${study.id}${popFreq.id}" type="text" value="" class="form-control input-sm ${this._prefix}FilterTextInput"
                                                        name="${study.id}_${popFreq.id}" @keyup="${this.updateQueryFilters}">
                                            </div>
                                        </div>
                                    `)}
                                </div>
                            </div>
                        `)}
                `;
    }
}

customElements.define('population-frequency-filter', PopulationFrequencyFilter);