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

export default class ConsequenceTypeFilter extends LitElement {

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
            consequenceTypes: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "ctf-" + Utils.randomString(6) + "_";
    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    onChange(e) {
        //TODO fire a unique event
        console.log("ConsequenceType change", e.target);
        let event = new CustomEvent('consequenceTypeChange', {
            detail: {
                consequenceType: e.target.value

            }
        });
        this.dispatchEvent(event);
    }
    updateConsequenceTypeFilter(){
        console.log("TODO implement&refactor from opencga-variant-filter");
    }

    render() {
        return html`
            <div style="padding-top: 15px">Loss-of-Function (LoF) terms:</div>
            <div class="form-check" style="margin-top: 5px;">
                <div class="form-check-label">
                    <label id="${this._prefix}LossOfFunctionCheckBoxLabel" class="notbold">
                        <input id="${this._prefix}LossOfFunctionCheckBox" type="checkbox" class="${this._prefix}FilterCheckBox"
                               style="cursor: pointer" @change="${this.updateConsequenceTypeFilter}"/>
                        LoF terms
                    </label>
                </div>
            </div>
            <div style="padding-top: 15px">Consequence Type terms:</div>
            <div class="browser-ct-tree-view browser-ct-item">
                <ul id="${this._prefix}consequenceTypeFilter">
                    ${this.consequenceTypes.categories && this.consequenceTypes.categories.length && this.consequenceTypes.categories.map(category => html`
                                                <li id="${category.title ? category.title : category.name}" class="form-check" style="margin-top: 10px;">
                                                    ${category.terms && category.terms.length ? html`
                                                        <label class="form-check-label notbold">
                                                            <input id="${this._prefix}${category.title}Input" type="checkbox" class="${this._prefix}FilterCheckBox" @change="${this.updateConsequenceTypeFilter}"> ${category.title}
                                                        </label>
                                                        <ul>
                                                            ${category.terms.map(item => html`
                                                                <li class="form-check">
                                                                    <label class="form-check-label notbold">
                                                                        <input id="${this._prefix}${item.name}Checkbox" type="checkbox" data-id="${item.name}" class="soTermCheckBox ${this._prefix}FilterCheckBox" @change="${this.updateConsequenceTypeFilter}">
                                                                            <span title="${item.description}">
                                                                                ${item.name} (<a href="http://www.sequenceontology.org/browser/current_svn/term/${item.id}" target="_blank">${item.id}</a>)
                                                                            </span>
                                                                    </label>
                                                                </li>
                                                            `)}
                                                        </ul>
                                                    ` : html`
                                                        <input id="${this._prefix}${category.name}Checkbox" type="checkbox"
                                                                   data-id="${category.name}" class="soTermCheckBox ${this._prefix}FilterCheckBox" @change="${this.updateConsequenceTypeFilter}">
                                                            <span title="${category.description}">
                                                                ${category.name} (<a href="http://www.sequenceontology.org/browser/current_svn/term/${category.id}" target="_blank">${category.id}</a>)
                                                            </span>
                                                    `}
                                                </li>
                                            `)}
                </ul>
            </div>
            </div>
        `;
    }
}

customElements.define('consequence-type-filter', ConsequenceTypeFilter);