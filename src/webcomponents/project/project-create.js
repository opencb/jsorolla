/*
 * Copyright 2015-2024 OpenCB
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

import {html, LitElement} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import FormUtils from "../commons/forms/form-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";

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
        this.#initOriginalObject();
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Create"
        };
        this._config = this.getDefaultConfig();
    }

    #initOriginalObject() {
        this.project = {
            organism: {
                scientificName: "Homo sapiens",
                assembly: "GRCh38",
            },
            cellbase: {
                url: "https://ws.zettagenomics.com/cellbase",
                version: "v5.1"
            }
        };
        this._project = UtilsNew.objectClone(this.project);
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
            case "cellbase":
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
        const resetForm = () => {
            this.#initOriginalObject();
            this._config = this.getDefaultConfig();
            this.requestUpdate();
        };
        if (!this.displayConfig?.modal) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                title: "Clear project",
                message: "Are you sure to clear?",
                ok: () => {
                    resetForm();
                },
            });
        } else {
            LitUtils.dispatchCustomEvent(this, "clearProject");
            resetForm();
        }
    }

    onSubmit() {
        const params = {
            includeResult: true
        };
        let project, error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.projects()
            .create(this.project, params)
            .then(response => {
                this.#initOriginalObject();
                this._config = this.getDefaultConfig();

                project = response.responses[0].results[0];
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Project Create",
                    message: "New project created correctly"
                });
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest");
            })
            .catch(reason => {
                project = this.project;
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "projectCreate", project, {}, error);
                this.#setLoading(false);
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

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => !UtilsNew.objectCompare(this.project, this._project),
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
                            name: "Species",
                            field: "organism.scientificName",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                            }
                        },
                        {
                            name: "Species Assembly",
                            field: "organism.assembly",
                            type: "input-text",
                            required: true,
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
                                    title: "URL",
                                    field: "cellbase.url",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an URL",
                                    }
                                },
                                {
                                    title: "Version",
                                    field: "cellbase.version",
                                    type: "select",
                                    allowedValues: ["v5.0", "v5.1"],
                                    defaultValue: "v5.1",
                                    display: {
                                        // placeholder: "Add version"
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
