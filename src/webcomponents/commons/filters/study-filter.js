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
                type: Object
            },
            value: {
                type: String,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.operator = ",";
        this.selectedStudies = [];
        this.differentStudies = [];
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            if (this.opencgaSession?.project?.studies?.length) {
                this.differentStudies = this.opencgaSession.project.studies.filter(study => this.opencgaSession.study.id !== study.id);
            }
        }

        if (changedProperties.has("opencgaSession") || changedProperties.has("value")) {
            this.selectedStudies = Array.from(new Set([
                this.opencgaSession.study.fqn,
                ...(this.value || "").split(this.operator).filter(v => !!v),
            ]));
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            $(".selectpicker", this).selectpicker("refresh");
        }
        $(".selectpicker", this).selectpicker("val", this.selectedStudies);
    }

    filterChange() {
        let querystring;
        // AND or OR operators
        if (this.operator !== "!") {
            querystring = [...this.selectedStudies.map(study => `${study}`)].join(this.operator);
        } else {
            // NOT operator (not visible/not implemented)
            querystring = [...this.selectedStudies.map(study => `${this.operator}${study}`)].join(";");
        }
        LitUtils.dispatchCustomEvent(this, "filterChange", querystring);
    }

    onChangeOperator(e) {
        this.operator = e.target.value;
        this.filterChange();
    }

    onChangeSelectedStudy() {
        const selected = $(".selectpicker", this).selectpicker("val");
        // Active study is always the first element
        this.selectedStudies = [this.opencgaSession.study.fqn, ...selected];
        this.requestUpdate();
        this.filterChange();
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
            <div id="${this._prefix}DifferentStudies" class="form-group">
                <select multiple class="form-control input-sm selectpicker" id="${this._prefix}includeOtherStudy"
                    @change="${this.onChangeSelectedStudy}">
                    <option value="${this.opencgaSession.study.fqn}" selected="selected" disabled>${this.opencgaSession.study.name}</option>
                    ${(this.differentStudies || []).map(study => html`
                        <option value="${study.fqn}">${study.name}</option>
                    `)}
                </select>
                <fieldset class="switch-toggle-wrapper">
                    <div class="switch-toggle text-white alert alert-light">
                        <input id="${this._prefix}orInput" name="pss" type="radio" value="," checked ?disabled="${this.selectedStudies.length < 2}" @change="${this.onChangeOperator}" />
                        <label for="${this._prefix}orInput" class="rating-label rating-label-or">In any of (OR)</label>
                        <input id="${this._prefix}andInput" name="pss" type="radio" value=";" ?disabled="${this.selectedStudies.length < 2}" @change="${this.onChangeOperator}"/>
                        <label for="${this._prefix}andInput" class="rating-label rating-label-and">In all (AND)</label>
                        <a class="btn btn-primary ripple btn-small"></a>
                    </div>
                </fieldset>
            </div>
        `;
    }

}

customElements.define("study-filter", StudyFilter);
