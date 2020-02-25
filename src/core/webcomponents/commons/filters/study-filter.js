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
import "./select-field-filter.js";


//TODO continue, bootstrap-select doesn't evaluate as selected a disabled option, but in case of AND/OR operator selected we need both

export default class StudyFilter extends LitElement {

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
            differentStudies: {
                type: Object
            },
            //part of the query object
            studies: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        this.operator = ";";
        this.differentStudies = [];
        //this._selectStudies = [];
        this._studies = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.primaryProject = this.opencgaSession.study.fqn;
        //this._selectStudies = [this.primaryProject];
        this._studies = [this.primaryProject];
    }

    firstUpdated(_changedProperties) {
        $(".selectpicker", this).selectpicker("val", this.opencgaSession.study.fqn);
    }

    updated(_changedProperties) {
        if (_changedProperties.has("differentStudies")) {
            //this._selectStudies = [{id: this.opencgaSession.study.fqn, name: this.opencgaSession.study.name}, ...this.differentStudies.map( _ => ({id: _.fqn, name: _.name}))];
            this.requestUpdate().then( () => $(".selectpicker", this).selectpicker("refresh"));
        }

        if (_changedProperties.has("studies")) {
            this._studies = this.studies ? this.studies.split(new RegExp("[,;]")) : [this.primaryProject];
            $(".selectpicker", this).selectpicker("val", this._studies);
            this.requestUpdate();
            // this shouldn't be necessary since this.studies is being updated..
            // this.requestUpdate();
            // NOTE Do NOT fire filterChange in updated(), it would interferes with other filters changes and active-filters
        }
    }

    filterChange() {
        let querystring;
        // AND or OR operators
        if (this.operator !== "!") {
            querystring = [...this._studies.map(study => `${study}`)].join(this.operator);
        } else {
            // NOT operator (not visible/not implemented)
            querystring = [...this._studies.map(study => `${this.operator}${study}`)].join(";");
        }
        const event = new CustomEvent("filterChange", {
            detail: {
                value: querystring
            }
        });
        this.dispatchEvent(event);
        // this.requestUpdate();
    }

    onChangeOperator(e) {
        this.operator = e.target.value;
        this.filterChange();
    }

    onChangeStudy(e) {
        console.log(e)
        console.log($(".selectpicker", this).selectpicker("val"));

        const study = e.target.dataset.id;
        if (e.target.checked) {
            this._studies.push(study);
        } else {
            const indx = this._studies.indexOf(study);
            if (!~indx) {
                console.error("Trying to remove non active study");
            } else {
                this._studies.splice(indx);
            }
        }
        this.filterChange();
    }

    onChangeSelectedStudy(e) {
        const selected = $(".selectpicker", this).selectpicker("val");
        this._studies = [this.primaryProject, ...selected];
        this.requestUpdate();
        this.filterChange();
    }

    render() {
        return html`
           <!-- <select class="form-control input-sm ${this._prefix}FilterSelect" id="${this._prefix}includeOtherStudy"
                    @change="${this.onChangeOperator}">
                    <option value="in" selected>In all (AND)</option>
                    <option value="atleast">In any of (OR)</option>
                </select>
            
                <input type="checkbox" value="${this.opencgaSession.study.alias}" data-id="${this.opencgaSession.study.id}" checked disabled>
                <span style="font-weight: bold;font-style: italic;color: darkred">${this.opencgaSession.study.alias}</span>
                ${this.differentStudies && this.differentStudies.length ? this.differentStudies.map(study => html`
                    <br>
                    <input id="${this._prefix}${study.alias}Checkbox" type="checkbox" @change="${this.onChangeStudy}" value="${study.alias}" data-id="${study.fqn}" class="${this._prefix}FilterCheckBox" .checked="${~this._studies.indexOf(study.fqn)}" >
                     ${study.alias}
                 `) : null}
                
           --> 
                
                
            <div id="${this._prefix}DifferentStudies" class="form-group">
                <br>
                <select multiple class="form-control input-sm selectpicker" id="${this._prefix}includeOtherStudy"
                    @change="${this.onChangeSelectedStudy}">
                    <option value="${this.opencgaSession.study.fqn}" disabled>${this.opencgaSession.study.name}</option>
                    ${this.differentStudies && this.differentStudies.length ? this.differentStudies.map(study => html`
                        <option value="${study.fqn}">${study.alias}</option>
                    `) : null }
                </select>
                <fieldset class="switch-toggle-wrapper">
                    <div class="switch-toggle text-white alert alert-light">
                        <input id="${this._prefix}orInput" name="pss" type="radio" value="," checked ?disabled="${this._studies.length < 2}" @change="${this.onChangeOperator}" />
                        <label for="${this._prefix}orInput" class="rating-label rating-label-or">In any of (OR)</label>
                        <input id="${this._prefix}andInput" name="pss" type="radio" value=";" ?disabled="${this._studies.length < 2}" @change="${this.onChangeOperator}"/>
                        <label for="${this._prefix}andInput" class="rating-label rating-label-and">In all (AND)</label>
                        <a class="btn btn-primary ripple btn-small"></a>
                    </div>
                </fieldset>
            </div>
        `;
    }

}

customElements.define("study-filter", StudyFilter);
