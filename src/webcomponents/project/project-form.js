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
import UtilsNew from "./../../core/utilsNew.js";
import FormUtils from "../commons/forms/form-utils";
import "../commons/tool-header.js";


//  Rodiel 2022-09-30 DEPRECATED use project-create & project-update
export default class ProjectForm extends LitElement {

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


    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "id":
            case "name":
            case "description":
            case "organism.scientificName":
            case "organism.assembly":
            case "cellbase.url":
            case "cellbase.version":
                this.project = {
                    ...FormUtils.createObject(
                        this.project,
                        param,
                        e.detail.value
                    )
                };
        }
        console.log("New Project: ", this.project);
    }

    saveProject() {
        this.opencgaSession.opencgaClient.projects().create(this.project)
            .then(res => {
                this.project = {};
                this.requestUpdate();

                this.dispatchSessionUpdateRequest();

                Swal.fire(
                    "New Project",
                    "New project created correctly.",
                    "success"
                );
            })
            .catch(err => {
                console.error(err);
                params.error(err);
            });
    }

    updateProject() {
        this.opencgaSession.opencgaClient.projects().update(this.project?.fqn, this.project)
            .then(res => {
                this.project = {};
                this.requestUpdate();

                this.dispatchSessionUpdateRequest();

                Swal.fire(
                    "Edit Project",
                    "project updated correctly.",
                    "success"
                );
            })
            .catch(err => {
                console.error(err);
                params.error(err);
            });
    }

    dispatchSessionUpdateRequest() {
        this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
            detail: {
            },
            bubbles: true,
            composed: true
        }));
    }

    getStudyFormConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: this.mode === "CREATE" ? "Save" : "Update"
            },
            display: {
                style: "margin: 25px 50px 0px 0px",
                labelWidth: 4,
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
                            name: "Project ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                disabled: this.mode === "UPDATE",
                                help: {
                                    text: "short project id for thehis as;lsal"
                                },
                            },
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
                            name: "Creation Date",
                            field: "creationDate",
                            type: "input-text",
                            display: {
                                placeholder: "Project name...",
                                visible: this.mode === "UPDATE",
                                disabled: this.mode === "UPDATE"
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
                            title: "Cellbase",
                            field: "cellbase",
                            type: "object",
                            elements: [
                                {
                                    title: "Url",
                                    field: "cellbase.url",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an URL",
                                    }
                                },
                                {
                                    title: "Version",
                                    field: "cellbase.version",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add version"
                                    }
                                },
                            ]
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
        };
    }


    onHide() {
        this.dispatchEvent(new CustomEvent("hide", {
            detail: {},
            bubbles: true,
            composed: true
        }));
    }

    onSave(e) {
        // TODO: Check it's ok ?
        if (mode == "CREATE") {
            this.saveProject();
        } else {
            this.updateProject();
        }
    }


    render() {
        return html`
            <data-form
                .data=${this.project}
                .config="${this.getStudyFormConfig()}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onHide}"
                @submit="${this.onSave}">
            </data-form>
        `;
    }

}

customElements.define("project-form", ProjectForm);
