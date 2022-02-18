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
import UtilsNew from "../../../core/utilsNew.js";

export default class ProteinSubstitutionScoreFilter extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            proteinSubstitution: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.POLYPHEN_FIRST_REGEX = /(?<polyphen>polyphen([a-zA-z0-9,. =<>]+))(?<op>[,;])(?<sift>sift([a-zA-z0-9,. =<>]+))/;
        this.SIFT_FIRST_REGEX = /(?<sift>sift([a-zA-z0-9,. =<>]+))(?<op>[,;])(?<polyphen>polyphen([a-zA-z0-9,. =<>]+))/;

        this.state = this.defaultState();
        this.polyphenKeys = [
            {id: "score", name: "Score"},
            {id: "benign", name: "Benign"},
            {id: "unknown", name: "Unknown"},
            {id: "possibly damaging", name: "Possibly damaging"},
            {id: "probably damaging", name: "Probably damaging"},
            // {id: "possibly damaging,probably damaging", name: "Possibly & Probably damaging"}
        ];
        this.siftKeys = [
            {id: "score", name: "Score"},
            {id: "tolerated", name: "Tolerated"},
            {id: "deleterious", name: "Deleterious"}
        ];
        this.logicalOperator = ","; // OR=, AND=;
        this.logicalSwitchDisabled = true;
    }

    update(changedProperties) {
        if (changedProperties.has("proteinSubstitution")) {
            this.state = this.defaultState();
            if (this.proteinSubstitution) {
                let pss;
                if (this.proteinSubstitution.includes("polyphen") && this.proteinSubstitution.includes("sift")) {
                    let match;
                    if (this.proteinSubstitution.startsWith("polyphen")) {
                        match = this.proteinSubstitution.match(this.POLYPHEN_FIRST_REGEX);
                    } else {
                        match = this.proteinSubstitution.match(this.SIFT_FIRST_REGEX);
                    }
                    this.logicalOperator = match.groups.op;
                    pss = [match.groups.polyphen, match.groups.sift];
                } else {
                    pss = this.proteinSubstitution;
                }

                this.logicalSwitchDisabled = pss.length <= 1;
                if (pss.length > 0) {
                    pss.forEach(ps => {
                        const [field, comparator, value] = ps.split(/(<=?|>=?|=)/);
                        // it discriminates between `score` and other keys
                        const s = (isNaN(value) ? {type: value} : {type: "score", value: value});
                        this.state[field] = {
                            comparator,
                            ...s
                        };
                    });
                }
            }
        }
        super.update(changedProperties);
    }

    filterChange(field, data) {
        this.state[field] = {...this.state[field], ...data};
        this.serialisedState = [];
        Object.entries(this.state).forEach(([_field, data]) => {
            if (data.type === "score") {
                if (data.value?.trim()) {
                    this.serialisedState.push(`${_field}${data.comparator}${data.value}`);
                }
            } else {
                this.serialisedState.push(`${_field}=${data.type}`);
            }
        });
        this.logicalSwitchDisabled = this.serialisedState.length <= 1;
        this.requestUpdate();
        this.notify();
    }

    onLogicalOperatorChange(e) {
        this.logicalOperator = e.target.value;
        this.notify();
    }

    notify() {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: this.serialisedState.join(this.logicalOperator)
            }
        });
        this.dispatchEvent(event);
    }

    defaultState() {
        return {
            "polyphen": {type: "score", comparator: ">"},
            "sift": {type: "score", comparator: ">"}
        };
    }

    render() {
        return html`
            <style>
                .score-select {
                    padding-right: 5px;
                }
                .score-comparator {
                    padding-left: 5px;
                    padding-right: 5px;
                }
                .score-value {
                    padding-left: 5px;
                }
            </style>
            <div class="form-group sift">
                <span style="padding-top: 10px;padding-left: 0px;">SIFT</span>
                <div class="row">
                    <div class="col-md-4 control-label score-select">
                        <select-field-filter .data="${this.siftKeys}" .value=${this.state["sift"].type} @filterChange="${e => this.filterChange("sift", {type: e.detail.value})}"></select-field-filter>
                    </div>
                    <div class="col-md-3 score-comparator">
                        <select id="${this._prefix}Comparator" name="${this._prefix}Comparator"
                                class="form-control input-sm ${this._prefix}FilterSelect"
                                @change="${e => this.filterChange("sift", {comparator: e.target.value})}" .disabled="${this.state["sift"].type !== "score"}">
                            <option .selected="${this.state["sift"].comparator === "="}" value="=">=</option>
                            <option .selected="${this.state["sift"].comparator === "<"}" value="<">&lt;</option>
                            <option .selected="${this.state["sift"].comparator === "<="}" value="<=">&le;</option>
                            <option .selected="${this.state["sift"].comparator === ">"}" value=">">&gt;</option>
                            <option .selected="${this.state["sift"].comparator === ">="}" value=">=">&ge;</option>
                        </select>
                    </div>
                    <div class="col-md-5 score-value">
                        <input type="text" class="form-control input-sm FilterTextInput" @input="${e => this.filterChange("sift", {value: e.target.value})}" .disabled="${this.state["sift"].type !== "score"}" .value="${this.state["sift"].value ?? ""}">
                    </div>
                </div>
            </div>

            <div class="form-group polyphen">
                <span style="padding-top: 10px;padding-left: 0px;">Polyphen</span>
                <div class="row">
                    <div class="col-md-4 control-label score-select">
                        <select-field-filter .data="${this.polyphenKeys}" .value=${this.state["polyphen"].type} @filterChange="${e => this.filterChange("polyphen", {type: e.detail.value})}"></select-field-filter>
                    </div>
                    <div class="col-md-3 score-comparator">
                        <select id="${this._prefix}Comparator" name="${this._prefix}Comparator"
                                class="form-control input-sm ${this._prefix}FilterSelect"
                                @change="${e => this.filterChange("polyphen", {comparator: e.target.value})}" .disabled="${this.state["polyphen"].type !== "score"}">
                            <option .selected="${this.state["polyphen"].comparator === "="}" value="=">=</option>
                            <option .selected="${this.state["polyphen"].comparator === "<"}" value="<">&lt;</option>
                            <option .selected="${this.state["polyphen"].comparator === "<="}" value="<=">&le;</option>
                            <option .selected="${this.state["polyphen"].comparator === ">"}" value=">">&gt;</option>
                            <option .selected="${this.state["polyphen"].comparator === ">="}" value=">=">&ge;</option>
                        </select>
                    </div>
                    <div class="col-md-5 score-value">
                        <input type="text" class="form-control input-sm FilterTextInput" @input="${e => this.filterChange("polyphen", {value: e.target.value})}" .disabled="${this.state["polyphen"].type !== "score"}" .value="${this.state["polyphen"].value ?? ""}">
                    </div>
                </div>
            </div>

            <fieldset class="switch-toggle-wrapper">
                <label style="font-weight: normal;">Logical Operator</label>
                <div class="switch-toggle text-white alert alert-light">
                    <input id="${this._prefix}pssOrRadio" name="pss" type="radio" value=","
                           class="radio-or ${this._prefix}FilterRadio" checked .disabled="${this.logicalSwitchDisabled}"
                           @change="${this.onLogicalOperatorChange}"/>
                    <label for="${this._prefix}pssOrRadio"
                           class="rating-label rating-label-or">OR</label>
                    <input id="${this._prefix}pssAndRadio" name="pss" type="radio" value=";"
                           class="radio-and ${this._prefix}FilterRadio" .disabled="${this.logicalSwitchDisabled}" @change="${this.onLogicalOperatorChange}"/>
                    <label for="${this._prefix}pssAndRadio"
                           class="rating-label rating-label-and">AND</label>
                    <a class="btn btn-primary ripple btn-small"></a>
                </div>
            </fieldset>
            </div>
        `;
    }

}

customElements.define("protein-substitution-score-filter", ProteinSubstitutionScoreFilter);
