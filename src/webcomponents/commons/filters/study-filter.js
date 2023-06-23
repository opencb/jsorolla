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

import {LitElement, html, nothing} from "lit";
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
            }
        };
    }

    #init() {
        $.fn.selectpicker.Constructor.BootstrapVersion = "5";
        this.elm = "selectpicker";
        this._prefix = UtilsNew.randomString(8);
        this.operator = ",";
        this.selectedStudies = [];
        this.differentStudies = [];
    }

    firstUpdated() {
        // init selectPicker
        this.selectPicker = $("#" + this.elm, this);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.selectedStudies = [this.opencgaSession.study.fqn];
            if (this.opencgaSession.project.studies.length) {
                this.differentStudies = this.opencgaSession.project.studies
                    .filter(study => this.opencgaSession.study.id !== study.id);
            }
            this.requestUpdate();
            this.updateComplete.then(() => {
                this.selectPicker.selectpicker("render");
            });
        }
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
        // const event = new CustomEvent("filterChange", {
        //     detail: {
        //         value: querystring
        //     }
        // });
        // this.dispatchEvent(event);
        LitUtils.dispatchCustomEvent(this, "filterChange", querystring);
    }

    onChangeOperator(e) {
        this.operator = e.target.value;
        this.filterChange();
    }

    onChangeSelectedStudy() {
        const selected = this.selectPicker.selectpicker("val");
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
            <div class="mb-3" id="${this._prefix}DifferentStudies">
                <select class="form-control" id="${this.elm}" multiple
                    @change="${this.onChangeSelectedStudy}">
                    <option value="${this.opencgaSession.study.fqn}"
                        selected="selected" disabled>${this.opencgaSession.study.name}</option>
                    ${this.differentStudies.length > 0 ?
                        this.differentStudies.map(study => html`
                            <option value="${study.fqn}">${study.name}</option>`) : nothing
                    }
                </select>
                <fieldset class="d-grid my-1 mx-0" ?disabled="${this.selectedStudies.length < 2}">
                    <div class="btn-group" role="group">
                        <input class="btn-check" id="${this._prefix}orInput" name="pss"
                            type="radio" value="," @change="${this.onChangeOperator}"
                            autocomplete="off" checked>
                        <label class="btn btn-outline-primary" for="${this._prefix}orInput">
                            In any of (OR)
                        </label>
                        <input class="btn-check" id="${this._prefix}andInput" name="pss"
                            type="radio" value=";" @change="${this.onChangeOperator}"
                            autocomplete="off">
                        <label class="btn btn-outline-primary" for="${this._prefix}andInput">
                            In all (AND)
                        </label>
                    </div>
                </fieldset>
            </div>
        `;
    }

}

customElements.define("study-filter", StudyFilter);
