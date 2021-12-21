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
import Types from "../commons/types.js";
import "../study/phenotype/phenotype-list-update.js";
import "../study/annotationset/annotation-set-update.js";


export default class SampleCreate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.sample = {
            phenotypes: [],
            annotationSets: []
        };
        this.annotationSet = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    refreshForm() {
        // When using data-form we need to update config object and render again
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    dispatchSessionUpdateRequest() {
        LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest");
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "id":
            case "description":
            case "somatic":
            case "individualId":
            case "status.name":
            case "status.description":
            case "processing.product":
            case "processing.preparationMethod":
            case "processing.extractionMethod":
            case "processing.labSambpleId":
            case "processing.quantity":
            case "processing.date":
            case "collection.tissue":
            case "collection.organ":
            case "collection.quantity":
            case "collection.method":
            case "collection.date":
                this.sample = {
                    ...FormUtils.createObject(
                        this.sample,
                        param,
                        e.detail.value
                    )
                };
                break;
            case "phenotypes":
                this.sample = {...this.sample, phenotypes: e.detail.value};
                break;
            case "annotationSets":
                this.sample = {...this.sample, annotationSets: e.detail.value};
                break;
        }
        this.requestUpdate();
    }

    onClear(e) {
        Swal.fire({
            title: "Are you sure to clear?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            reverseButtons: true
        }).then(result => {
            if (result.isConfirmed) {
                this.sample = {};
                this.requestUpdate();
                Swal.fire(
                    "Cleaned!",
                    "The fields has been cleaned.",
                    "success"
                );
            }
        });
    }

    onSubmit(e) {
        e.stopPropagation();
        console.log("onSubmit", this.sample);
        this.opencgaSession.opencgaClient
            .samples()
            .create(this.sample, {study: this.opencgaSession.study.fqn})
            .then(res => {
                // dispatchEvent(this.sample)
                this.sample = {};
                this.requestUpdate();
                // this.dispatchSessionUpdateRequest();
                FormUtils.showAlert(
                    "New Sample",
                    "Sample save correctly",
                    "success"
                );
            })
            .catch(err => {
                console.error(err);
            });
    }

    render() {
        return html`
            <data-form
                .data=${this.sample}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>`;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: {
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
            },
            sections: [{
                title: "Sample General Information",
                elements: [
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
                        title: "Name",
                        field: "name",
                        type: "input-text",
                        display: {
                            placeholder: "Add a sample name..."
                        }
                    },
                    {
                        title: "Description",
                        field: "description",
                        type: "input-text",
                        display: {
                            rows: 3,
                            placeholder: "Add a description..."
                        }
                    },
                    {
                        title: "Individual ID",
                        field: "individualId",
                        type: "custom",
                        display: {
                            placeholder: "e.g. Homo sapiens, ...",
                            render: () => html`
                                <individual-id-autocomplete
                                    .value="${this.sample?.individualId}"
                                    .opencgaSession="${this.opencgaSession}"
                                    @filterChange="${e =>
                                        this.onFieldChange({
                                        detail: {
                                            param: "individualId",
                                            value: e.detail.value
                                        }
                                    })}">
                                </individual-id-autocomplete>`
                        }
                    },
                    {
                        title: "Somatic",
                        field: "somatic",
                        type: "checkbox",
                        checked: false
                    },
                    {
                        title: "Status name",
                        field: "status.name",
                        type: "input-text",
                        display: {
                            placeholder: "Add status name..."
                        }
                    },
                    {
                        title: "Status Description",
                        field: "status.description",
                        type: "input-text",
                        display: {
                            rows: 3,
                            placeholder: "Add a status description..."
                        }
                    }
                ]
            },
            {
                title: "Processing Info",
                elements: [
                    {
                        title: "Product",
                        field: "processing.product",
                        type: "input-text",
                        display: {
                            placeholder: "Add a product..."
                        }
                    },
                    {
                        title: "Preparation Method",
                        field: "processing.preparationMethod",
                        type: "input-text",
                        display: {
                            placeholder: "Add a preparation method..."
                        }
                    },
                    {
                        title: "Extraction Method",
                        field: "processing.extractionMethod",
                        type: "input-text",
                        display: {
                            placeholder: "Add a extraction method..."
                        }
                    },
                    {
                        title: "Lab Sample ID",
                        field: "processing.labSambpleId",
                        type: "input-text",
                        display: {
                            placeholder: "Add the lab sample ID..."
                        }
                    },
                    {
                        title: "Quantity",
                        field: "processing.quantity",
                        type: "input-text",
                        display: {
                            placeholder: "Add a quantity..."
                        }
                    },
                    {
                        // id: "processing_date",
                        title: "Date",
                        field: "processing.date",
                        type: "input-date",
                        display: {
                            render: date =>
                                moment(date, "YYYYMMDDHHmmss").format(
                                    "DD/MM/YYYY"
                                )
                        }
                    }
                ]
            },
            {
                title: "Collection Info",
                elements: [
                    {
                        title: "Tissue",
                        field: "collection.tissue",
                        type: "input-text",
                        display: {
                            placeholder: "Add a tissue..."
                        }
                    },
                    {
                        title: "Organ",
                        field: "collection.organ",
                        type: "input-text",
                        display: {
                            placeholder: "Add an organ..."
                        }
                    },
                    {
                        title: "Quantity",
                        field: "collection.quantity",
                        type: "input-text",
                        display: {
                            placeholder: "Add a quantity..."
                        }
                    },
                    {
                        title: "Method",
                        field: "collection.method",
                        type: "input-text",
                        display: {
                            placeholder: "Add a method..."
                        }
                    },
                    {
                        title: "Date",
                        field: "collection.date",
                        type: "input-date",
                        display: {
                            render: date =>
                                moment(date, "YYYYMMDDHHmmss")
                                    .format("DD/MM/YYYY")
                        }
                    },
                ]
            },
            {
                title: "Phenotypes",
                elements: [
                    {
                        field: "phenotype",
                        type: "custom",
                        display: {
                            layout: "vertical",
                            defaultLayout: "vertical",
                            width: 12,
                            style: "padding-left: 0px",
                            render: sample => html`
                                <phenotype-list-update
                                    .phenotypes="${sample?.phenotypes}"
                                    @changePhenotypes="${e => this.onFieldChange(e, "phenotypes")}">
                                </phenotype-list-update>`
                        }
                    },
                ]
            },
            {
                title: "Annotations Sets",
                elements: [
                    {
                        field: "annotationSets",
                        type: "custom",
                        display: {
                            layout: "vertical",
                            defaultLayout: "vertical",
                            width: 12,
                            style: "padding-left: 0px",
                            render: sample => html`
                                <annotation-set-update
                                    .annotationSets="${sample?.annotationSets}"
                                    .opencgaSession="${this.opencgaSession}"
                                    @changeAnnotationSets="${e => this.onFieldChange(e, "annotationSets")}">
                                </annotation-set-update>
                            `
                        }
                    }
                ]
            }]
        });
    }

    // ! DEPRECATED
    getDefaultConfig_() {
        return {
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save"
            },
            display: {
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                help: {
                    mode: "block" // icon
                }
            },
            sections: [
                {
                    title: "Sample General Information",
                    elements: [
                        {
                            name: "Sample ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                help: {
                                    text: "short Sample id for thehis as;lsal"
                                },
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add a sample name..."
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description..."
                            }
                        },
                        {
                            name: "Individual ID",
                            field: "individualId",
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: () => html`
                                    <individual-id-autocomplete
                                        .value="${this.sample?.individualId}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @filterChange="${e =>
                                            this.onFieldChange({
                                            detail: {
                                                param: "individualId",
                                                value: e.detail.value
                                            }
                                        })}">
                                    </individual-id-autocomplete>`
                            }
                        },
                        {
                            id: "creationDate",
                            name: "Creation Date",
                            field: "creationDate",
                            type: "input-date",
                            display: {
                                render: date =>
                                    moment(date, "YYYYMMDDHHmmss").format(
                                        "DD/MM/YYYY"
                                    )
                            }
                        },
                        {
                            id: "modificationDate",
                            name: "Modification Date",
                            field: "modificationDate",
                            type: "input-date",
                            display: {
                                render: date =>
                                    moment(date, "YYYYMMDDHHmmss").format(
                                        "DD/MM/YYYY"
                                    )
                            }
                        },
                        {
                            name: "Somatic",
                            field: "somatic",
                            type: "checkbox",
                            checked: false
                        },
                        {
                            name: "Status name",
                            field: "status.name",
                            type: "input-text",
                            display: {
                                placeholder: "Add status name..."
                            }
                        },
                        {
                            name: "Status Description",
                            field: "status.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a status description..."
                            }
                        }
                    ]
                },
                {
                    title: "Processing Info",
                    elements: [
                        {
                            name: "Product",
                            field: "processing.product",
                            type: "input-text",
                            display: {
                                placeholder: "Add a product..."
                            }
                        },
                        {
                            name: "Preparation Method",
                            field: "processing.preparationMethod",
                            type: "input-text",
                            display: {
                                placeholder: "Add a preparation method..."
                            }
                        },
                        {
                            name: "Extraction Method",
                            field: "processing.extractionMethod",
                            type: "input-text",
                            display: {
                                placeholder: "Add a extraction method..."
                            }
                        },
                        {
                            name: "Lab Sample ID",
                            field: "processing.labSampleId",
                            type: "input-text",
                            display: {
                                placeholder: "Add the lab sample ID..."
                            }
                        },
                        {
                            name: "Quantity",
                            field: "processing.quantity",
                            type: "input-text",
                            display: {
                                placeholder: "Add a quantity..."
                            }
                        },
                        {
                            id: "processing_date",
                            name: "Date",
                            field: "processing.date",
                            type: "input-date",
                            display: {
                                render: date =>
                                    moment(date, "YYYYMMDDHHmmss").format(
                                        "DD/MM/YYYY"
                                    )
                            }
                        }
                    ]
                },
                {
                    title: "Collection Info",
                    elements: [
                        {
                            name: "Tissue",
                            field: "collection.tissue",
                            type: "input-text",
                            display: {
                                placeholder: "Add a tissue..."
                            }
                        },
                        {
                            name: "Organ",
                            field: "collection.organ",
                            type: "input-text",
                            display: {
                                placeholder: "Add an organ..."
                            }
                        },
                        {
                            name: "Quantity",
                            field: "collection.quantity",
                            type: "input-text",
                            display: {
                                placeholder: "Add a quantity..."
                            }
                        },
                        {
                            name: "Method",
                            field: "collection.method",
                            type: "input-text",
                            display: {
                                placeholder: "Add a method..."
                            }
                        },
                        {
                            id: "collection_date",
                            name: "Date",
                            field: "collection.date",
                            type: "input-date",
                            display: {
                                render: date =>
                                    moment(date, "YYYYMMDDHHmmss")
                                        .format("DD/MM/YYYY")
                            }
                        }
                    ]
                },
                {
                    title: "Phenotypes",
                    elements: [
                        {
                            field: "phenotype",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: sample => html`
                                    <phenotype-list-update
                                        .phenotypes="${sample?.phenotypes}"
                                        @changePhenotypes="${e => this.onFieldChange(e, "phenotypes")}">
                                    </phenotype-list-update>`
                            }
                        },
                    ]
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
            ]
        };
    }

}

customElements.define("sample-create", SampleCreate);
