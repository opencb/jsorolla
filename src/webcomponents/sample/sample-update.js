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

import {LitElement, html, nothing} from "lit";
import "../study/phenotype/phenotype-list-update.js";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";

export default class SampleUpdate extends LitElement {

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
        this.updateParams = {};

        this.phenotype = {};
        this.annotationSets = {};
    }

    connectedCallback() {
        super.connectedCallback();
        // it's not working well init or update,
        // it's working well here.. connectedCallback
        this.updateParams = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("sample")) {
            this.sampleObserver();
        }

        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }

        // it's just work on update or connectedCallback
        // It's working here, it is not necessary put this on connectecCallback.
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }

        super.update(changedProperties);
    }

    sampleObserver() {
        // When updating wee need to keep a private copy of the original object
        if (this.sample) {
            this._sample = JSON.parse(JSON.stringify(this.sample));
        }
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId) {
            const query = {
                study: this.opencgaSession.study.fqn,
                includeIndividual: true
            };
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, query)
                .then(response => {
                    this.sample = response.responses[0].results[0];
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    // TODO move to a generic Utils class
    // dispatchSessionUpdateRequest() {
    //     this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
    //         detail: {
    //         },
    //         bubbles: true,
    //         composed: true
    //     }));
    // }

    onFieldChange(e) {
        console.log("Test:", e.detail.param, e.detail.value);
        switch (e.detail.param) {
            case "id":
            case "description":
            case "individualId":
            case "somatic":
                this.updateParams = FormUtils.updateScalar(
                    this._sample,
                    this.sample,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value);
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
                this.updateParams= FormUtils.updateObjectWithProps(
                    this._sample,
                    this.sample,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value);
                console.log("updateParams:", this.updateParams);
                break;
        }
        this.requestUpdate();
    }

    onClear() {
        this._config = this.getDefaultConfig();
        this.sample = JSON.parse(JSON.stringify(this._sample));
        this.updateParams = {};
        this.sampleId = "";
    }

    // DEPRECATED
    // removePhenotype() {
    //     const params = {
    //         study: this.opencgaSession.study.fqn,
    //         phenotypesAction: "REMOVE"
    //     };
    //     console.log("Removed Phenotype: ", this.removedPhenotypes);
    //     this.opencgaSession.opencgaClient.samples().update(this.sample.id, this.removedPhenotypes, params)
    //         .then(res => {
    //             this.removedPhenotypes = [];
    //             // this._sample = JSON.parse(JSON.stringify(this.sample));
    //             // this.updateParams = {};
    //             // FormUtils.showAlert("Update Sample", "Sample updated correctly", "success");
    //         })
    //         .catch(err => {
    //             console.error(err);
    //             FormUtils.showAlert("Update Sample", "Sample not updated correctly", "error");
    //         });
    // }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            phenotypesAction: "SET"
        };

        this.opencgaSession.opencgaClient.samples()
            .update(this.sample.id, this.updateParams, params)
            .then(res => {
                this._sample = JSON.parse(JSON.stringify(this.sample));
                this.updateParams = {};
                FormUtils.showAlert("Update Sample", "Sample updated correctly", "success");
                // sessionUpdateRequest
                // TODO: dispacth to the user the data is saved
            })
            .catch(err => {
                console.error(err);
                FormUtils.showAlert("Update Sample", "Sample not updated correctly", "error");
            });
    }

    onSyncPhenotypes(e) {
        e.stopPropagation();
        this.updateParams = {...this.updateParams, phenotypes: e.detail.value};
    }

    // display a button to back sample browser.
    onShowBtnSampleBrowser() {
        const query = {
            xref: this.sampleId
        };

        const showBrowser = () => {
            console.log("click showBrowser", this);
            LitUtils.dispatchEventCustom(this, "querySearch", null, null, {query: query});
            const hash = window.location.hash.split("/");
            const newHash = "#sample/" + hash[1] + "/" + hash[2];
            window.location.hash = newHash;
        };

        return html `
            <div style="float: right;padding: 10px 5px 10px 5px">
                <button type="button" class="btn btn-primary" @click="${showBrowser}">
                    <i class="fa fa-hand-o-left" aria-hidden="true"></i> Sample Browser
                </button>
            </div>
        `;
    }

    render() {
        return html`
            ${this._config?.display?.showBtnSampleBrowser? this.onShowBtnSampleBrowser(): nothing}
            <data-form
                .data=${this.sample}
                .config="${this._config}"
                .updateParams=${this.updateParams}
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Update"
            },
            display: {
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                help: {
                    mode: "block"
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
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: true,
                                help: {
                                    text: "short sample id"
                                }
                            }
                        },
                        {
                            name: "Individual ID",
                            field: "individualId",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: true,
                                help: {
                                    text: "search individual to select"
                                }
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "write a description..."
                            }
                        },
                        {
                            name: "Somatic",
                            field: "somatic",
                            type: "checkbox"
                        },
                        {
                            name: "Status name",
                            field: "status.name",
                            type: "input-text",
                            display: {
                                placeholder: "write a status name."
                            }
                        },
                        {
                            name: "Status Description",
                            field: "status.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "write a description for the status..."
                            }
                        },
                        // {
                        //     name: "Creation Date",
                        //     field: "creationDate",
                        //     type: "custom",
                        //     display: {
                        //         render: creationDate => html`${UtilsNew.dateFormatter(creationDate)}`
                        //     }
                        // },
                        // {
                        //     name: "Modification Date",
                        //     field: "modificationDate",
                        //     type: "custom",
                        //     display: {
                        //         render: modificationDate => html`${UtilsNew.dateFormatter(modificationDate)}`
                        //     }
                        // }
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
                                placeholder: "add a product"
                            }
                        },
                        {
                            name: "Preparation Method",
                            field: "processing.preparationMethod",
                            type: "input-text",
                            display: {
                                placeholder: "add a preparation method"
                            }
                        },
                        {
                            name: "Extraction Method",
                            field: "processing.extrationMethod",
                            type: "input-text",
                            display: {
                                placeholder: "add a extration method"
                            }
                        },
                        {
                            name: "Lab Sample ID",
                            field: "processing.labSambpleId",
                            type: "input-text",
                            display: {
                                placeholder: "add the lab sample id"
                            }
                        },
                        {
                            name: "Quantity",
                            field: "processing.quantity",
                            type: "input-text",
                            display: {
                                placeholder: "add a quantity"
                            }
                        },
                        {
                            name: "Date",
                            field: "processing.date",
                            type: "input-date",
                            display: {
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
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
                                placeholder: "add a tissue"
                            }
                        },
                        {
                            name: "Organ",
                            field: "collection.organ",
                            type: "input-text",
                            display: {
                                placeholder: "add a organ"
                            }
                        },
                        {
                            name: "Quantity",
                            field: "collection.quantity",
                            type: "input-text",
                            display: {
                                placeholder: "add a quantity"
                            }
                        },
                        {
                            name: "Method",
                            field: "collection.method",
                            type: "input-text",
                            display: {
                                placeholder: "add a method"
                            }
                        },
                        {
                            name: "Date",
                            field: "collection.date",
                            type: "input-date",
                            display: {
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
                            }
                        }
                    ]
                },
                {title: "Phenotypes",
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
                                        .updateManager="${true}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @changePhenotypes="${e => this.onSyncPhenotypes(e)}">
                                    </phenotype-list-update>`
                            }
                        },
                        {
                            field: "annotationSets",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: () => html`
                                    <annotation-form
                                        .sample="${this.sample}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @fieldChange="${e => this.onFieldChange(e)}">
                                    </annotation-form>
                                `
                            }
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("sample-update", SampleUpdate);
