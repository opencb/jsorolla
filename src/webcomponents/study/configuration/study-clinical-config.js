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
import UtilsNew from "../../../core/utilsNew.js";
import FormUtils from "../../commons/forms/form-utils.js";

export default class StudyClinicalConfig extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            study: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    _init() {
        console.log("init study variant config");
        // console.log("study selected ", this.study);
    }

    connectedCallback() {
        super.connectedCallback();
        this.updateParams = {};
        console.log("config study", this.study.internal.configuration.clinical);
    }

    update(changedProperties) {
        // if (changedProperties.has("study")) {
        // }
        super.update(changedProperties);
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
             <div class="guard-page">
                 <i class="fas fa-pencil-ruler fa-5x"></i>
                 <h3>Clinial Config under construction</h3>
                 <h3>(Coming Soon)</h3>
             </div>

             <!-- <data-form
                     .data=\${this.sample}
                     .config="\${this._config}"
                     @fieldChange="\${e => this.onFieldChange(e)}"
                     @clear="\${this.onClear}"
                     @submit="\${this.onSubmit}">
             </data-form> -->
         `;
    }

}

customElements.define("study-clinical-config", StudyClinicalConfig);
