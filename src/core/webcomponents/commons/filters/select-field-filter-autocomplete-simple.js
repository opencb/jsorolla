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
import UtilsNew from "./../../../utilsNew.js";


export default class SelectFieldFilterAutocompleteSimple extends LitElement {

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
            placeholder: {
                type: String
            },
            resource: {
                type: String
            },
            value: {
                type: String
            },
            disabled: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sff-" + Utils.randomString(6) + "_";
        this.selectionList = [];
        this.showAll = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated() {
        this.input = $(".typeahead", this);

        //MAP result => ({name: result.id, individual: result.attributes && result.attributes.OPENCGA_INDIVIDUAL ? result.attributes.OPENCGA_INDIVIDUAL.id : ""})
        this.input.typeahead({
            source: (query, process) => {
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: false,
                    // include: "id,individual.id",
                    id: "^" + query.toUpperCase()
                };
                this.client().search(filters).then(restResponse => {
                    const results = restResponse.getResults();
                    console.log("results", results);
                    //process(results.map(result => ({name: result.id, individual: result.attributes && result.attributes.OPENCGA_INDIVIDUAL ? result.attributes.OPENCGA_INDIVIDUAL.id : ""})));
                    process(results.map(result => ({name: result.id})));
                });
            },
            minLength: this._config.searchMinLength,
            autoSelect: true,
            displayText: function(item) {
                return item.name //+ "<p class=\"dropdown-item-extra\"><label>Individual ID</label>" + item.individual + "</p>";
            },
            /* displayText: function(item) {
                return item.id + "<p class=\"dropdown-item-extra\"><label>Individual ID</label>" + (item.attributes && item.attributes.OPENCGA_INDIVIDUAL ? item.attributes.OPENCGA_INDIVIDUAL.id : "") + "</p>";
            },*/
            highlighter: Object,
            afterSelect: item => {
                this.input.val(item.name).change();
            }
        });
        this.input.change(() => {
            const current = this.input.typeahead("getActive");
            if (current) {
                if (current.name === this.input.val()) {
                    // This means the exact match is found. Use toLowerCase() if you want case insensitive match.
                    console.log("exact match", this.input.val());
                    //this.selection = this.input.val();
                    //this.filterChange();
                    this.filterChange();
                } else {
                    // This means it is only a partial match, you can either add a new item
                    // or take the active if you don't want new items
                    console.log("partial match", this.input.val());
                }
            } else {
                // Nothing is active so it is a new value (or maybe empty value)
                console.log("NO match", this.input.val());
            }
            //this.addTerm();
        });
    }

    updated(_changedProperties) {
        if (_changedProperties.has("disabled")) {
            $(".typeahead", this).attr("disabled", this.disabled);
        }
        if (_changedProperties.has("value")) {
            console.log("new value from active filter", this.value);
            this.selectionList = this.value ? this.value.split(",") : [];
            this.requestUpdate();
        }
    }

    client() {
        switch (this.resource) {
            case "files":
                return this.opencgaSession.opencgaClient.files();
            case "samples":
                return this.opencgaSession.opencgaClient.samples();
            case "individuals":
                return this.opencgaSession.opencgaClient.individuals();
            case "cohort":
                return this.opencgaSession.opencgaClient.cohorts();
            case "family":
                return this.opencgaSession.opencgaClient.families();
            case "clinical-analysis":
                return this.opencgaSession.opencgaClient.clinical();
            case "jobs":
                return this.opencgaSession.opencgaClient.jobs();
            default:
                console.error("Resource not recognized");
        }
    }

    filterChange() {
        this.value = this.input.val() ? this.input.val() : null; // this allows the users to get the selected values using DOMElement.value
        console.log("select filterChange", this.value);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: this.value
            }
        });
        this.dispatchEvent(event);
    }

    addTerm() {
        if (this.input.val()) {
            this.selectionList.push(this.input.val().split(new RegExp("[,;]")).filter(_ => _));
            this.filterChange();
            this.input.val("").change();
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            limit: 10,
            searchMinLength: 1,
            maxItems: 0,
            limitToShow: 20,
        };
    }

    render() {
        return html`
            <style>
            </style>
            <div class="form-group">
                <form autocomplete="off" action="javascript:void 0">
                    <div>
                        <input name="sample" id="sample" type="text" class="form-control typeahead" data-provide="typeahead" autocomplete="off" placeholder="${this.placeholder || "Start typing"}" />
                    </div>
                </form>
            </div>
        `;
    }

}

customElements.define("select-field-filter-autocomplete-simple", SelectFieldFilterAutocompleteSimple);
