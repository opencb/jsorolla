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
import UtilsNew from "../../core/utilsNew.js";
import LitUtils from "../commons/utils/lit-utils.js";
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
        this._prefix = UtilsNew.randomString(8);
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
        LitUtils.dispatchEventCustom(this, "sessionUpdateRequest");
    }

    onFieldChange(e) {
        const [field, prop] = e.detail.param.split(".");
        if (e.detail.value) {
            switch (e.detail.param) {
                case "id":
                case "description":
                case "somatic":
                case "individualId":
                    // this.sample[field] = e.detail.value;
                    // this.refreshForm();
                    // break;
                    this.sample[field] = e.detail.value;
                    break;
                case "status.name":
                case "status.description":
                case "processing.product":
                case "processing.preparationMethod":
                case "processing.extrationMethod":
                case "processing.labSambpleId":
                case "processing.quantity":
                case "processing.date":
                case "collection.tissue":
                case "collection.organ":
                case "collection.quantity":
                case "collection.method":
                case "collection.date":
                    this.sample[field] = {
                        ...this.sample[field],
                        [prop]: e.detail.value
                    };
            }
        } else {
            if (prop) {
                delete this.sample[field][prop];
            } else {
                delete this.sample[field];
            }
        }
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
        console.log("onSubmit", this, this.sample);
        this.sample = {};
        this.requestUpdate();
        // this.opencgaSession.opencgaClient
        //     .samples()
        //     .create(this.sample, {study: this.opencgaSession.study.fqn})
        //     .then(res => {
        //         dispatchEvent(this.sample)
        //         this.sample = {};
        //         this.requestUpdate();
        //         // this.dispatchSessionUpdateRequest();

        //         FormUtils.showAlert(
        //             "New Sample",
        //             "Sample save correctly",
        //             "success"
        //         );
        //     })
        //     .catch(err => {
        //         console.error(err);
        //     });
    }

    onSyncPhenotypes(e) {
        e.stopPropagation();
        // console.log("Updated list", this);
        this.sample = {...this.sample, phenotypes: e.detail.value};
    }

    onSyncAnnotationSets(e) {
        e.stopPropagation();
        console.log("Updated list ", this);
        this.sample = {...this.sample, annotationSets: e.detail.value};
    }

    getDefaultConfig() {
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
                                validation: {}
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Sample name..."
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
                                placeholder: "Sample description..."
                            }
                        },
                        {
                            name: "Status Description",
                            field: "status.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Sample description..."
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
                            field: "processing.extrationMethod",
                            type: "input-text",
                            display: {
                                placeholder: "Add a extraction method..."
                            }
                        },
                        {
                            name: "Lab Sample ID",
                            field: "processing.labSambpleId",
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
                                render: () => html`
                                    <phenotype-list-update
                                        .phenotypes="${this.sample?.phenotypes}"
                                        @changePhenotypes="${e => this.onSyncPhenotypes(e)}">
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
                                render: () => html`
                                    <annotation-set-update
                                        .annotationSets="${this.sample?.annotationSets}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @changeAnnotationSets="${e => this.onSyncAnnotationSets(e)}">
                                    </annotation-set-update>
                                `
                            }
                        }
                    ]
                }
            ]
        };
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

}

customElements.define("sample-create", SampleCreate);
