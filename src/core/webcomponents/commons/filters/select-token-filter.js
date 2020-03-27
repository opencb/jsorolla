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


export default class SelectTokenFilter extends LitElement {

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
            config: {
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
            }
        };
    }

    _init() {
        this._prefix = "tk-" + Utils.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        $(".tokenize", this).tokenize2({
            placeholder: this.placeholder || "Start typing",
            tokensMaxItems: this._config.maxItems,
            dropdownMaxItems: 10,
            searchMinLength: this._config.searchMinLength,
            dataSource: (term, object) => {
                console.log(term, object, this._config);
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: false,
                    // include: "id",
                    id: "^" + term.toUpperCase()
                };
                this.client().search(filters).then( restResponse => {
                    const results = restResponse.getResults();
                    object.trigger("tokenize:dropdown:fill", [results.map( result => ({text: result.id, value: result.id}))]);
                });
            }
        });
        $(".tokenize", this).on("tokenize:tokens:added", (e, value, text) => {
            console.log("added", e, value, text);
            console.log("added list", $(e.target).val());
            this.filterChange(e);
        });
        $(".tokenize", this).on("tokenize:tokens:remove", (e, value) => {
            console.log("removed", e, value);
            console.log("removed list", $(e.target).val());
            this.filterChange(e);
        });
    }

    updated(_changedProperties) {
        if (_changedProperties.has("config")) {
            this.propertyObserver();
        }
        if (_changedProperties.has("value")) {
            console.log("value has changed")
            if(this.value) {
                if (this.value.split(",").length) {
                    this.value.split(",").forEach( v => $(".tokenize", this).tokenize2().trigger("tokenize:tokens:add", [v, v, true]));
                }
            } else {
                $(".tokenize", this).tokenize2().trigger("tokenize:clear");
            }
        }

    }

    filterChange(e) {
        const selection = $(e.target).val();
        let val;
        if (selection && selection.length) {
            //val = this.multiple ? selection.join(",") : selection[0];
            val = selection.join(",");
        }
        this.value = val ? val : null; // this allow users to get the selected values using DOMElement.value
        //console.log("select filterChange", val);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: this.value
            }
        });
        this.dispatchEvent(event);
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

    getDefaultConfig() {
        return {
            limit: 10,
            searchMinLength: 3,
            maxItems: 0
        };
    }

    render() {
        return html`
        <div class="subsection-content">
            <select class="tokenize" multiple></select>
        </div>
        `;
    }

}

customElements.define("select-token-filter", SelectTokenFilter);
