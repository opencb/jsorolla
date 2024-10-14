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

import {html, LitElement} from "lit";
import FormUtils from "../commons/forms/form-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";
import LitUtils from "../commons/utils/lit-utils.js";

export default class ProjectUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            project: {
                type: Object
            },
            projectId: {
                type: String
            },
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
        this.updateParams = {};
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            defaultLayout: "horizontal",
            labelAlign: "right",
            labelWidth: 3,
            buttonOkText: "Update"
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("project")) {
            this.initOriginalObject();
        }
    }

    update(changedProperties) {
        if (changedProperties.has("projectId")) {
            this.projectIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    initOriginalObject() {
        // When updating we need to keep a private copy of the original object
        if (this.project) {
            this._project = UtilsNew.objectClone(this.project);
        }
    }

    projectIdObserver() {
        if (this.projectId && this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.projects()
                .info(this.projectId)
                .then(response => {
                    this.project = response.responses[0].results[0];
                    this.initOriginalObject();
                })
                .catch(reason => {
                    this.project = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    this.#setLoading(false);
                });
        } else {
            this.project = {};
        }
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "name":
            case "description":
            case "organism.scientificName":
            case "organism.assembly":
            // case "cellbase.url":
            // case "cellbase.version":
                this.updateParams = {
                    ...FormUtils.updateObjectParams(
                        this._project,
                        this.project,
                        this.updateParams,
                        param,
                        e.detail.value
                    )
                };
        }
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onClear() {
        const resetForm = () => {
            this.updateParams = {};
            this.project = UtilsNew.objectClone(this._project);
            this._config = this.getDefaultConfig();
            this.requestUpdate();
        };
        if (!this.displayConfig?.modal) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                title: "Clear project",
                message: "Are you sure to clear new change?",
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
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.projects()
            .update(this.project?.fqn, this.updateParams, params)
            .then(res => {
                this._config = this.getDefaultConfig();
                this._project = UtilsNew.objectClone(res.responses[0].results[0]);
                this.updateParams = {};
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Project Update",
                    message: "Project updated correctly"
                });
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest", this._project, {}, error);
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                // LitUtils.dispatchCustomEvent(this, "projectUpdate", project, {}, error);
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
                .updateParams="${this.updateParams}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
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
                                visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
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
                                disabled: true,
                                helpMessage: this.project?.creationDate? "Created on " + UtilsNew.dateFormatter(this.project?.creationDate):"No creation date",
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
                            display: {
                                disabled: true,
                            },
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
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add version",
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
                    ],
                },
            ],
        });
    }

}

customElements.define("project-update", ProjectUpdate);
