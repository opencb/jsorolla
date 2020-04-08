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


/** NOTE - Design choice: in case of single mode (this.multiple=false), in order to show the placeholder ("Select an option") and NOT adding a dummy option to allow null selection,
 *  the single selection mode is implemented still with the multiple flag in bootstrap-select, but forcing 1 selection with data-max-options=1
 *  (this has no consequences for the developer point of view)
 *
 *  Usage:
 * <select-field-filter .data="${["A","B","C"]}" .value=${"A"} @filterChange="${e => console.log(e)}"></select-field-filter>
 * <select-field-filter .data="${[{id: "a", name: "A", {id:"b", name: "B"}, {id: "c", name: "C"}]}" .value=${"a"} @filterChange="${e => console.log(e)}"></select-field-filter>
 */

export default class SelectFieldFilterAutocomplete extends LitElement {

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
            }
        };
    }

    _init() {
        this._prefix = "sff-" + Utils.randomString(6) + "_";
        this.multiple = false;
        this.data = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }


    firstUpdated() {
        const input = $(".typeahead", this);

        input.typeahead({
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
                    process(results.map(result => ({name: result.id, individual: result.attributes && result.attributes.OPENCGA_INDIVIDUAL ? result.attributes.OPENCGA_INDIVIDUAL.id : ""})));
                });
            },
            minLength: this._config.searchMinLength,
            autoSelect: true,
            displayText: function(item) {
                return item.name + "<p class=\"dropdown-item-extra\"><label>Individual ID</label>" + item.individual + "</p>";
            },
            highlighter: Object,
            afterSelect: function(item) {
                input.val(item.name).change();
            }
        });
        input.change( () => {
            const current = input.typeahead("getActive");
            if (current) {
                if (current.name === input.val()) {
                    // This means the exact match is found. Use toLowerCase() if you want case insensitive match.
                    console.log("EXACT match", input.val());
                    this.selection = input.val();
                    this.filterChange();
                } else {
                    // This means it is only a partial match, you can either add a new item
                    // or take the active if you don't want new items
                    console.log("PARTIAL match", input.val());
                }
            } else {
                // Nothing is active so it is a new value (or maybe empty value)
                console.log("NO match", input.val());
            }
        });
    }

    updated(_changedProperties) {
        if (_changedProperties.has("disabled")) {
            $(".typeahead", this).attr("disabled", this.disabled);
        }
        if (_changedProperties.has("value")) {
            this.selection = this.value; //TODO continue
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
        this.value = this.selection ? this.selection : null; // this allows the users to get the selected values using DOMElement.value
        console.log("select filterChange", this.selection);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: this.value
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            limit: 10,
            searchMinLength: 3,
            maxItems: 0
        };
    }

    render() {
        return html`
            <style>
                .dropdown-item-extra {
                    font-size: .8em;
                    color: #bfbfbf;
                }
                .dropdown-item-extra label {
                    width: 50%;
                }
            </style>
            <form autocomplete="off" class="form-group">
                <input name="sample" id="sample" type="text" class="form-control typeahead" data-provide="typeahead" autocomplete="off" placeholder="${this.placeholder || "Start typing"}">
            </form>
        `;
    }

}

customElements.define("select-field-filter-autocomplete", SelectFieldFilterAutocomplete);
