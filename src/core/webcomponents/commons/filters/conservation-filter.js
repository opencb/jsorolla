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
import UtilsNew from "../../../utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";
import "./number-field-filter.js";

export default class ConservationFilter extends LitElement {

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
            conservation: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ff-" + UtilsNew.randomString(6) + "_";
        this.methods = {"phylop": "Phylop", "phastCons": "Phastcons", "gerp": "Gerp"};
        this.state = {};
        this.defaultComparator = "<";
        this.logicalOperator = ","; // OR=, AND=;
        this.logicalSwitchDisabled = true;

    }

    update(changedProperties) {
        // "phylop>23,phastCons>212"
        if (changedProperties.has("conservation")) {
            this.state = {};
            if (this.conservation) {
                this.logicalOperator = this.conservation.split(",") > this.conservation.split(",") ? "," : ";";
                this.conservation.split(this.logicalOperator).forEach(c => {
                    const [field, comparator, value] = c.split(/(<=?|>=?|=)/);
                    this.state[field] = {
                        comparator,
                        value
                    };
                });


            }
        } else {

        }
        super.update(changedProperties);

    }

    updated2(_changedProperties) {
        if (_changedProperties.has("conservation")) {
            if (this.conservation) {
                let operator;
                // TODO create an Util function getOperator(str) to discriminate the operator in a query filter string
                const or = this.conservation.split(",");
                const and = this.conservation.split(";");
                if (or.length >= and.length) {
                    operator = "or";
                } else {
                    operator = "and";
                }
                const fields = this.conservation.split(new RegExp("[,;]"));
                if (fields && fields.length) {
                    const phylop = fields.find(el => el.startsWith("phylop"));
                    if (phylop) {
                        this.querySelector("#" + this._prefix + "PhylopInput").value = phylop.split(/[<=>]+/)[1];
                        this.querySelector("#" + this._prefix + "PhylopOperator").value = phylop.split(/[-A-Za-z0-9]+/)[1];
                    } else {
                        this.querySelector("#" + this._prefix + "PhylopInput").value = "";
                    }
                    const phastCons = fields.find(el => el.startsWith("phastCons"));
                    if (phastCons) {
                        this.querySelector("#" + this._prefix + "PhastconsInput").value = phastCons.split(/[<=>]+/)[1];
                        this.querySelector("#" + this._prefix + "PhastconsOperator").value = phastCons.split(/[-A-Za-z0-9]+/)[1];
                    } else {
                        this.querySelector("#" + this._prefix + "PhastconsInput").value = "";
                    }
                    const gerp = fields.find(el => el.startsWith("gerp"));
                    if (gerp) {
                        this.querySelector("#" + this._prefix + "GerpInput").value = gerp.split(/[<=>]+/)[1];
                        this.querySelector("#" + this._prefix + "GerpOperator").value = gerp.split(/[-A-Za-z0-9]+/)[1];
                    } else {
                        this.querySelector("#" + this._prefix + "GerpInput").value = "";
                    }

                    if (fields.length > 1) {
                        $("." + this._prefix + "FilterRadio").prop("disabled", false);
                        $("." + this._prefix + "FilterRadio[value=" + operator + "]").prop("checked", true);

                    } else {
                        $("." + this._prefix + "FilterRadio").prop("disabled", true);
                        $("." + this._prefix + "FilterRadio").filter("[value=or]").prop("checked", true);

                    }

                    /* for (let i = 0; i < fields.length; i++) {
                        let source = fields[i].split(/[<=>]+/)[0];
                        switch (source) {
                        case "phylop":
                            PolymerUtils.setValue(this._prefix + "PhylopInput", fields[i].split(/[<=>]+/)[1]);
                            PolymerUtils.setValue(this._prefix + "PhylopOperator", fields[i].split(/[-A-Za-z0-9]+/)[1]);
                            break;
                        case "phastCons":
                            PolymerUtils.setValue(this._prefix + "PhastconsInput", fields[i].split(/[<=>]+/)[1]);
                            PolymerUtils.setValue(this._prefix + "PhastconsOperator", fields[i].split(/[-A-Za-z0-9]+/)[1]);
                            break;
                        case "gerp":
                            PolymerUtils.setValue(this._prefix + "GerpInput", fields[i].split(/[<=>]+/)[1]);
                            PolymerUtils.setValue(this._prefix + "GerpOperator", fields[i].split(/[-A-Za-z0-9]+/)[1]);
                            break;
                        }
                    }*/
                }
            } else {
                // reset all and disable radio button
                $("." + this._prefix + "FilterTextInput").val("");
                $("." + this._prefix + "FilterTextInput").prop("disabled", false);
                $("." + this._prefix + "FilterRadio").prop("disabled", true);
                $("." + this._prefix + "FilterRadio").filter("[value=or]").prop("checked", true);
            }
        }
    }

    filterChange(e, method) {
        // e.detail.value is not defined iff you are changing the comparator and a value hasn't been set yet
        console.log(e.detail, method);
        if (e?.detail?.value) {
            this.state[method] = {comparator: e.detail.comparator, value: e.detail.numValue};
        } else {
            delete this.state[method];
        }
        this.logicalSwitchDisabled = Object.keys(this.state).length <= 1;
        this.serialisedState = [];
        Object.entries(this.state).forEach(([method, data]) => {
            this.serialisedState.push(`${method}${data.comparator}${data.value}`);
        });

        this.requestUpdate();
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

    onLogicalOperatorChange(e) {
        this.logicalOperator = e.target.value;
        this.notify();
    }

    render() {
        return html`
            ${Object.entries(this.methods).map(([id, label]) => {
                return html`
                    <div style="padding-top: 10px">
                        <div class="row">
                            <number-field-filter
                                    .value="${this.state?.[id]?.value ? (this.state?.[id]?.comparator ?? this.defaultComparator) + (this.state?.[id]?.value ?? "") : ""}"
                                    .config="${{comparator: true, layout: [3, 3, 6]}}"
                                    .label="${label}"
                                    type="string"
                                    data-method="${id}"
                                    data-action="comparator"
                                    @filterChange="${e => this.filterChange(e, id)}">
                            </number-field-filter>
                        </div>
                    </div>`;
            })}

            <div style="padding-top: 10px">
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

customElements.define("conservation-filter", ConservationFilter);
