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

export default class ConsequenceTypeFilter extends LitElement {

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
            consequenceTypes: {
                type: Object
            },
            query: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ctf-" + Utils.randomString(6) + "_";
        this.selectedCt = [];
    }

    updated(_changedProperties) {
        if (_changedProperties.has("query")) {
            if(this.query.ct) {
                console.log("this.query.ct",this.query.ct)
                this.selectedCt = this.query.ct.split(",");
                this.requestUpdate();
            }
        }
    }

    filterChange(e) {
        const ct = this.ct ? this.ct.join(",") : null;
        console.log("filterChange", ct);
        let event = new CustomEvent("filterChange", {
            detail: {
                value: ct
            }
        });
        this.dispatchEvent(event);
    }

    clearSelection() {
        $("input[type=checkbox]", this).prop("checked", false);
        this.ct = [];
        this.filterChange();
    }

    onChange(e) {
        //TODO refactor!
        let lofCheckBox = this.querySelector("#" + this._prefix + "LossOfFunctionCheckBox");
        if (e.currentTarget.id === this._prefix + "LossOfFunctionCheckBox") {
            for (let ct of this.consequenceTypes.lof) {
                let checkbox = this.querySelector("#" + this._prefix + ct + "Checkbox");
                if (checkbox) {
                    checkbox.checked = e.currentTarget.checked;
                }
            }
        }
        // Select/Unselect the items from one category
        if (e.target.parentNode.parentNode.id !== "") {
            $("#" + e.target.parentNode.parentNode.id + " ul li input").each(function() {
                $(this).prop("checked", e.target.checked);
            });
        }
        let soTerms = [];
        let selected = this.querySelector("#" + this._prefix + "consequenceTypeFilter").querySelectorAll("li input");
        selected.forEach(sel => {
            if (sel.checked && typeof sel.dataset !== "undefined" && typeof sel.dataset.id !== "undefined") {
                soTerms.push(sel.dataset.id);
            } else {
                // If one term from LoF array is not selected we remove LoF check
                let dataId = sel.getAttribute("data-id");
                if (lofCheckBox.checked && UtilsNew.isNotUndefinedOrNull(dataId) && this.consequenceTypes.lof.includes(dataId)) {
                    lofCheckBox.checked = false;
                }
            }
        });

        this.ct = soTerms;
        this.filterChange();

        //TODO onSelect an item, this refers to the whole category and to the the title of the category
        //this will be useful to automatially select the category checkbox when all the items in it are selected (useful with saved filters as well)
        //console.log("checked: ", $("input[type=checkbox]", e.target.parentNode.parentNode.parentNode).length)
        //console.log("total: ", $("input[type=checkbox]:checked", e.target.parentNode.parentNode.parentNode).length)
        //console.log("title", e.target.parentNode.parentNode.parentNode.parentNode.id)
    }

    render() {
        return html` 
            <button class="btn" @click="${this.clearSelection}">clear</button> 
            <div style="padding-top: 15px">Loss-of-Function (LoF) terms:</div>
            <div class="form-check" style="margin-top: 5px;">
                <div class="form-check-label">
                    <label id="${this._prefix}LossOfFunctionCheckBoxLabel" class="notbold">
                        <input id="${this._prefix}LossOfFunctionCheckBox" type="checkbox" class="${this._prefix}FilterCheckBox"
                               style="cursor: pointer" @change="${this.onChange}"/>
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
                                    <input id="${this._prefix}${category.title}Input" type="checkbox" class="${this._prefix}FilterCheckBox" @change="${this.onChange}"> ${category.title}
                                </label>
                                <ul>
                                    ${category.terms.map(item => html`
                                    <li class="form-check">
                                        <label class="form-check-label notbold">
                                            <input id="${this._prefix}${item.name}Checkbox" type="checkbox" data-id="${item.name}"
                                                   class="soTermCheckBox ${this._prefix}FilterCheckBox" @change="${this.onChange}" .checked="${~this.selectedCt.indexOf(item.name)}">
                                            <span title="${item.description}">
                                            ${item.name} (<a href="http://www.sequenceontology.org/browser/current_svn/term/${item.id}" target="_blank">${item.id}</a>)
                                            </span>
                                        </label>
                                    </li>
                                    `)}
                                </ul>
                                ` : html`
                                    <input id="${this._prefix}${category.name}Checkbox" type="checkbox"
                                        data-id="${category.name}" class="soTermCheckBox ${this._prefix}FilterCheckBox" @change="${this.onChange}">
                                    <span title="${category.description}">
                                        ${category.name}
                                        (<a href="http://www.sequenceontology.org/browser/current_svn/term/${category.id}" target="_blank">${category.id}</a>)
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

customElements.define("consequence-type-filter", ConsequenceTypeFilter);
