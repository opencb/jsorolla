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

        this.defaultComparators = [
            {id: "<", name: "<"},
            {id: "<=", name: "&#8804;"},
            {id: "=", name: "="},
            {id: ">", name: ">"},
            {id: ">=", name: "&#8805;"},
        ];

        this.invalidData = {
            sift: false,
            polyphen: false
        };
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
                    pss = [this.proteinSubstitution];
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

    proteinfilterChange(field, data) {
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

    filterChange(e, field, value) {
        if (e.target?.validity?.valid) {
            this.invalidData[field] = false;
            this.proteinfilterChange(field, value);
        } else {
            this.invalidData[field] = true;
        }
        this.requestUpdate();
    }

    errorMessage(msg) {
        return html `
            <div style="display:flex; flex-direction:row-reverse; color:#a94442;">
                <span>${msg}</span>
            </div>
        `;
    }

    onLogicalOperatorChange(e) {
        this.logicalOperator = e.target.value;
        this.notify();
    }

    notify() {
        LitUtils.dispatchCustomEvent(this, "filterChange", this.serialisedState.join(this.logicalOperator));
    }

    defaultState() {
        return {
            "polyphen": {type: "score", comparator: ">"},
            "sift": {type: "score", comparator: ">"}
        };
    }

    render() {
        return html`

            <div class="mb-3 sift">
                <label class="form-label">SIFT</label>
                <div class="row g-1">
                    <div class="col-md-4 control-label score-select">
                        <select-field-filter
                            .data="${this.siftKeys}"
                            .value="${this.state["sift"].type}"
                            .config="${{
                                liveSearch: false,
                            }}"
                            @filterChange="${e => this.proteinfilterChange("sift", {type: e.detail.value})}">
                        </select-field-filter>
                    </div>
                    <div class="col-md-3 score-comparator">
                        <select-field-filter
                            .data="${this.defaultComparators}"
                            .value="${this.state["sift"].comparator}"
                            .config="${{
                                liveSearch: false,
                            }}"
                            @filterChange="${e => this.proteinfilterChange("sift", {comparator: e.detail.value})}" .disabled="${this.state["sift"].type !== "score"}">
                        </select-field-filter>
                    </div>
                    <div class="col-md-5 score-value">
                        <input type="number" min="0" max="1" step="0.001" class="FilterTextInput form-control"
                            .disabled="${this.state["sift"].type !== "score"}"
                            .value="${this.state["sift"].value ?? ""}"
                            @input="${e => this.filterChange(e, "sift", {value: e.target.value})}" />
                    </div>
                    <div class="col-md-12">
                        ${this.invalidData["sift"] ? this.errorMessage("Between 0 and 1"): nothing }
                    </div>
                </div>
            </div>

            <div class="mb-3 polyphen">
                <label class="form-label">Polyphen</label>
                <div class="row g-1">
                    <div class="col-md-4 control-label score-select">
                        <select-field-filter
                            .data="${this.polyphenKeys}"
                            .value=${this.state["polyphen"].type}
                            .config="${{
                                liveSearch: false,
                            }}"
                            @filterChange="${e => this.proteinfilterChange("polyphen", {type: e.detail.value})}">
                        </select-field-filter>
                    </div>
                    <div class="col-md-3 score-comparator">
                        <select-field-filter
                            .data="${this.defaultComparators}"
                            .value="${this.state["polyphen"].comparator}"
                            .config="${{
                                liveSearch: false,
                            }}"
                            @filterChange="${e => this.proteinfilterChange("polyphen", {comparator: e.detail.value})}" .disabled="${this.state["polyphen"].type !== "score"}">
                        </select-field-filter>
                    </div>
                    <div class="col-md-5 score-value">
                        <input type="number" min="0" max="1" step="0.001" class="FilterTextInput form-control"
                            .disabled="${this.state["polyphen"].type !== "score"}"
                            .value="${this.state["polyphen"].value ?? ""}"
                            @input="${e => this.filterChange(e, "polyphen", {value: e.target.value})}" />
                    </div>
                    <div class="col-md-12">
                        ${this.invalidData["polyphen"] ? this.errorMessage("between 0 and 1"): nothing }
                    </div>
                </div>
            </div>

            <fieldset class="mb-3" ?disabled="${this.logicalSwitchDisabled}">
                <label class="form-label">Logical Operator</label>
                <div class="form-check">
                    <input class="form-check-input ${this._prefix}FilterRadio" id="${this._prefix}pssOrRadio"
                        name="pss" type="radio" value="," @change="${this.onLogicalOperatorChange}" checked/>
                    <label class="form-check-label" for="${this._prefix}pssOrRadio">
                        OR
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input ${this._prefix}FilterRadio" id="${this._prefix}pssAndRadio"
                        name="pss" type="radio" value=";" @change="${this.onLogicalOperatorChange}"/>
                    <label class="form-check-label" for="${this._prefix}pssAndRadio">
                        AND
                    </label>
                </div>
            </fieldset>
            </div>
        `;
    }

}

customElements.define("protein-substitution-score-filter", ProteinSubstitutionScoreFilter);
