/**
 * Copyright 2015-2022 OpenCB
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
import Types from "../commons/types.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/tool-header.js";
import "../commons/filters/catalog-search-autocomplete.js";

export default class CohortUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cohortId: {
                type: String
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._cohort = {};
        this.cohortId = "";
        this.displayConfig = {};

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onComponentIdObserver(e) {
        this._cohort = UtilsNew.objectClone(e.detail.value);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }


    render() {
        return html`
            <opencga-update
                    .resource="${"COHORT"}"
                    .componentId="${this.cohortId}"
                    .opencgaSession="${this.opencgaSession}"
                    .active="${this.active}"
                    .config="${this._config}"
                    @componentIdObserver="${this.onComponentIdObserver}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: this.displayConfig,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Cohort ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: true,
                                helpMessage: this._cohort.creationDate? "Created on " + UtilsNew.dateFormatter(this._cohort.creationDate) : "No creation date",
                                validation: {
                                }
                            }
                        },
                        {
                            title: "Sample ID(s)",
                            field: "samples",
                            type: "custom",
                            display: {
                                render: (samples, dataFormFilterChange, updateParams) => {
                                    const sampleIds = Array.isArray(samples) ?
                                        samples?.map(sample => sample.id).join(",") :
                                        samples;
                                    const handleSamplesFilterChange = e => {
                                        // We need to convert value from a string wth commas to an array of IDs
                                        const sampleList = (e.detail?.value?.split(",") || [])
                                            .filter(sampleId => sampleId)
                                            .map(sampleId => ({id: sampleId}));
                                        dataFormFilterChange(sampleList);
                                    };
                                    return html `
                                        <catalog-search-autocomplete
                                            .value="${sampleIds}"
                                            .resource="${"SAMPLE"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .classes="${updateParams.samples ? "selection-updated" : ""}"
                                            .config="${{multiple: true}}"
                                            @filterChange="${e => handleSamplesFilterChange(e)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a cohort description...",
                            }
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "object",
                            elements: [
                                {
                                    title: "ID",
                                    field: "status.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ID",
                                    }
                                },
                                {
                                    title: "Name",
                                    field: "status.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add source name"
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "status.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
                        },
                    ]
                },
            ]
        });
    }

}

customElements.define("cohort-update", CohortUpdate);
