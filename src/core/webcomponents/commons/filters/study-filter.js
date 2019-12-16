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
            studies: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        this.operator = ";";
        //FIXME this component uses this._studies as an array of aliases, while it receives in query an array of pairs fqn:alias, this is a problem with saved filters
        //array of aliases of the studies currently active
        this._studies = [];
    }

    firstUpdated(_changedProperties) {
        this.primaryProject = this.opencgaSession.project.fqn + ":" + this.opencgaSession.study.alias;
    }

    updated(_changedProperties) {
        if (_changedProperties.has("studies")) {
            console.log("updated",this.studies)
            this._studies = this.studies ? this.studies.split(new RegExp("[,;]")) : [this.primaryProject];
            //this shouldn't be necessary since this.studies is being updated..
            //this.requestUpdate();
            //NOTE Do NOT fire filterChange in updated(), it would interferes with other filters changes and active-filters
        }
    }

    filterChange() {
        let querystring;
        // AND or OR operators
        if (this.operator !== "!") {
            querystring = [this.primaryProject, ...this._studies.map(study => `${this.opencgaSession.project.fqn}:${study}`)].join(this.operator);
        } else {
            // NOT operator
            querystring = [this.primaryProject, ...this._studies.map(study => `${this.operator}${this.opencgaSession.project.fqn}:${study}`)].join(";");
        }
        const event = new CustomEvent("filterChange", {
            detail: {
                value: querystring
            }
        });
        this.dispatchEvent(event);
        //this.requestUpdate();
    }

    onChangeOperator(e) {
        if (e.target.value === "in") {
            this.operator = ";";
        } else if (e.target.value === "atleast") {
            this.operator = ",";
        } else if (e.target.value === "not in") {
            this.operator = "!";
        }
        this.filterChange();
    }

    onChangeStudy(e) {
        const study = e.target.value;
        console.log("onChangeStudy",e.target.checked)
        if (e.target.checked) {
            this._studies.push(study);
            console.log("ADDING")
        } else {
            const indx = this._studies.indexOf(study);
            console.error("indx",indx, "study",study)
            if (!~indx) {
                console.error("Trying to remove non active study");
            } else {
                console.log("REMOVING")
                this._studies.splice(indx);
            }
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
                    this._studies.indexOf(study.alias) ${this._studies.indexOf(study.alias)}
                    <input id="${this._prefix}${study.alias}Checkbox" type="checkbox" @change="${this.onChangeStudy}" value="${study.alias}" data-id="${study.id}" class="${this._prefix}FilterCheckBox" .checked="${~this._studies.indexOf(study.alias)}" >
                     ${study.alias}
                 `)}
            </div>
        `;
    }
}

customElements.define('study-filter', StudyFilter);
