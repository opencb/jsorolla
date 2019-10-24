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

export default class CohortFilter extends LitElement {

    constructor() {
        super()
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cellbaseClient: {
                type: Object
            },
            cohorts: {
                type: Array
            },
            config: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "cf-" + Utils.randomString(6) + "_";
        this.cohortsPerStudy = this.cohorts[this.opencgaSession.project.id];
        console.log("this.cohortsPerStudy",this.cohortsPerStudy)

    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    onChange(e) {
        //TODO fire a unique event
        console.log("cohort change", e.target)
        let event = new CustomEvent('cohortFilterChange', {
            detail: {
                cohort: e.target.value

            }
        });
        this.dispatchEvent(event);
    }

    //todo implement logic 
    
    render() {
        return this.cohortsPerStudy ? html`
            ${Object.keys(this.cohortsPerStudy).map(study => html`
                <div style="padding: 5px 0px">
                    <div style="padding-bottom: 5px">
                        <span style="font-style: italic">COHORT HTML${study}</span> study:
                    </div>
                    <div class="form-horizontal">
                        ${this.cohortsPerStudy[study] && this.cohortsPerStudy[study].map(cohort => html`
                            <div class="form-group" style="margin: 5px 0px">
                                <span class="col-md-4 control-label">${cohort.name}</span>
                                <div class="col-md-4" style="padding: 0px 10px">
                                    <select id="${this._prefix}${study}${cohort.id}CohortOperator" name="${cohort.id}Operator"
                                            class="form-control input-sm ${this._prefix}FilterSelect" style="padding: 0px 5px" @change="${this.onChange}">
                                        <option value="<" selected><</option>
                                        <option value="<="><=</option>
                                        <option value=">">></option>
                                        <option value=">=">>=</option>
                                    </select>
                                </div>
                                <div class="col-md-4" style="padding: 0px 10px">
                                    <input type="text" value="" class="form-control input-sm ${this._prefix}FilterTextInput"
                                           name="${study}_${cohort.id}" id="${this._prefix}${study}${cohort.id}Cohort" @change="${this.onChange}">
                                </div>
                            </div>
                        `)}
                    </div>
                </div>`)}
        ` : html`
            <span>Project not found</span>
        `;
    }
}

customElements.define('cohort-filter',CohortFilter);