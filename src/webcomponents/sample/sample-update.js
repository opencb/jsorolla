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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../core/utilsNew.js";
// import "../commons/manager/phenotype-manager.js";
import "../annotations/annotationSet-form.js";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";

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
                    // No need to call to this.sampleObserver()
                    this.sample = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    // TODO move to a generic Utils class
    dispatchSessionUpdateRequest() {
        this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
            detail: {
            },
            bubbles: true,
            composed: true
        }));
    }

    onFieldChange(e) {
        console.log("Test:", e.detail.param, e.detail.value);
        switch (e.detail.param) {
            case "id":
            case "description":
            case "individualId":
            case "somatic":
                if (this._sample[e.detail.param] !== e.detail.value && e.detail.value !== null) {
                    this.sample[e.detail.param] = e.detail.value;
                    this.updateParams[e.detail.param] = e.detail.value;
                } else {
                    // this.sample[e.detail.param] = this._sample[e.detail.param];
                    delete this.updateParams[e.detail.param];
                }
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
                FormUtils.updateObject(
                    this.sample,
                    this._sample,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value);
                break;
        }
    }

    onRemovePhenotype(e) {
        console.log("This is to remove a item ");
        this.sample = {
            ...this.sample,
            phenotypes: this.sample.phenotypes
                .filter(item => item !== e.detail.value)
        };
    }

    onAddPhenotype(e) {
        this.sample.phenotypes.push(e.detail.value);
        this.updateParams.phenotypes = this.sample.phenotypes;

    }

    onClear() {
        console.log("OnClear sample form");
    }

    onSubmit() {
        this.opencgaSession.opencgaClient.samples().update(this.sample.id, this.updateParams, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this._sample = JSON.parse(JSON.stringify(this.sample));
                this.updateParams = {};

                // this.dispatchSessionUpdateRequest();
                FormUtils.showAlert("Edit Sample", "Sample updated correctly", "success");
            })
            .catch(err => {
                console.error(err);
            });
    }

    onSyncPhenotypes(e) {
        e.stopPropagation();
        this.updateParams = {...this.updateParams, phenotypes: e.detail.value};
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
                // width: "8",
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
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: true,
                                help: {
                                    text: "short Sample id"
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
                                    text: "short Sample id for thehis as;lsal"
                                }
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Sample name..."
                                // render: (sample) => html`
                                //     <sample-id-autocomplete
                                //             .value="${sample?.individualId}"
                                //             .opencgaSession="${this.opencgaSession}"
                                //             @filterChange="${e => this.onFieldChange({detail: {param: "individualId", value: e.detail.value}})}">
                                //     </sample-id-autocomplete>`
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
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: creationDate => html`${UtilsNew.dateFormatter(creationDate)}`
                            }
                        },
                        {
                            name: "Modification Date",
                            field: "modificationDate",
                            type: "custom",
                            display: {
                                render: modificationDate => html`${UtilsNew.dateFormatter(modificationDate)}`
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
                            type: "input-text"
                        },
                        {
                            name: "Preparation Method",
                            field: "processing.preparationMethod",
                            type: "input-text"
                        },
                        {
                            name: "Extraction Method",
                            field: "processing.extrationMethod",
                            type: "input-text"
                        },
                        {
                            name: "Lab Sample ID",
                            field: "processing.labSambpleId",
                            type: "input-text"
                        },
                        {
                            name: "Quantity",
                            field: "processing.quantity",
                            type: "input-text"
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
                            type: "input-text"
                        },
                        {
                            name: "Organ",
                            field: "collection.organ",
                            type: "input-text"
                        },
                        {
                            name: "Quantity",
                            field: "collection.quantity",
                            type: "input-text"
                        },
                        {
                            name: "Method",
                            field: "collection.method",
                            type: "input-text"
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
                {
                    elements: [
                        {
                            name: "Phenotypes",
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

    render() {
        return html`
            <data-form
                    .data=${this.sample}
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${this.onClear}"
                    @submit="${this.onSubmit}">
            </data-form>
        `;
    }

}

customElements.define("sample-update", SampleUpdate);
