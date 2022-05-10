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
import Types from "../commons/types.js";
import "../commons/forms/data-form.js";
import "../commons/filters/sample-id-autocomplete.js";
import "../study/annotationset/annotation-set-view.js";
import "../loading-spinner.js";
import "../file/file-view.js";

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
        this.isLoading = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.isLoading = true;
            this.sampleIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }

        super.update(changedProperties);
    }

    sampleIdObserver() {
        if (this.sampleId && this.opencgaSession) {
            console.log("loading: ", this.sampleId);
            const query = {
                study: this.opencgaSession.study.fqn,
                includeIndividual: true
            };
            let error;
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, query)
                .then(response => {
                    this.sample = response.responses[0].results[0];
                    console.log("sample:", this.sample);
                    this.isLoading = false;
                })
                .catch(reason => {
                    this.sample = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = {...this.getDefaultConfig(), ...this.config};
                    this.requestUpdate();
                    LitUtils.dispatchCustomEvent(this, "sampleSearch", this.sample, {query: {includeIndividual: true}}, error);
                });
            this.sampleId = "";
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

    renderFileTab(fileIds) {

        const generateFileConfig = file => ({
            id: file,
            name: file,
            render: () => html`
                <file-view
                    .fileId="${file}"
                    .opencgaSession="${this.opencgaSession}"
                    .config=${{nested: true}}>
                </file-view>
            `
        });

        const configTabs = fileIds?.map(file => generateFileConfig(file));

        return html `
            <detail-tabs
                .config="${{items: configTabs}}"
                .opencgaSession="${this.opemgSession}">
            </detail-tabs>
        `;
    }

    render() {
        if (this.isLoading) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        return html`
            <data-form
                .data=${this.sample}
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            title: "Summary",
            icon: "",
            display: {
                buttonsVisible: false,
                collapsable: true,
                titleVisible: false,
                titleWidth: 2,
                defaultValue: "-"
            },
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: sample => !sample?.id,
                    },
                    elements: [
                        {
                            title: "Sample ID",
                            field: "sampleId",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <sample-id-autocomplete
                                        .value="${this.sample?.id}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config=${{multiple: false}}
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </sample-id-autocomplete>
                                `,
                            }
                        }
                    ]
                },
                {
                    title: "General",
                    collapsed: false,
                    display: {
                        visible: sample => sample?.id,
                    },
                    elements: [
                        {
                            title: "Sample ID",
                            type: "custom",
                            display: {
                                render: data => html`
                                    <span style="font-weight: bold">${data.id}</span>
                                    <span style="margin: 0 20px">
                                        <b>Version:</b> ${data.version}
                                    </span>
                                    <span style="margin: 0 20px">
                                        <b>UUID:</b> ${data.uuid}
                                    </span>
                                `,
                            }
                        },
                        {
                            title: "Individual ID",
                            field: "individualId"
                        },
                        // {
                        //     title: "Files",
                        //     field: "fileIds",
                        //     type: "list",
                        //     display: {
                        //         defaultValue: "Files not found or empty",
                        //         contentLayout: "bullets"
                        //     }
                        // },
                        {
                            title: "Somatic",
                            field: "somatic",
                            display: {
                                defaultValue: "false"
                            }
                        },
                        {
                            title: "Status",
                            field: "internal.status",
                            type: "custom",
                            display: {
                                render: field => html`${field?.name} (${UtilsNew.dateFormatter(field?.date)})`,
                            }
                        },
                        {
                            title: "Created on",
                            type: "custom",
                            display: {
                                render: data => {
                                    const creationDate = data.creationDate ? UtilsNew.dateFormatter(data.creationDate): "N/A";
                                    const modificationDate = data.modificationDate ? `(Last modified on ${UtilsNew.dateFormatter(data.modificationDate)})`: "N/A";
                                    return html `
                                        ${creationDate} ${modificationDate}
                                    `;
                                }
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            defaultValue: "N/A",
                        },
                        // {
                        //     title: "Phenotypes",
                        //     field: "phenotypes",
                        //     type: "list",
                        //     defaultValue: "N/A",
                        //     display: {
                        //         contentLayout: "bullets",
                        //         render: phenotype => {
                        //             let id = phenotype?.id;
                        //             if (phenotype?.id?.startsWith("HP:")) {
                        //                 id = html`<a href="https://hpo.jax.org/app/browse/term/${phenotype.id}" target="_blank">${phenotype.id}</a>`;
                        //             }
                        //             return html`${phenotype?.name} (${id})`;
                        //         },
                        //     }
                        // },
                        /*
                            {
                                title: "Annotation sets",
                                field: "annotationSets",
                                type: "custom",
                                display: {
                                    render: field => html`<annotation-sets-view .annotationSets="${field}"></annotation-sets-view>`
                                }
                            }
                        */
                    ]
                },
                {
                    title: "Phenotypes",
                    display: {
                        visible: data => data?.phenotypes,
                    },
                    elements: [
                        {
                            field: "phenotypes",
                            type: "table",
                            display: {
                                defaultValue: "No phenotypes found",
                                errorMessage: "Error",
                                columns: [
                                    {
                                        title: "ID",
                                        type: "custom",
                                        display: {
                                            render: phenotype => html`<span style="font-weight: bold">${phenotype.id}</span>`,
                                        },
                                    },
                                    {
                                        title: "Name",
                                        field: "name",
                                        defaultValue: "N/A"
                                    },
                                    {
                                        title: "Source",
                                        field: "source  ",
                                        defaultValue: "N/A"
                                    },
                                    {
                                        title: "Status",
                                        field: "status.name",
                                        defaultValue: "N/A"
                                    },
                                    {
                                        title: "Description",
                                        field: "description",
                                        defaultValue: "N/A"
                                    },
                                ]
                            }
                        }
                    ]
                },
                {
                    title: "Files",
                    display: {
                        visible: data => data?.fileIds,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => this.renderFileTab(data.fileIds)
                            }
                        }
                    ]
                }
            ]
        });
    }

}

customElements.define("sample-view", SampleView);
