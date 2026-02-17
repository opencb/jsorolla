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

import {html, LitElement, nothing} from "lit";
import LitUtils from "../utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../forms/token-dropdown.js";

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
                placeholder: "Project...",
                fetch: ({study, ...params}) => this.opencgaSession.opencgaClient.projects().search(params),
                fields: item => ({
                    name: item.id,
                }),
                query: {
                    include: "id,name"
                }
            },
            "STUDY": {
                searchField: "fqn",
                placeholder: "Study...",
                fetch: ({study, ...params}) => this.opencgaSession.opencgaClient.studies().search(this.opencgaSession.project.id, params),
                fields: item => ({
                    name: item.id,
                }),
                query: {
                    include: "id,name,fqn"
                }
            },
            "SAMPLE": {
                searchField: "id",
                placeholder: "HG01879, HG01880, HG01881...",
                fetch: filters => this.opencgaSession.opencgaClient.samples().search(filters),
                fields: item => ({
                    name: item.id,
                    Individual: item.individualId || "-",
                }),
                query: {
                    include: "id,individualId"
                }
            },
            "INDIVIDUAL": {
                searchField: "id",
                placeholder: "Start typing",
                fetch: filters => this.opencgaSession.opencgaClient.individuals().search(filters),
                fields: item => ({
                    name: item.id,
                    Sex: item.sex ? item.sex.id : "-",
                }),
                query: {
                    include: "id,name,sex"
                }
            },
            "FAMILY": {
                searchField: "id",
                placeholder: "Start typing",
                fetch: filters => this.opencgaSession.opencgaClient.families().search(filters),
                fields: item => ({
                    name: item.id
                }),
                query: {
                    include: "id"
                }
            },
            "CLINICAL_ANALYSIS": {
                searchField: "id",
                placeholder: "Start typing",
                fetch: filters => this.opencgaSession.opencgaClient.clinical().search(filters),
                fields: item => ({
                    name: item.id,
                    Proband: item?.proband?.id
                }),
                query: {
                    include: "id,name,proband.id"
                }
            },
            "DISEASE_PANEL": {
                searchField: "id",
                placeholder: "Start typing",
                fetch: filters => this.opencgaSession.opencgaClient.panels().search(filters),
                fields: item => ({
                    name: item.id,
                    Source: item.source.project ? `${item.source.project} (${item.source.author})` : "-"
                }),
                query: {
                    include: "id,name,source"
                }
            },
            "JOB": {
                searchField: "id",
                placeholder: "Start typing",
                fetch: filters => this.opencgaSession.opencgaClient.jobs().search(filters),
                fields: item => ({
                    name: item.id,
                    "#Tool": item.tool.id
                }),
                query: {
                    include: "id,tool"
                }
            },
            "COHORT": {
                searchField: "id",
                placeholder: "Start typing",
                fetch: filters => this.opencgaSession.opencgaClient.cohorts().search(filters),
                fields: item => ({
                    name: item.id,
                    "#Samples": `${item.numSamples} samples`
                }),
                query: {
                    include: "id,name,numSamples"
                }
            },
            "FILE": {
                searchField: "name",
                placeholder: "eg. samples.tsv, phenotypes.vcf...",
                fetch: filters => this.opencgaSession.opencgaClient.files().search(filters),
                fields: item => ({
                    name: item.name,
                    "#Path": `/${item.path.replace(`/${item.name}`, "")}`,
                    "#Format": `${item.type === "FILE" ? `${item.format || "N/A"} (${UtilsNew.getDiskUsage(item.size)})` : ""}`,
                }),
                query: {
                    type: "FILE",
                    include: "id,name,type,format,size,path",
                }
            },
            "USER_TOOL": {
                searchField: "id",
                placeholder: "Start typing",
                fetch: filters => this.opencgaSession.opencgaClient.userTools().search(filters),
                fields: item => ({
                    id: item.id,
                    name: item.id,
                }),
                query: {
                    include: "id,name",
                },
            },
            "DIRECTORY": {
                searchField: "path",
                placeholder: "eg. /data/platinum-grch38...",
                fetch: filters => this.opencgaSession.opencgaClient.files().search(filters),
                fields: item => ({
                    name: item.name,
                    "#Path": `/${item.path.replace(`/${item.name}`, "")}`
                }),
                query: {
                    type: "DIRECTORY",
                    include: "id,name,path",
                }
            },
            "WORKFLOW": {
                searchField: "id",
                placeholder: "Start typing",
                fetch: filters => this.opencgaSession.opencgaClient.workflows().search(filters),
                fields: item => ({
                    id: item.id,
                    name: item.name || "-",
                }),
                query: {
                    include: "id,name"
                }
            },
            "NOTE_ORGANIZATION": {
                searchField: "id",
                placeholder: "Start typing",
                fetch: ({study, ...params}) => this.opencgaSession.opencgaClient.organization().searchNotes(params),
                fields: item => ({
                    name: item.id,
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
                    name: item.id,
                }),
                query: {
                    include: "id",
                },
            },
        };
        this._config = this.getDefaultConfig();
    }

    fetch(params, success, failure) {
        const query = params?.query || "";
        const searchField = this.getSearchField();
        const attr = query ? {[searchField]: "~/" + query.trim() + "/i"} : null;
        const filters = {
            study: this.opencgaSession.study.fqn,
            limit: this._config.limit,
            count: false,
            ...this.query || this.RESOURCES[this.resource].query,
            ...attr,
        };

        this.RESOURCES[this.resource].fetch(filters)
            .then(response => {
                let results = response.getResults();
                if (this._config.additionalValues?.length > 0) {
                    results = [
                        ...this._config.additionalValues,
                        ...results
                    ];
                }

                // preprocessResults logic
                results = results.filter(r => !!r);
                if (searchField && searchField !== "id") {
                    results = results.map(item => {
                        return {
                            ...item,
                            id: item[searchField],
                        };
                    });
                }

                success(results);
            })
            .catch(error => failure(error));
    }

    getFields(item) {
        if (typeof this.RESOURCES[this.resource].fields === "function") {
            return this.RESOURCES[this.resource].fields(item);
        }
        return item.id;
    }

    getSearchField() {
        return this.searchField || this.RESOURCES[this.resource]?.searchField;
    }

    onFilterChange(event) {
        event.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "filterChange", event.detail.value);
    }

    renderItem(item) {
        const fields = this.getFields(item);
        const {name, ...rest} = typeof fields === "object" ? fields : {name: fields};
        return html`
            <div class="d-flex flex-column my-1">
                <span class="fw-bold">${name}</span>
                ${Object.entries(rest || {}).map(([label, value]) => html`
                    <div class="small text-secondary">
                        ${!label.startsWith("#") ? html`
                            <label class="pe-1">${label}: </label>
                        ` : nothing}
                        <span>${value || nothing}</span>
                    </div>
                `)}
            </div>
        `;
    }

    render() {
        if (!this.resource) {
            return html`resource not provided`;
        }

        return html`
            <token-dropdown
                .value="${this.value}"
                .placeholder="${this._config.placeholder || this.RESOURCES[this.resource]?.placeholder}"
                .fetch="${(params, success, failure) => this.fetch(params, success, failure)}"
                .renderItem="${item => this.renderItem(item)}"
                ?disabled="${this._config.disabled}"
                ?editable="${this._config.editable}"
                ?multiple="${this._config.multiple}"
                @filterChange="${event => this.onFilterChange(event)}">
            </token-dropdown>
        `;
    }

    getDefaultConfig() {
        return {
            limit: 10,
            disabled: false,
            editable: false,
            placeholder: "",
            multiple: true,
            additionalValues: [],
        };
    }

}

customElements.define("catalog-search-autocomplete", CatalogSearchAutocomplete);
