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
import UtilsNew from "../../core/utilsNew.js";

export default class ProjectCreate extends LitElement {

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
            config: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Create"
        };
        this._config = this.getDefaultConfig();
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
        this.requestUpdate();
    }

    onClear() {
        LitUtils.dispatchCustomEvent(this, "clearProject");
        this.project = {};
        this.requestUpdate();
    }

    onSubmit() {
        this.opencgaSession.opencgaClient.projects().create(this.project)
            .then(res => {
                this.project = {};
                this.requestUpdate();
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest");
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Project Create",
                    message: "New project created correctly"
                });
            })
            .catch(err => {
                console.error(err);
            })
            .finally(()=>{
                this._config = this.getDefaultConfig();
                this.onClear();
            });
    }

    render() {
        return html`
            <data-form
                .data="${this.project}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
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
                    elements: [
                        {
                            name: "Project ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
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
                                // visible: this.mode === "UPDATE",
                                // disabled: this.mode === "UPDATE"
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
        });
    }

}

customElements.define("project-create", ProjectCreate);
