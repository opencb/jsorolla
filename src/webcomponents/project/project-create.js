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
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.project = {};
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
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig,
            };
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
        // NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
        //     title: "Clear project",
        //     message: "Are you sure to clear?",
        //     ok: () => {
        //         this.project = {};
        //         this._config = this.getDefaultConfig();
        //         this.requestUpdate();
        //     },
        // });
        LitUtils.dispatchCustomEvent(this, "clearProject");
        this.project = {};
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.projects()
            .create(this.project)
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Project Create",
                    message: "New project created correctly"
                });
                this.requestUpdate();
            })
            .catch(reason => {
                error = reason;
                console.error(error);
            })
            .finally(() => {
                this.project = {};
                this._config = this.getDefaultConfig();
                // CAUTION: onSessionUpdateRequest is not managing errors.
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest");
                this.#setLoading(false);
                // this.onClear();
            });
    }


    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                    .data="${this.project}"
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${e => this.onClear(e)}"
                    @submit="${e => this.onSubmit(e)}">
            </data-form>`;
    }

    // QUESTION: can cellbase be an autocomplete to avoid errors
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
                                visible: () => Object.keys(this.project).length > 0,
                                notificationType: "warning",
                            },
                        },
                        {
                            name: "Project ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                helpMessage: "Short project id...",
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
