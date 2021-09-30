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
import Utils from "../../../core/utils.js";
import "../forms/select-field-filter-autocomplete.js";

export default class VariableSetIdAutocomplete extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            value: {
                type: Object
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
    }

    firstUpdated() {
        this.variableSetIdObserver();
    }

    variableSetIdObserver() {
        if (this.opencgaSession) {
            let error;
            this.opencgaSession.opencgaClient.studies().variableSets(this.opencgaSession.study.fqn, {id: ""})
                .then(response => {
                    const variableSets = response.responses[0].results;
                    this.variableSetIds = variableSets.map(variableSet => variableSet.id);
                })
                .catch(reason => {
                    this.variableSetIds = [];
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this.requestUpdate();
                });
        }
    }

    onVariableSetSearchFieldChange(e) {
        this.searchVariableSetId = e.target.value;
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.target.value
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <div class="form-group">
                <input type="text" .value="${this.searchVariableSetId || ""}" class="form-control" list="${this._prefix}VariableSets" placeholder="Search by VariableSet ID..."
                    @change="${this.onVariableSetSearchFieldChange}">
            </div>
            <datalist id="${this._prefix}VariableSets">
                ${this.variableSetIds?.map(variableSetId => html`
                    <option value="${variableSetId}"></option>
                `)}
            </datalist>
        `;
    }

}

customElements.define("variableset-id-autocomplete", VariableSetIdAutocomplete);
