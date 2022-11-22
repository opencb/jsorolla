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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";
import "../study/annotationset/annotation-set-update.js";
import "../study/status/status-update.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../commons/opencga-update.js";

export default class SampleUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
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
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.sample = {};
        this.sampleId = "";
        // this.updatedFields = {};
        // this.isLoading = false;

        // this.displayConfigDefault = {
        //     style: "margin: 10px",
        //     defaultLayout: "horizontal",
        //     labelAlign: "right",
        //     labelWidth: 3,
        //     buttonOkText: "Update"
        // };

        this._config = this.getDefaultConfig();
    }

    // #setLoading(value) {
    //     this.isLoading = value;
    //     this.requestUpdate();
    // }

    update(changedProperties) {
        // if (changedProperties.has("sample")) {
            // this.sampleObserver();
        // }
        // if (changedProperties.has("sampleId")) {
            // this.sampleIdObserver();
        // }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                // ...this.displayConfigDefault,
                ...this.displayConfig,
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    // sampleObserver() {
    //     if (this.sample && this.opencgaSession) {
    //         this.initOriginalObjects();
    //     }
    // }

    // initOriginalObjects() {
    //     this._sample = UtilsNew.objectClone(this.sample);
    //     this._config = this.getDefaultConfig();
    //     this.updatedFields = {};
    //     this.sampleId = "";
    // }

    // sampleIdObserver() {
    //     if (this.sampleId && this.opencgaSession) {
    //         const params = {
    //             study: this.opencgaSession.study.fqn,
    //             includeIndividual: true
    //         };
    //         let error;
    //         this.#setLoading(true);
    //         this.opencgaSession.opencgaClient.samples()
    //             .info(this.sampleId, params)
    //             .then(response => {
    //                 this.sample = response.responses[0].results[0];
    //             })
    //             .catch(reason => {
    //                 error = reason;
    //                 NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
    //             })
    //             .finally(() => {
    //                 LitUtils.dispatchCustomEvent(this, "sampleUpdate", this.sample, {query: {...params}}, error);
    //                 this.#setLoading(false);
    //             });
    //     }
    // }

    // onFieldChange(e, field) {
    //     const param = field || e.detail.param;
    //     this.updatedFields = FormUtils.getUpdatedFields(
    //         this.sample,
    //         this.updatedFields,
    //         param,
    //         e.detail.value);
    //     this.requestUpdate();
    // }

    // onClear() {
    //     NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
    //         title: "Discard changes",
    //         message: "Are you sure you want to discard the changes made?",
    //         ok: () => {
    //             this.initOriginalObjects();
    //             this.requestUpdate();
    //         },
    //     });
    // }

    // onSubmit() {
    //     const params = {
    //         study: this.opencgaSession.study.fqn,
    //         phenotypesAction: "SET",
    //         includeResult: true
    //     };
    //
    //     const updateParams = FormUtils.getUpdateParams(this._sample, this.updatedFields, ["status.date"]);
    //
    //     FormUtils.update({
    //         component: this,
    //         resource: "SAMPLE",
    //         // updateEventId: "sampleUpdate",
    //         // setLoading: loading => this.#setLoading(loading),
    //         // original: this.sample,
    //         updateParams,
    //         params,
    //         // endpoint: this.opencgaSession.opencgaClient.samples(),
    //         // successNotification: {
    //         //     title: "Sample Update",
    //         //     message: "Sample updated correctly"
    //         // }
    //     }).then(result => {
    //         this.sample = result;
    //     }).catch(error => {
    //         console.log(error);
    //     });
    //
    // /*
    //     let error;
    //     this.#setLoading(true);
    //     this.opencgaSession.opencgaClient.samples()
    //         .update(this.sample.id, updateParams, params)
    //         .then(response => {
    //             this.sample = UtilsNew.objectClone(response.responses[0].results[0]);
    //             this.updatedFields = {};
    //             NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
    //                 title: "Sample Update",
    //                 message: "Sample updated correctly"
    //             });
    //         })
    //         .catch(reason => {
    //             error = reason;
    //             NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
    //         })
    //         .finally(() => {
    //             LitUtils.dispatchCustomEvent(this, "sampleUpdate", this.sample, {}, error);
    //             this.#setLoading(false);
    //         });
    // */
    // }

    // Display a button to back sample browser.
    // onShowBtnSampleBrowser() {
    //     const query = {
    //         xref: this.sampleId
    //     };
    //
    //     const showBrowser = () => {
    //         LitUtils.dispatchCustomEvent(this, "querySearch", null, {query: query}, null);
    //         const hash = window.location.hash.split("/");
    //         window.location.hash = "#sample/" + hash[1] + "/" + hash[2];
    //     };
    //
    //     return html `
    //         <div style="float: right;padding: 10px 5px 10px 5px">
    //             <button type="button" class="btn btn-primary" @click="${showBrowser}">
    //                 <i class="fa fa-hand-o-left-borrame" aria-hidden="true"></i> Sample Browser
    //             </button>
    //         </div>
    //     `;
    // }

    // render() {
    //     if (this.isLoading) {
    //         return html`<loading-spinner></loading-spinner>`;
    //     }
    //
    //     if (!this.sample?.id) {
    //         return html `
    //             <div class="alert alert-info">
    //                 <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
    //                 The sample does not have a Sample ID.
    //             </div>
    //         `;
    //     }
    //
    //     return html`
    //         ${this._config?.display?.showBtnSampleBrowser ? this.onShowBtnSampleBrowser() : nothing}
    //         <data-form
    //             .data="${this._sample}"
    //             .config="${this._config}"
    //             .updateParams="${this.updatedFields}"
    //             @fieldChange="${e => this.onFieldChange(e)}"
    //             @clear="${this.onClear}"
    //             @submit="${this.onSubmit}">
    //         </data-form>
    //     `;
    // }

    // render() {
    //
    //     return html`
    //         ${this._config?.display?.showBtnSampleBrowser ? this.onShowBtnSampleBrowser() : nothing}
    //         <data-form
    //             .data="${this._sample}"
    //             .config="${this._config}"
    //             .updateParams="${this.updatedFields}"
    //             @fieldChange="${e => this.onFieldChange(e)}"
    //             @clear="${this.onClear}"
    //             @submit="${this.onSubmit}">
    //         </data-form>
    //     `;
    // }

    render() {
        return html`
            <opencga-update
                .resource="${"SAMPLE"}"
                .component="${this.sample}"
                .componentId="${this.sampleId}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                clearText: "Discard Changes",
                okText: "Update",
            },
            display: this.displayConfig, // || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        // {
                        //     type: "notification",
                        //     text: "Some changes have been done in the form. Not saved, changes will be lost",
                        //     display: {
                        //         visible: () => !UtilsNew.isObjectValuesEmpty(this.updatedFields),
                        //         notificationType: "warning",
                        //     },
                        // },
                        {
                            title: "Sample ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: this.sample.creationDate ? "Created on " + UtilsNew.dateFormatter(this.sample.creationDate):"No creation date",
                                disabled: true,
                            },
                        },
                        {
                            title: "Individual ID",
                            field: "individualId",
                            type: "custom",
                            display: {
                                placeholder: "Individual ID ...",
                                render: (individualId, dataFormFilterChange, updateParams) => html`
                                    <catalog-search-autocomplete
                                        .value="${individualId}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${updateParams?.individualId ? "selection-updated" : ""}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Somatic",
                            field: "somatic",
                            type: "checkbox",
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 2,
                                placeholder: "Add a description...",
                            },
                        },
                        {
                            title: "Source",
                            field: "source",
                            type: "object",
                            elements: [
                                {
                                    title: "ID",
                                    field: "source.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ID",
                                    }
                                },
                                {
                                    title: "Name",
                                    field: "source.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add source name"
                                    }
                                },
                                {
                                    title: "Source",
                                    field: "source.source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "External source name"
                                    }
                                },
                                {
                                    title: "URL",
                                    field: "source.url",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a URL"
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "source.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
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
                    ],
                },
                {
                    title: "Processing Info",
                    elements: [
                        {
                            title: "Product Processing",
                            field: "processing.product",
                            type: "object",
                            display: {},
                            elements: [
                                {
                                    title: "ID",
                                    field: "processing.product.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    },
                                },
                                {
                                    title: "Name",
                                    field: "processing.product.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    },
                                },
                                {
                                    title: "Source",
                                    field: "processing.product.source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ontology source...",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "processing.product.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    },
                                },
                            ]
                        },
                        {
                            title: "Preparation Method",
                            field: "processing.preparationMethod",
                            type: "input-text",
                            display: {
                                placeholder: "Add a preparation method...",
                            },
                        },
                        {
                            title: "Extraction Method",
                            field: "processing.extractionMethod",
                            type: "input-text",
                            display: {
                                placeholder: "Add a extraction method...",
                            },
                        },
                        {
                            title: "Lab Sample ID",
                            field: "processing.labSampleId",
                            type: "input-text",
                            display: {
                                placeholder: "Add the lab sample ID...",
                            },
                        },
                        {
                            title: "Quantity",
                            field: "processing.quantity",
                            type: "input-num",
                            allowedValues: [0, 10],
                            step: 0.01,
                            display: {
                                placeholder: "Add a quantity...",
                            },
                        },
                        {
                            title: "Date",
                            field: "processing.date",
                            type: "input-date",
                            display: {
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
                            },
                        },
                    ],
                },
                {
                    title: "Collection Info",
                    elements: [
                        {
                            title: "Collection",
                            field: "collection.from",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: pheno => html`
                                    <div>${pheno.id} - ${pheno?.name}</div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Collection ID",
                                    field: "collection.from[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    },
                                },
                                {
                                    title: "name",
                                    field: "collection.from[].name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    },
                                },
                                {
                                    title: "Source",
                                    field: "collection.from[].source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a source...",
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "collection.from[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 3,
                                        placeholder: "Add a description..."
                                    },
                                },
                            ],
                        },
                        {
                            title: "Type",
                            field: "collection.type",
                            type: "input-text",
                            display: {
                                placeholder: "Add the type of sample collection...",
                            },
                        },
                        {
                            title: "Quantity",
                            field: "collection.quantity",
                            type: "input-num",
                            display: {
                                placeholder: "Add a quantity...",
                            },
                        },
                        {
                            title: "Method",
                            field: "collection.method",
                            type: "input-text",
                            display: {
                                placeholder: "Add a method...",
                            },
                        },
                        {
                            title: "Date",
                            field: "collection.date",
                            type: "input-date",
                            display: {
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
                            },
                        },
                    ],
                },
                {
                    title: "Phenotypes",
                    elements: [
                        {
                            title: "Phenotypes",
                            field: "phenotypes",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: pheno => html`<div>${pheno.id} - ${pheno?.name}</div>`,
                                // unique: "phenotypes[].id"
                            },
                            elements: [
                                {
                                    title: "Phenotype ID",
                                    field: "phenotypes[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add phenotype ID...",
                                    },
                                },
                                {
                                    title: "Name",
                                    field: "phenotypes[].name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    },
                                },
                                {
                                    title: "Source",
                                    field: "phenotypes[].source",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a source...",
                                    },
                                },
                                {
                                    title: "Age of onset",
                                    field: "phenotypes[].ageOfOnset",
                                    type: "input-num",
                                    allowedValues: [0],
                                    display: {
                                        placeholder: "Add an age of onset..."
                                    },
                                },
                                {
                                    title: "Status",
                                    field: "phenotypes[].status",
                                    type: "select",
                                    allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"],
                                    display: {
                                        placeholder: "Select a status..."
                                    },
                                },
                                {
                                    title: "Description",
                                    field: "phenotypes[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    }

}

customElements.define("sample-update", SampleUpdate);
