/**
 * Copyright 2015-2023 OpenCB
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
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";

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
    }

    #initOriginalObject() {
        this.project = {
            organism: {
                scientificName: "Homo sapiens",
                assembly: "GRCh38",
            },
            cellbase: {
                url: "https://ws.zettagenomics.com/cellbase",
                version: "v5.8"
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

    onFieldChange(e) {
        this._project = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear project",
            message: "Are you sure to clear?",
            ok: () => {
                this.#initOriginalObject();
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const params = {
            includeResult: true,
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.projects()
            .create(this._project, params)
            .then(() => {
                this.#initOriginalObject();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Project Create",
                    message: "New project created correctly"
                });
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest", {}, {}, error);
                // LitUtils.dispatchCustomEvent(this, "projectCreate", project, {}, error);
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this._project}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>`;
    }

    getDefaultConfig() {
        return {
            display: this.displayConfig,
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
                                    // FIXME Vero 20240712: Waiting for Nacho's advise
                                    //  Can they be queried? In cellbase more versions are responding:
                                    //  5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.8
                                    //  https://ws.zettagenomics.com/cellbase/webservices/#!/Gene/getInfo_1
                                    allowedValues: ["v5.0", "v5.1", "v5.2", "v5.8"],
                                    defaultValue: "v5.8",
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
        };
    }

}

customElements.define("project-create", ProjectCreate);
