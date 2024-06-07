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
import LitUtils from "../utils/lit-utils.js";
import "../forms/select-field-filter.js";


export default class StudyFilter extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            value: {
                type: String,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._studies = [];
        this._operator = ",";
        this._selection = [];
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("opencgaSession") || changedProperties.has("value")) {
            this.valueObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this._studies = [];
        if (this.opencgaSession?.project?.studies?.length) {
            // 1. Add current study as the first element and mark it as disabled
            this._studies.push({
                name: this.opencgaSession.study.name,
                id: this.opencgaSession.study.fqn,
                selected: true,
                disabled: true,
            });
            // 2. Add other studies to the studies dropdown
            this.opencgaSession.project.studies.forEach(study => {
                if (study.fqn !== this.opencgaSession.study.fqn) {
                    this._studies.push({
                        name: study.name,
                        id: study.fqn,
                    });
                }
            });
        }
    }

    valueObserver() {
        // 1. Reset the operator value. If the current value does not contain ';', maintain the current selected operator
        this._operator = (this.value || "").indexOf(";") > -1 ? ";" : this._operator;
        // 2. Reset the selection
        this._selection = Array.from(new Set([
            this.opencgaSession.study.fqn,
            ...(this.value || "").split(this._operator).filter(v => !!v),
        ]));
    }

    onStudyChange(event) {
        // 1. Split values returned from select-field-filter and remove empty items
        // Note: select-field-filter returns values joined with a comma charater
        const values = (event.detail.value || "")
            .split(",")
            .filter(value => !!value);
        // 2. Trigger 'filterChange' event with the values joined with the current operator
        LitUtils.dispatchCustomEvent(this, "filterChange", values.join(this._operator));
    }

    onOperatorChange(event) {
        // 1. Save the new operator value
        this._operator = event.target.value || ",";
        // 2. Trigger the 'filterChange' event
        LitUtils.dispatchCustomEvent(this, "filterChange", this._selection.join(this._operator));
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession && !this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No project available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <div class="form-group">
                <select-field-filter
                    .data="${this._studies}"
                    .value="${this._selection}"
                    .multiple="${true}"
                    @filterChange="${event => this.onStudyChange(event)}">
                </select-field-filter>
                <fieldset class="switch-toggle-wrapper">
                    <div class="switch-toggle text-white alert alert-light">
                        <input
                            id="${this._prefix}orInput"
                            name="studyFilterOperator"
                            type="radio"
                            value=","
                            ?checked="${this._operator === ","}"
                            ?disabled="${this._selection.length < 2}"
                            @change="${event => this.onOperatorChange(event)}"
                        />
                        <label for="${this._prefix}orInput" class="rating-label rating-label-or">In any of (OR)</label>
                        <input
                            id="${this._prefix}andInput"
                            name="studyFilterOperator"
                            type="radio"
                            value=";"
                            ?checked="${this._operator === ";"}"
                            ?disabled="${this._selection.length < 2}"
                            @change="${event => this.onOperatorChange(event)}"
                        />
                        <label for="${this._prefix}andInput" class="rating-label rating-label-and">In all (AND)</label>
                        <a class="btn btn-primary btn-small"></a>
                    </div>
                </fieldset>
            </div>
        `;
    }

}

customElements.define("study-filter", StudyFilter);
