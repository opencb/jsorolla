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
import LitUtils from "../commons/utils/lit-utils.js";
import UtilsNew from "../../core/utilsNew.js";
import "../commons/forms/data-form.js";
import "../study/annotationset/annotation-sets-view.js";


export default class SampleView extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            sample: {
                type: Object
            },
            sampleId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.sample = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    sampleIdObserver() {
        if (this.sampleId && this.opencgaSession) {
            const query = {
                study: this.opencgaSession.study.fqn,
                includeIndividual: true
            };
            let error;
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, query)
                .then(response => {
                    this.sample = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.sample = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = {...this.getDefaultConfig(), ...this.config};
                    this.requestUpdate();
                    // this.notify(error);
                    LitUtils.dispatchEventCustom(this, "sampleSearch", this.sample, error, {query: {includeIndividual: true}});
                });
        }
    }

    onFilterChange(e) {
        // This must call sampleIdObserver function
        this.sampleId = e.detail.value;
    }

    notify(error) {
        this.dispatchEvent(new CustomEvent("sampleSearch", {
            detail: {
                value: this.sample,
                query: {
                    includeIndividual: true
                },
                status: {
                    // true if error is defined and not empty
                    error: !!error,
                    message: error
                }
            },
            bubbles: true,
            composed: true
        }));
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                buttons: {
                    show: false
                },
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-"
            },
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: sample => !sample?.id
                    },
                    elements: [
                        {
                            name: "Sample ID",
                            field: "sampleId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <sample-id-autocomplete
                                        .value="${this.sample?.id}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config=${{
                                            addButton: false,
                                            multiple: false
                                        }}
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </sample-id-autocomplete>`
                            }
                        }
                    ]
                },
                {
                    title: "General",
                    collapsed: false,
                    display: {
                        visible: sample => sample?.id
                    },
                    elements: [
                        {
                            name: "Sample ID",
                            type: "custom",
                            display: {
                                visible: sample => sample?.id,
                                render: data => html`<span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})`
                            }
                        },
                        {
                            name: "Individual ID",
                            field: "individualId"
                        },
                        {
                            name: "Files",
                            field: "fileIds",
                            type: "list",
                            display: {
                                defaultValue: "Files not found or empty",
                                contentLayout: "bullets"
                            }
                        },
                        {
                            name: "Somatic",
                            field: "somatic",
                            display: {
                                defaultValue: "false"
                            }
                        },
                        {
                            name: "Version",
                            field: "version"
                        },
                        {
                            name: "Status",
                            field: "internal.status",
                            type: "custom",
                            display: {
                                render: field => html`${field?.name} (${UtilsNew.dateFormatter(field?.date)})`
                            }
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`
                            }
                        },
                        {
                            name: "Modification Date",
                            field: "modificationDate",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`
                            }
                        },
                        {
                            name: "Description",
                            field: "description"
                        },
                        {
                            name: "Phenotypes",
                            field: "phenotypes",
                            type: "list",
                            display: {
                                contentLayout: "bullets",
                                render: phenotype => {
                                    let id = phenotype.id;
                                    if (phenotype.id.startsWith("HP:")) {
                                        id = html`<a href="https://hpo.jax.org/app/browse/term/${phenotype.id}" target="_blank">${phenotype.id}</a>`;
                                    }
                                    return html`${phenotype.name} (${id})`;
                                },
                                defaultValue: "N/A"
                            }
                        },
                        /*
                            {
                                name: "Annotation sets",
                                field: "annotationSets",
                                type: "custom",
                                display: {
                                    render: field => html`<annotation-sets-view .annotationSets="${field}"></annotation-sets-view>`
                                }
                            }
                        */
                    ]
                }
            ]
        };
    }

    render() {
        if (!this.sample) {
            return html`
                <h2>Sample not found</h2>
            `;
        }

        return html`
            <data-form .data=${this.sample} .config="${this._config}"></data-form>
        `;
    }

}

customElements.define("sample-view", SampleView);
