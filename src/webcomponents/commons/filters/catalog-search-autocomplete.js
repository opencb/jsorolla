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
import LitUtils from "../utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../forms/select-token-filter.js";

export default class CatalogSearchAutocomplete extends LitElement {

    constructor() {
        super();

        this.#init();
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
            resource: {
                type: String,
            },
            searchField: {
                type: String,
            },
            query: {
                type: Object,
            },
            classes: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.RESOURCES = {};
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.RESOURCES = {
            "PROJECT": {
                searchField: "id",
                placeholder: "project...",
                // client: this.opencgaSession.opencgaClient.projects(),
                fetch: filters => this.opencgaSession.opencgaClient.projects().search(filters),
                fields: item => ({
                    "name": item.id,
                }),
                query: {
                    include: "id,name"
                }
            },
            "STUDY": {
                searchField: "id",
                placeholder: "study...",
                // client: this.opencgaSession.opencgaClient.studies(),
                fetch: filters => this.opencgaSession.opencgaClient.studies().search(filters),
                fields: item => ({
                    "name": item.id,
                }),
                query: {
                    project: this.opencgaSession.project.id,
                    include: "id,name"
                }
            },
            "SAMPLE": {
                searchField: "id",
                placeholder: "HG01879, HG01880, HG01881...",
                client: this.opencgaSession.opencgaClient.samples(),
                fields: item => ({
                    "name": item.id,
                    "Individual ID": item?.individualId
                }),
                query: {
                    include: "id,individualId"
                }
            },
            "INDIVIDUAL": {
                searchField: "id",
                placeholder: "Start typing",
                // client: this.opencgaSession.opencgaClient.individuals(),
                fetch: filters => this.opencgaSession.opencgaClient.individuals().search(filters),
                fields: item => ({
                    "name": item.id
                }),
                query: {
                    include: "id"
                }
            },
            "FAMILY": {
                searchField: "id",
                placeholder: "Start typing",
                // client: this.opencgaSession.opencgaClient.families(),
                fetch: filters => this.opencgaSession.opencgaClient.families().search(filters),
                fields: item => ({
                    "name": item.id
                }),
                query: {
                    include: "id"
                }
            },

            "CLINICAL_ANALYSIS": {
                searchField: "id",
                placeholder: "Start typing",
                // client: this.opencgaSession.opencgaClient.clinical(),
                fetch: filters => this.opencgaSession.opencgaClient.clinical().search(filters),
                fields: item => ({
                    "name": item.id,
                    "Proband Id": item?.proband?.id
                }),
                query: {
                    include: "id,proband"
                }
            },
            "DISEASE_PANEL": {
                searchField: "id",
                placeholder: "Start typing",
                // client: this.opencgaSession.opencgaClient.panels(),
                fetch: filters => this.opencgaSession.opencgaClient.panels().search(filters),
                fields: item => ({
                    "name": item.id,
                }),
                query: {
                    include: "id"
                }
            },
            "JOB": {
                searchField: "id",
                placeholder: "Start typing",
                // client: this.opencgaSession.opencgaClient.jobs(),
                fetch: filters => this.opencgaSession.opencgaClient.jobs().search(filters),
                fields: item => ({
                    "name": item.id,
                }),
                query: {
                    include: "id"
                }
            },
            "COHORT": {
                searchField: "id",
                placeholder: "Start typing",
                // client: this.opencgaSession.opencgaClient.cohorts(),
                fetch: filters => this.opencgaSession.opencgaClient.cohorts().search(filters),
                fields: item => ({
                    "name": item.id
                }),
                query: {
                    include: "id"
                }
            },
            "FILE": {
                searchField: "name",
                placeholder: "eg. samples.tsv, phenotypes.vcf...",
                // client: this.opencgaSession.opencgaClient.files(),
                fetch: filters => this.opencgaSession.opencgaClient.files().search(filters),
                fields: item => ({
                    name: item.name,
                    Format: item.format ?? "N/A",
                    Size: UtilsNew.getDiskUsage(item.size)
                }),
                query: {
                    type: "FILE",
                    include: "id,name,format,size,path",
                }
            },
            "DIRECTORY": {
                searchField: "path",
                placeholder: "eg. /data/platinum-grch38...",
                // client: this.opencgaSession.opencgaClient.files(),
                fetch: filters => this.opencgaSession.opencgaClient.files().search(filters),
                fields: item => ({
                    name: item.name,
                    path: `/${item.path.replace(`/${item.name}`, "")}`
                }),
                query: {
                    type: "DIRECTORY",
                    include: "id,path",
                }
            },
            "NOTE_ORGANIZATION": {
                searchField: "id",
                placeholder: "Start typing",
                // eslint-disable-next-line no-unused-vars
                fetch: ({study, ...params}) => this.opencgaSession.opencgaClient.organization().searchNotes(params),
                fields: item => ({
                    "name": item.id,
                }),
                query: {
                    include: "id",
                    scope: "ORGANIZATION",
                },
            },
            "NOTE_STUDY": {
                searchField: "id",
                placeholder: "Start typing",
                fetch: ({study, ...params}) => this.opencgaSession.opencgaClient.studies().searchNotes(study, params),
                fields: item => ({
                    "name": item.id,
                }),
                query: {
                    include: "id",
                },
            },
        };
        this._config = this.getDefaultConfig();
    }

    onFilterChange(value) {
        LitUtils.dispatchCustomEvent(this, "filterChange", value);
    }

    render() {
        if (!this.resource) {
            return html`resource not provided`;
        }

        return html`
            <select-token-filter
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                .classes="${this.classes}"
                .value="${this.value}"
                @filterChange="${e => this.onFilterChange(e.detail.value)}">
            </select-token-filter>
        `;
    }

    getDefaultConfig() {
        return {
            limit: 10,
            disabled: false,
            maxItems: 0, // no limit set
            placeholder: this.RESOURCES[this.resource].placeholder,
            searchField: this.searchField || this.RESOURCES[this.resource].searchField,
            fields: this.RESOURCES[this.resource].fields,
            source: (params, success, failure) => {
                const page = params?.data?.page || 1;
                const attr = params?.data?.term ? {[this.searchField || this.RESOURCES[this.resource].searchField]: "~/" + params?.data?.term.trim() + "/i"} : null;
                const filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: this._config.limit,
                    count: false,
                    skip: (page - 1) * this._config.limit,
                    ...this.query || this.RESOURCES[this.resource].query,
                    ...attr,
                };
                this.RESOURCES[this.resource].fetch(filters)
                    .then(response => success(response))
                    .catch(error => failure(error));
            },
            preprocessResults(results) {
                // if results come with null, empty or undefined it'll be removed.
                let resultsCleaned = results.filter(r => r);
                if (this.searchField && this.searchField !== "id") {
                    resultsCleaned = resultsCleaned.map(item => {
                        item["id"] = item[this.searchField];
                        return item;
                    });
                }
                if (resultsCleaned.length) {
                    if ("string" === typeof resultsCleaned[0]) {
                        return resultsCleaned.map(s => ({id: s}));
                    }
                }
                return resultsCleaned;
            }
        };
    }

}

customElements.define("catalog-search-autocomplete", CatalogSearchAutocomplete);
