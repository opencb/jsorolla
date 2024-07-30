/*
 * Copyright 2015-2024 OpenCB
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
 * <toggle-buttons .value="true" .onText="YES" .offText="NO"></toggle-buttons>
 */
export default class ToggleButtons extends LitElement {

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
            names: {
                type: Array
            },
            value: {
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
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this._nameClass = {};

        // Default values
        this.activeClass = "btn-primary";
        this.inactiveClass = "btn-light";
        this.classes = "";
    }

    updated(changedProperties) {
        if (changedProperties.has("names")) {
            this._propertyObserver();
        }
        if (changedProperties.has("value")) {
            this._propertyObserver();
            this._value = this.value;
        }
        if (changedProperties.has("activeClass")) {
            this.activeClass = this.activeClass ? this.activeClass : "btn-primary";
            this._propertyObserver();
        }
        if (changedProperties.has("inactiveClass")) {
            this.inactiveClass = this.inactiveClass ? this.inactiveClass : "btn-light";
            this._propertyObserver();
        }
    }

    _propertyObserver() {
        if (this.names && this.value && this.activeClass && this.inactiveClass) {
            this._nameClass = {};
            for (const name of this.names) {
                if (name === this.value) {
                    this._nameClass[name] = this.activeClass + " active";
                } else {
                    this._nameClass[name] = this.inactiveClass;
                }
            }
            this.requestUpdate();
        }
    }

    onToggleClick(buttonName, e) {
        // Check if there is anything to do
        if (this.value === buttonName) {
            return;
        }

        // Support several classes
        const activeClasses = this.activeClass.split(" ");
        const inactiveClasses = this.inactiveClass.split(" ");

        // Fetch and reset buttons status
        const buttons = this.getElementsByClassName("btn-toggle-" + this._prefix);
        buttons.forEach(button => button.classList.remove(...activeClasses, ...inactiveClasses, "active"));

        // Set proper classes
        this.value = buttonName;
        for (const button of buttons) {
            if (button.dataset.id === this.value) {
                button.classList.add(...activeClasses, "active");
            } else {
                button.classList.add(...inactiveClasses);
            }
        }

        // Set the field status
        this.filterChange();
    }

    filterChange(BtnName) {
        LitUtils.dispatchCustomEvent(this, "filterChange", BtnName);
    }

    render() {
        if (!this.names) {
            return;
        }

        return html`
            <div class="btn-group" role="group">
                ${
                    this.names?.map(name => html`
                        <input class="btn-check ${this.classes}" ?checked="${name === this.value}"
                            @click="${() => this.filterChange(name)}" id="${this._prefix + name}" type="radio"
                            name="${this._prefix}BtnRadio" data-id="${name}">
                        <label class="btn btn-outline-primary" for="${this._prefix + name}">
                            ${name}
                        </label>
                    `)
                }
            </div>
            <!-- <div class="">
                <div class="btn-group">
                    ${this.names?.map(name => html`
                        <button type="button" class="btn ${this._nameClass[name]} btn-toggle-${this._prefix} ${this.classes}" data-id="${name}"
                                @click="${e => this.onToggleClick(name, e)}">${name}</button>`
                )}
                </div>
            </div> -->
        `;
    }

}

customElements.define("toggle-buttons", ToggleButtons);
