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

export default class ProjectEditor extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            project: {
                type: Object
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

        this.project = {};
    }

    connectedCallback() {
        super.connectedCallback();

        // this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    // update(changedProperties) {
    //     if (changedProperties.has("opencgaSession")) {
    //         this.usersAndProjects = this.getProjetcsPerUser();
    //     }
    //     super.update(changedProperties);
    // }

    // getDefaultConfig() {
    //     return {
    //         title: "Study Dashboard",
    //         icon: "variant_browser.svg",
    //         active: false
    //     };
    // }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "id":
            case "name":
            case "description":
                this.project[e.detail.param] = e.detail.value;
                break;
            case "organism.scientificName":
            case "organism.assembly":
                const param = e.detail.param.split(".")[1];
                if (!this.project.organism) {
                    this.project.organism = {};
                }
                this.project.organism[param] = e.detail.value;
                break;
        }
    }

    getSaveForm(e) {
        console.log(e.detail.param)
    }

    getStudyFormConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save"
            },
            display: {
                style: "margin: 25px 50px 0px 0px",
                labelWidth: 4,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
            },
            sections: [
                {
                    elements: [
                        {
                            name: "id",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Project name...",
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
                                placeholder: "Project description...",
                            }
                        },
                    ]
                }
            ]
        }
    }


    onHide() {
        this.dispatchEvent(new CustomEvent("hide", {
            detail: {},
            bubbles: true,
            composed: true
        }));
    }

    onSave(e) {
        this.opencgaSession.opencgaClient.projects().create(this.project)
            .then(res => {
                this.project = {};
                this.requestUpdate();

                this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
                    detail: {
                    },
                    bubbles: true,
                    composed: true
                }));

                Swal.fire(
                    "New Project",
                    "New project created correctly.",
                    "success"
                );
            })
            .catch(e => {
                console.error(e);
                params.error(e);
            });
    }

    render() {
        return html`
            <data-form  .data=${this.project}
                        .config="${this.getStudyFormConfig()}"
                        @fieldChange="${e => this.onFieldChange(e)}"
                        @clear="${this.onHide}"
                        @submit="${this.onSave}">
            </data-form>
        `;
    }

}

customElements.define("project-editor", ProjectEditor);
