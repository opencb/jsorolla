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
            query: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        //array of aliases of the studies currently active
        this.studies = this.query ? this.query.studies.split(new RegExp("[,;]")).map(study => study[1]) : [];
        this.operator = ";";
    }

    filterChange() {
        let primaryProject = this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias;
        let querystring;
        //AND or OR operators
        if(this.operator !=="!") {
            querystring = [primaryProject, ...this.studies.map(study => `${this.opencgaSession.project.alias}:${study}`)].join(this.operator);
        } else {
            //NOT operator
            querystring = [primaryProject, ...this.studies.map(study => `${this.operator}${this.opencgaSession.project.alias}:${study}`)].join(";");
        }
        console.log("filterChange event value:",querystring);
        let event = new CustomEvent('filterChange', {
            detail: {
                value: querystring
            }
        });
        this.dispatchEvent(event);
    }

    onChangeOperator(e) {
        if(e.target.value === "in")
            this.operator = ";";
        else if(e.target.value === "atleast")
            this.operator = ",";
        else if(e.target.value === "not in")
            this.operator = "!";
        this.filterChange();
    }
    
    onChangeStudy(e) {
        if(e.target.checked) {
            this.studies.push(e.target.value);
        } else {
            let indx = this.studies.indexOf(e.target.value);
            if(!~indx) {
                console.error("Trying to remove non active study");
            }
            this.studies.splice(indx);
        }
        this.filterChange();
    }

    render() {
        return html`
            <select class="form-control input-sm ${this._prefix}FilterSelect" id="${this._prefix}includeOtherStudy"
                    @change="${this.onChangeOperator}">
                <option value="in" selected>In all (AND)</option>
                <option value="atleast">In any of (OR)</option>
            </select>
            <div id="${this._prefix}DifferentStudies" class="form-group">
                <br>
                <input type="checkbox" value="${this.opencgaSession.study.alias}" data-id="${this.opencgaSession.study.id}" checked disabled>
                <span style="font-weight: bold;font-style: italic;color: darkred">${this.opencgaSession.study.alias}</span>
                ${this.differentStudies && this.differentStudies.length && this.differentStudies.map(study => html`
                    <br>
                    <input id="${this._prefix}${study.alias}Checkbox" type="checkbox" @change="${this.onChangeStudy}" value="${study.alias}" data-id="${study.id}" class="${this._prefix}FilterCheckBox" ?checked="${~this.studies.indexOf(study.alias)}" >
                    ${study.alias}
                 `)}
            </div>
        `;
    }
}

customElements.define('study-filter', StudyFilter);