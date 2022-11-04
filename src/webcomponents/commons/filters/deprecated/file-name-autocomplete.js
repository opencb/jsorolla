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
import UtilsNew from "../../../../core/utils-new.js";
import "../../forms/select-token-filter.js";

// Rodiel 06-05-2022 - DEPRECATED: use catalog-search-autocomplete now.
export default class FileNameAutocomplete extends LitElement {

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
            placeholder: "eg. samples.tsv, phenotypes.vcf...",
            limit: 10,
            fields: item => ({
                name: item.name,
                Format: item.format ?? "N/A",
                Size: UtilsNew.getDiskUsage(item.size)
            }),
            source: (params, success, failure) => {
                const page = params?.data?.page || 1;
                const name = params?.data?.term ? {id: "~/" + params?.data?.term + "/i"} : null;
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: false,
                    skip: (page - 1) * this._config.limit,
                    type: "FILE",
                    include: "id,name,format,size",
                    ...name
                };
                this.opencgaSession.opencgaClient.files().search(filters)
                    .then(response => success(response))
                    .catch(error => failure(error));
            },
        };
    }

    render() {
        return html`
            <select-token-filter
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                .value="${this.value}"
                @filterChange="${e => this.onFilterChange("id", e.detail.value)}">
            </select-token-filter>
        `;
    }

}

customElements.define("file-name-autocomplete", FileNameAutocomplete);
