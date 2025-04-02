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
import {guardPage} from "./html-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "./utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "./utils/lit-utils.js";
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
        this._study = {};
        this.isLoading = false;
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

    #initOriginalObjects() {
        this._study = this.study || this.opencgaSession.study;
        this._data = {
            listStudies: [this._study.fqn],
            toolSettings: {},
        };

        this.allowedValues = [];
        if (this.opencgaSession?.projects) {
            // Prepare allowedValues for the select options menu
            for (const project of this.opencgaSession.projects) {
                const fields = [];
                for (const study of project.studies) {
                    if (OpencgaCatalogUtils.isAdmin(study, this.opencgaSession.user.id)) {
                        fields.push({
                            id: study.fqn,
                            name: study.fqn,
                            disabled: study.fqn === this.opencgaSession.study.fqn
                        });
                    }
                }
                if (fields.length > 0) {
                    this.allowedValues.push({name: `Project '${project.name}'`, fields: fields});
                }
            }
        }
        this._config = this.getDefaultConfig();
    }

    // --- LIT LIFE CYCLE
    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("study")) {
            this.#initOriginalObjects();
        }
        if (changedProperties.has("toolSettings")) {
            this.toolSettingsObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        super.update(changedProperties);
    }

    // --- OBSERVERS ---
    toolSettingsObserver() {
        this._data.toolSettings = UtilsNew.objectClone(this.toolSettings);
    }

    // --- EVENTS ---
    onFieldChange(e) {
        if (e.detail.value?.json) {
            this._data.toolSettings = UtilsNew.objectClone(e.detail.value?.json);
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
        // 1. Prepare query params
        const params = {
            includeResult: true,
        };
        // 2. Query
        this.#setLoading(true);
        const _toolSettingsUpdatePromises = this._data.listStudies.map(studyFqn => {
            // Get new study tool settings
            const study = OpencgaCatalogUtils.getStudyInSession(this.opencgaSession, studyFqn);
            const updateParams = OpencgaCatalogUtils.getNewToolIVASettings(this.opencgaSession, study, this.toolName, this._data.toolSettings);

            return this.opencgaSession.opencgaClient.studies()
                .update(studyFqn, updateParams, params)
                .then(() => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                        title: `${this.toolName} Settings Update in study ${studyFqn}`,
                        message: `${this.toolName} settings updated correctly`,
                    });
                })
                .catch(error => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                });
        });
        // 2. Execute all changes and refresh session
        Promise.all(_toolSettingsUpdatePromises)
            .finally(() => {
                this.#setLoading(false);
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest", {});
            });
    }

    // --- RENDER ---
    render() {
        if (!OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
            return guardPage("No permission to view this page");
        }

        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "",
            display: {
                width: 12,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                buttonsVisible: true,
                buttonsLayout: "top",
                // buttonOkDisabled: () => this._listStudies?.length === 0
            },
            buttons: {
                clearText: "Discard Changes",
                okText: "Update",
            },
            sections: [
                {
                    title: "Tool Configuration",
                    display: {
                        // titleHeader: "",
                        // titleStyle: "",
                        descriptionClassName: "d-block text-secondary",
                        // descriptionStyle: "",
                        // visible: () =>
                    },
                    elements: [
                        {
                            title: "Study",
                            field: "listStudies",
                            type: "select",
                            multiple: true,
                            all: true,
                            required: true,
                            save: value => value?.split(",") || [], // Array when select and multiple
                            defaultValue: `${this._study.fqn}`,
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
                        // titleHeader: "",
                        // titleStyle: "",
                        descriptionClassName: "d-block text-secondary",
                        // descriptionStyle: "",
                        // visible: () =>
                    },
                    elements: [
                        {
                            type: "custom",
                            field: "toolSettings",
                            display: {
                                render: toolSettings => {
                                    return html `
                                        <tool-settings-editor
                                            .toolSettings="${toolSettings}"
                                            .toolName="${this.toolName}"
                                            .study="${this._study}"
                                            .opencgaSession="${this.opencgaSession}">
                                        </tool-settings-editor>
                                    `;
                                },
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("tool-settings-update", ToolSettingsUpdate);

