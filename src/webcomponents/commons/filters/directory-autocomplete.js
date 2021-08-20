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
import Utils from "./../../../core/utils.js";
import "../../commons/forms/select-field-filter-autocomplete.js";

export default class DirectoryAutocomplete extends LitElement {

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
            },
            config: {
                type: Object
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onFilterChange(key, value) {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: value
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            addButton: false,
            fields: item => ({
                name: item
            }),
            dataSource: (query, process) => {
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: 20,
                    count: false,
                    //include: "id",
                    path: "~^" + query.toUpperCase()
                };
                this.opencgaSession.opencgaClient.files().distinct("path", filters).then(restResponse => {
                    const results = restResponse.getResults();
                    process(results.map(this._config.fields).filter(Boolean));
                });
            }
        };
    }

    render() {
        return html`
            <select-field-filter-autocomplete .opencgaSession="${this.opencgaSession}" .config=${this._config} .value="${this.value}" @filterChange="${e => this.onFilterChange("id", e.detail.value)}"></select-field-filter-autocomplete>
        `;
    }

}

customElements.define("directory-autocomplete", DirectoryAutocomplete);
