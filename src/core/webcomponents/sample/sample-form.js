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

import { LitElement, html } from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import "../commons/tool-header.js";

export default class SampleForm extends LitElement {

    static CREATE_MODE = "create";
    static UPDATE_MODE = "update";
    
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
            study: {
                type: Object
            },
            mode: {
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
        this._prefix = UtilsNew.randomString(8);

        // We initialise the sample in for CREATE
        this.sample = {}
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "id":
            case "name":
            case "description":
                this.sample[e.detail.param] = e.detail.value;
                break;
        }
    }

    dispatchSessionUpdateRequest() {
        this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
            detail: {
            },
            bubbles: true,
            composed: true
        }));
    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: this.mode === SampleForm.CREATE_MODE ? "Save" : "Update"
            },
            display: {
                // width: "8",
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                help: {
                    mode: "block", // icon
                }
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Sample ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: this.mode === SampleForm.UPDATE_MODE,
                                help: {
                                    text: "short Sample id for thehis as;lsal"
                                },
                                validation: {

                                }
                            },
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Sample name...",
                            }
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "input-text",
                            display: {
                                placeholder: "Sample name...",
                                visible: this.mode === SampleForm.UPDATE_MODE,
                                disabled: this.mode === SampleForm.UPDATE_MODE
                            }
                        },
                        {
                            name: "Species",
                            field: "organism.scientificName",
                            type: "input-text",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                            }
                        },
                        {
                            name: "Species Assembly",
                            field: "organism.assembly",
                            type: "input-text",
                            display: {
                                placeholder: "e.g. GRCh38",
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Sample description...",
                            }
                        },
                    ]
                }
            ]
        }
    }


    saveSample() {
        // this.opencgaSession.opencgaClient.projects().create(this.project)
        //     .then(res => {
        //         this.sample = {};
        //         this.requestUpdate();

        //         this.dispatchSessionUpdateRequest();

        //         Swal.fire(
        //             "New Sample",
        //             "New Sample created correctly.",
        //             "success"
        //         );
        //     })
        //     .catch(err => {
        //         console.error(err);
        //         params.error(err);
        //     });
    }

    updateSample() {
        // this.opencgaSession.opencgaClient.projects().update(this.Sample?.fqn,this.Sample)
        //     .then(res => {
        //         this.Sample = {};
        //         this.requestUpdate();

        //         this.dispatchSessionUpdateRequest();

        //         Swal.fire(
        //             "Edit Sample",
        //             "Sample updated correctly.",
        //             "success"
        //         );
        //     })
        //     .catch(err => {
        //         console.error(err);
        //         params.error(err);
        //     });
    }
    
    onSubmit(e) {
        if (mode === SampleForm.CREATE_MODE) {
            this.saveSample()
        } else {
            this.updateSample()
        }
    }

    onClear() {

    }

    render() {
        return html`
            <data-form  .data=${this.sample}
                        .config="${this._config}"
                        @fieldChange="${e => this.onFieldChange(e)}"
                        @clear="${this.onClear}"
                        @submit="${this.onSubmit}">
            </data-form>
        `;
    }

}

customElements.define("sample-form", SampleForm);
