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


/**
 *  Usage:
 * <toggle-switch .value="true" .onText="YES" .offText="NO"></toggle-switch>
 */
export default class ToggleSwitch extends LitElement {

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
            value: {
                type: Boolean
            },
            onText: {
                type: String
            },
            offText: {
                type: String
            },
            activeClass: {
                type: String
            },
            inactiveClass: {
                type: String
            },
            disabled: {
                type: Boolean
            },
            classes: {
                type: String
            },
            _value: {
                type: Boolean,
                state: true
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        // Default values
        this.onText = "ON";
        this.offText = "OFF";
        this.activeClass = "btn-primary";
        this.inactiveClass = "btn-default";
        this.classes = "";
    }

    // updated(changedProperties) {
    //     if (changedProperties.has("value")) {
    //         this._propertyObserver();
    //         this._value = this.value;
    //     }
    //     if (changedProperties.has("onText")) {
    //         this.onText = this.onText ? this.onText : "ON";
    //         // this._propertyObserver();
    //     }
    //     if (changedProperties.has("offText")) {
    //         this.offText = this.offText ? this.offText : "OFF";
    //         // this._propertyObserver();
    //     }
    //     if (changedProperties.has("activeClass")) {
    //         this.activeClass = this.activeClass ? this.activeClass : "btn-primary";
    //         this._propertyObserver();
    //     }
    //     if (changedProperties.has("inactiveClass")) {
    //         this.inactiveClass = this.inactiveClass ? this.inactiveClass : "btn-default";
    //         this._propertyObserver();
    //     }
    // }

    firstUpdated(changedProperties) {
        if (changedProperties.has("value")) {
            this.propertyObserver();
        }
    }

    update(changedProperties) {
        // if (changedProperties.has("value")) {
        //     this.propertyObserver();
        // }

        if (changedProperties.has("onText")) {
            this.onText = this.onText ? this.onText : "ON";
        }

        if (changedProperties.has("offText")) {
            this.offText = this.offText ? this.offText : "OFF";
        }
        super.update(changedProperties);
    }

    propertyObserver() {
        // const val = this.value?.toString();
        // if (val !== "OFF" && val !== "false") {
        //     this._value = true;
        // } else {
        //     this._value = false;
        // }
        this._value = this.value;
    }

    _propertyObserver() {
        if (typeof this.value !== "undefined" && this.activeClass && this.inactiveClass) {
            if (this.value) {
                this._onClass = this.activeClass + " active";
                this._offClass = this.inactiveClass;
            } else {
                this._onClass = this.inactiveClass;
                this._offClass = this.activeClass + " active";
            }
            this.requestUpdate();
        }
    }

    onToggleClick(buttonId) {
        // Check if there is anything to do
        if ((this.value && buttonId === "ON") || (!this.value && buttonId === "OFF")) {
            return;
        }

        // Support several classes
        const activeClasses = this.activeClass.split(" ");
        const inactiveClasses = this.inactiveClass.split(" ");

        // Fetch and reset buttons status
        const buttons = this.getElementsByClassName("btn-toggle-" + this._prefix);
        Array.from(buttons).forEach(button => {
            button.classList.remove(...activeClasses, ...inactiveClasses, "active");
        });
        let onIndex = 0;
        let offIndex = 1;
        if (buttons[0].dataset.id === "OFF") {
            onIndex = 1;
            offIndex = 0;
        }

        // Set proper classes
        this.value = buttonId === "ON";
        if (this.value) {
            buttons[onIndex].classList.add(...activeClasses, "active");
            buttons[offIndex].classList.add(...inactiveClasses);
        } else {
            buttons[onIndex].classList.add(...inactiveClasses);
            buttons[offIndex].classList.add(...activeClasses, "active");
        }

        // Set the field status
        this.filterChange();
    }

    filterChange(val) {
        LitUtils.dispatchCustomEvent(this, "filterChange", val);
    }

    render() {
        return html`
            <fieldset ?disabled="${this.disabled}">
                <div class="btn-group" role="group">
                    <input class="btn-check" type="radio" ?checked="${this._value}"
                        name="${this._prefix}BtnRadio" id="${this._prefix}onBtnRadio"
                        @click=${() => this.filterChange("ON")} autocomplete="off">
                    <label class="btn btn-outline-primary" for="${this._prefix}onBtnRadio">
                        ${this.onText}
                    </label>

                    <input type="radio" class="btn-check" ?checked="${!this._value}"
                        name="${this._prefix}BtnRadio" id="${this._prefix}offBtnRadio"
                        @click=${() => this.filterChange("OFF")} autocomplete="off">
                    <label class="btn btn-outline-primary" for="${this._prefix}offBtnRadio">
                        ${this.offText}
                    </label>
                </div>
            </fieldset>
                <!-- <button
                    class="btn ${this._onClass} btn-toggle-${this._prefix} ${this.classes}"
                    data-id="ON"
                    ?disabled="${this.disabled}"
                    type="button"
                    @click="${e => this.onToggleClick("ON", e)}">
                    ${this.onText}
                </button>
                <button
                    class="btn ${this._offClass} btn-toggle-${this._prefix} ${this.classes}"
                    data-id="OFF"
                    ?disabled="${this.disabled}"
                    type="button"
                    @click="${e => this.onToggleClick("OFF", e)}">
                    ${this.offText}
                </button> -->

        `;
    }

}

customElements.define("toggle-switch", ToggleSwitch);
