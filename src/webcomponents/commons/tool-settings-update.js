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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "./utils/notification-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import LitUtils from "./utils/lit-utils.js";
import {guardPage} from "./html-utils.js";
import "./tool-settings-editor.js";

export default class ToolSettingsUpdate extends LitElement {

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
                type: Object,
            },
            study: {
                type: Object,
            },
            toolSettings: {
                type: Object,
            },
            toolName: {
                type: String,
            },
        };
    }

    #init() {
        this.isLoading = false;
        this._study = {};
        this._studyFqnList = [];
        this._activeTab = {
            0: "default",
            1: "backup",
        };
        this._config = {};
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("study")) {
            this.#initOriginalObjects();
        }
        if (changedProperties.has("toolSettings")) {
            this.toolSettingsObserver();
        }
        super.update(changedProperties);
    }

    #initOriginalObjects() {
        this._study = this.study || this.opencgaSession.study;
        this._data = {
            listStudies: [this._study.fqn],
            toolSettings: {},
        };
        this.allowedValues = [];
        // Read Projects and Study to prepare the allowed values in the Study select menu
        if (this.opencgaSession?.projects) {
            // Prepare allowedValues for the select options menu
            this.opencgaSession.projects.forEach(project => {
                const fields = [];
                (project.studies || []).forEach(study => {
                    if (OpencgaCatalogUtils.isAdmin(study, this.opencgaSession.user.id)) {
                        fields.push({
                            id: study.fqn,
                            name: study.fqn,
                            disabled: study.fqn === this.opencgaSession.study.fqn,
                        });
                    }
                });
                if (fields.length > 0) {
                    this.allowedValues.push({
                        name: `Project '${project.name}'`,
                        fields: fields,
                    });
                }
            });
        }
        this._config = this.getDefaultConfig();
    }

    toolSettingsObserver() {
        this._data.toolSettings = UtilsNew.objectClone(this.toolSettings);
    }

    onFieldChange(event) {
        if (event.detail.value?.json) {
            this._data.toolSettings = UtilsNew.objectClone(event.detail.value?.json);
        }
        // Shallow copy just for refreshing the memory direction of this._study
        this._data = {...this._data};
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard changes",
            message: "Are you sure you want to discard the changes made?",
            ok: () => {
                this.#initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        this.#setLoading(true);
        // 1. preare all the update promises
        const toolSettingsUpdatePromises = this._data.listStudies.map(studyFqn => {
            const study = OpencgaCatalogUtils.getStudyInSession(this.opencgaSession, studyFqn);
            const updateParams = OpencgaCatalogUtils.getNewToolIVASettings(this.opencgaSession, study, this.toolName, this._data.toolSettings);
            return this.opencgaSession.opencgaClient.studies()
                .update(studyFqn, updateParams, {
                    includeResult: true,
                })
                .then(() => {
                    // // 1. Dispatch success notification
                    // NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    //     title: `${this.toolName} Settings Update`,
                    //     message: `${this.toolName} settings updated correctly`,
                    // });
                    // // 2. Dispatch study update event
                    // LitUtils.dispatchCustomEvent(this, "studyUpdateRequest",
                    //     UtilsNew.objectClone(response.responses[0].results[0].fqn)
                    // );
                })
                .catch(reason => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                });
        });
        // 2. execute all changes and refresh session
        Promise.all(toolSettingsUpdatePromises)
            .then(() => {
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest", {});
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `${this.toolName} settings updated correctly.`,
                });
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        if (!OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
            return guardPage("No permission to view this page");
        }

        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config || {}}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                width: 12,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                buttonsVisible: true,
                buttonsLayout: "top",
            },
            buttons: {
                clearText: "Discard Changes",
                okText: "Update",
            },
            sections: [
                {
                    title: "Tool Configuration",
                    display: {
                        descriptionClassName: "d-block text-secondary",
                    },
                    elements: [
                        {
                            title: "Study",
                            field: "listStudies",
                            type: "select",
                            multiple: true,
                            all: true,
                            required: true,
                            save: value => value?.split(",") || [],
                            defaultValue: this._study.fqn,
                            allowedValues: this.allowedValues,
                            display: {
                                placeholder: "Select study or studies..."
                            },
                        },
                    ],
                },
                {
                    title: "Settings",
                    type: "tabs",
                    display: {
                        descriptionClassName: "d-block text-secondary",
                    },
                    elements: [
                        {
                            type: "custom",
                            field: "toolSettings",
                            display: {
                                render: toolSettings => html`
                                    <tool-settings-editor
                                        .toolSettings="${toolSettings}"
                                        .toolName="${this.toolName}"
                                        .study="${this._study}"
                                        .opencgaSession="${this.opencgaSession}">
                                    </tool-settings-editor>
                                `,
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("tool-settings-update", ToolSettingsUpdate);

