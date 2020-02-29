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
import Utils from "./../../../utils.js";
import UtilsNew from "../../../utilsNew.js";

//TODO refactor

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
            ct: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "ctf-" + Utils.randomString(6) + "_";
        this.selectedCt = [];
        $("select.selectpicker", this).selectpicker("render");
        $('.select.selectpicker', this).on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
            console.log(e,clickedIndex,isSelected,previousValue)
        });

    }

    updated(_changedProperties) {
        if (_changedProperties.has("ct")) {
            if (this.ct) {
                this.selectedCt = this.ct.split(",");
            } else {
                $("input[type=checkbox]", this).prop("checked", false);
            }
            this.requestUpdate();
        }
    }

    filterChange(e) {
        const ct = this.ct ? this.ct : null;
        console.log("filterChange", ct);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: ct
            }
        });
        this.dispatchEvent(event);
    }

    clearSelection() {
        $("input[type=checkbox]", this).prop("checked", false);
        this.ct = "";
        this.filterChange();
    }

    onChange(e) {
        // TODO refactor!
        const lofCheckBox = this.querySelector("#" + this._prefix + "LossOfFunctionCheckBox");
        console.log("e.currentTarget", e.currentTarget.id)
        if (e.currentTarget.id === this._prefix + "LossOfFunctionCheckBox") {
            for (const ct of this.consequenceTypes.lof) {
                const checkbox = this.querySelector("#" + this._prefix + ct + "Checkbox");
                if (checkbox) {
                    checkbox.checked = e.currentTarget.checked;
                }
            }
        }

        console.log("currentTarget.dataset.category",e.currentTarget.dataset.category)
        // Select/Unselect the items from one category
        if (e.currentTarget.dataset.category) {
            $("#" + e.currentTarget.dataset.category + " ul li input").each(function() {
                $(this).prop("checked", e.target.checked);
            });
        }
        const soTerms = [];
        const selected = this.querySelector("#" + this._prefix + "consequenceTypeFilter").querySelectorAll("li input");
        selected.forEach(sel => {
            if (sel.checked && typeof sel.dataset !== "undefined" && typeof sel.dataset.id !== "undefined") {
                soTerms.push(sel.dataset.id);
            } else {
                // If one term from LoF array is not selected we remove LoF check
                const dataId = sel.getAttribute("data-id");
                if (lofCheckBox.checked && UtilsNew.isNotUndefinedOrNull(dataId) && this.consequenceTypes.lof.includes(dataId)) {
                    lofCheckBox.checked = false;
                }
            }
        });

        this.ct = soTerms.join(",");
        this.selectedCt = soTerms;
        this.filterChange();

        // TODO onSelect an item, this refers to the whole category and to the the title of the category
        // this will be useful to automatially select the category checkbox when all the items in it are selected (useful with saved filters as well)
        // console.log("checked: ", $("input[type=checkbox]", e.target.parentNode.parentNode.parentNode).length)
        // console.log("total: ", $("input[type=checkbox]:checked", e.target.parentNode.parentNode.parentNode).length)
        // console.log("title", e.target.parentNode.parentNode.parentNode.parentNode.id)
    }

    render() {
        return html`
            <style>
                .browser-ct-tree-view ul > li > ul label {
                    font-weight: normal;
                }
                consequence-type-filter label:not(.category){
                    text-decoration: underline;
                }
            </style>
            <button class="btn btn-sm" @click="${this.clearSelection}">clear</button>
            <div style="padding-top: 15px">Loss-of-Function (LoF) terms:</div>
            <div class="form-check" style="margin-top: 5px;">
                <div class="form-check-label checkbox-container">
                    <input id="${this._prefix}LossOfFunctionCheckBox" type="checkbox" class="${this._prefix}FilterCheckBox"
                               style="cursor: pointer" @change="${this.onChange}"/>
                    <label for="${this._prefix}LossOfFunctionCheckBox" class="">LoF terms</label>
                </div>
            </div>
            <div style="padding-top: 15px">Consequence Type terms:</div>
            <div class="browser-ct-tree-view browser-ct-item">
                <ul id="${this._prefix}consequenceTypeFilter" class="checkbox-container">
                    ${this.consequenceTypes.categories && this.consequenceTypes.categories.length && this.consequenceTypes.categories.map(category => html`
                        <li id="${category.title ? category.title : category.name}" class="form-check" style="margin-top: 10px;">
                            ${category.terms && category.terms.length ? html`
                                <input id="${this._prefix}${category.title}Input" type="checkbox" class="${this._prefix}FilterCheckBox" data-category="${category.title}" @change="${this.onChange}">
                                <label for="${this._prefix}${category.title}Input" class="form-check-label category">${category.title}</label>
                                <ul>
                                    ${category.terms.map(item => html`
                                    <li class="form-check">
                                        <input id="${this._prefix}${item.name}Checkbox" type="checkbox" data-id="${item.name}"
                                                   class="soTermCheckBox ${this._prefix}FilterCheckBox" @change="${this.onChange}" ?checked="${~this.selectedCt.indexOf(item.name)}">
                                        <label for="${this._prefix}${item.name}Checkbox" class="form-check-label notbold" style="text-decoration-color: ${this.consequenceTypes.color[item.impact]}">
                                            <span title="${item.description}">
                                                ${item.name}
                                            </span>
                                        </label>
                                        (<a href="http://www.sequenceontology.org/browser/current_svn/term/${item.id}" target="_blank">${item.id}</a>)
                                    </li>
                                    `)}
                                </ul>
                                ` : html`
                                    <input id="${this._prefix}${category.name}Checkbox" type="checkbox"
                                        data-id="${category.name}" class="soTermCheckBox ${this._prefix}FilterCheckBox" @change="${this.onChange}" ?checked="${~this.selectedCt.indexOf(category.name)}">
                                    <label for="${this._prefix}${category.name}Checkbox" style="text-decoration-color: ${this.consequenceTypes.color[category.impact]}">
                                        <span title="${category.description}">
                                            ${category.name}
                                        </span>
                                    </label>
                                    (<a href="http://www.sequenceontology.org/browser/current_svn/term/${category.id}" target="_blank">${category.id}</a>)
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
