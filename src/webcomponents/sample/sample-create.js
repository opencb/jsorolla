/**
 * Copyright 2015-2021 OpenCB
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
import FormUtils from "../commons/forms/form-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import Types from "../commons/types.js";
import UtilsNew from "../../core/utils-new.js";
import "../study/annotationset/annotation-set-update.js";
import "../study/ontology-term-annotation/ontology-term-annotation-create.js";
import "../study/ontology-term-annotation/ontology-term-annotation-update.js";
import "../study/status/status-create.js";
import "./external-source/external-source-create.js";
import "../commons/filters/catalog-search-autocomplete.js";

export default class SampleCreate extends LitElement {

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
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.sample = {};
        this.collection = {from: []};
        this.annotationSet = {};
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Create"
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }


    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "id":
            case "description":
            case "individualId":
            case "somatic":
            case "status": // it's object
            case "source": // it's object
            case "processing.product": // it's object
            case "processing.preparationMethod":
            case "processing.extractionMethod":
            case "processing.labSambpleId":
            case "processing.quantity":
            case "processing.date":
            case "collection.type":
            case "collection.quantity":
            case "collection.method":
            case "collection.date":
                // case "collection.from": // this is list object
                // case "phenotypes": // this is object
                this.sample = {
                    ...FormUtils.createObject(
                        this.sample,
                        param,
                        e.detail.value
                    )
                };
                break;
            case "annotationSets":
                // Rodiel (03/03/2022): At the moment IVA DOES NOT SUPPORT
                // creating annotation sets
                this.sample = {...this.sample, annotationSets: e.detail.value};
                break;
        }
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear sample",
            message: "Are you sure to clear?",
            ok: () => {
                this.sample = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            includeResult: true
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.samples()
            .create(this.sample, params)
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Sample Create",
                    message: "Sample created correctly"
                });
            })
            .catch(reason => {
                error = reason;
                console.error(reason);
            })
            .finally(() => {
                this.sample = {};
                this._config = this.getDefaultConfig();
                LitUtils.dispatchCustomEvent(this, "sampleCreate", this.sample, {}, error);
                this.#setLoading(false);
            });
    }

    onAddOrUpdateItem(e) {
        switch (e.detail.param) {
            case "collection.from":
                this.collection = {...this.collection, from: e.detail.value};
                if (UtilsNew.isNotEmpty(this.collection?.from)) {
                    this.sample = {...this.sample, collection: this.collection};
                } else {
                    this.sample = {...this.sample, collection: []};
                    delete this.sample["collection"]["from"];
                }
                break;
            case "phenotypes":
                if (UtilsNew.isNotEmpty(e.detail.value)) {
                    this.sample = {...this.sample, phenotypes: e.detail.value};
                } else {
                    this.sample = {...this.sample, phenotypes: []};
                    delete this.sample["phenotypes"];
                }
                break;
            case "annotationSets":
                // Coming Soon
                break;
        }
        this.requestUpdate();
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this.sample}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @addOrUpdateItem="${e => this.onAddOrUpdateItem(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>`;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => Object.keys(this.sample).length > 0,
                                notificationType: "warning",
                            },
                        },
                        {
                            title: "Sample ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: "short sample id...",
                            },
                        },
                        {
                            title: "Individual ID",
                            field: "individualId",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: individualId => html`
                                    <catalog-search-autocomplete
                                        .value="${individualId}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e =>
                                            this.onFieldChange({
                                                detail: {
                                                    param: "individualId",
                                                    value: e.detail.value,
                                                }
                                            })}">
                                    </catalog-search-autocomplete>`
                            },
                        },
                        {
                            title: "Somatic",
                            field: "somatic",
                            type: "checkbox",
                            checked: false,
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description...",
                            },
                        },
                        {
                            title: "Source",
                            field: "source",
                            type: "custom",
                            display: {
                                render: source => html`
                                    <external-source-create
                                        .source="${source}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            width: 12,
                                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px",
                                        }}"
                                        @fieldChange="${e => this.onFieldChange(e, "source")}">
                                    </external-source-create>`
                            },
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                render: status => html`
                                    <status-create
                                        .status="${status}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            width: 12,
                                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px",
                                        }}"
                                        @fieldChange="${e => this.onFieldChange(e, "status")}">
                                    </status-create>`
                            },
                        },
                    ],
                },
                {
                    title: "Processing Info",
                    elements: [
                        {
                            title: "Product",
                            field: "processing.product",
                            type: "custom",
                            display: {
                                render: product => html`
                                    <ontology-term-annotation-create
                                        .ontology="${product}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonsVisible: false,
                                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px",
                                        }}"
                                        @fieldChange="${e => this.onFieldChange(e, "processing.product")}">
                                    </ontology-term-annotation-create>`
                            },
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
                            field: "processing.labSambpleId",
                            type: "input-text",
                            display: {
                                placeholder: "Add the lab sample ID...",
                            },
                        },
                        {
                            title: "Quantity",
                            field: "processing.quantity",
                            type: "input-num",
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
                            title: "From",
                            field: "collection.from",
                            type: "custom-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                renderUpdate: (from, callback) => {
                                    return html`
                                        <ontology-term-annotation-update
                                            .ontology="${from}"
                                            .displayConfig="${{
                                                defaultLayout: "vertical",
                                                style: "margin-bottom:0px",
                                                buttonOkText: "Save",
                                                buttonClearText: "",
                                            }}"
                                            @updateItem="${callback}">
                                        </ontology-term-annotation-update>`;
                                },
                                renderCreate: (from, callback) => html`
                                    <label>Create new item</label>
                                    <ontology-term-annotation-create
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonOkText: "Add",
                                            buttonClearText: "",
                                        }}"
                                        @addItem="${callback}">
                                    </ontology-term-annotation-create>`
                            },
                        },
                        {
                            title: "Type",
                            field: "collection.type",
                            type: "input-text",
                            display: {
                                placeholder: "Add an type...",
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
                            title: "Phenotype",
                            field: "phenotypes",
                            type: "custom-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                renderUpdate: (pheno, callback) => html`
                                    <ontology-term-annotation-update
                                        .ontology="${pheno}"
                                        .entity="${"phenotype"}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonOkText: "Save",
                                            buttonClearText: "",
                                        }}"
                                        @updateItem="${callback}">
                                    </ontology-term-annotation-update>
                                `,
                                renderCreate: (pheno, callback) => html`
                                    <label>Create new item</label>
                                    <ontology-term-annotation-create
                                        .entity="${"phenotype"}"
                                        .displayConfig="${{
                                            defaultLayout: "vertical",
                                            buttonOkText: "Add",
                                            buttonClearText: "",
                                        }}"
                                        @addItem="${callback}">
                                    </ontology-term-annotation-create>
                                `
                            },
                        },
                    ],
                },
                // {
                //     title: "Annotations Sets",
                //     elements: [
                //         {
                //             field: "annotationSets",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: sample => html`
                //                     <annotation-set-update
                //                         .annotationSets="${sample?.annotationSets}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @changeAnnotationSets="${e => this.onFieldChange(e, "annotationSets")}">
                //                     </annotation-set-update>
                //                 `
                //             }
                //         }
                //     ]
                // }
            ],
        });
    }

}

customElements.define("sample-create", SampleCreate);
