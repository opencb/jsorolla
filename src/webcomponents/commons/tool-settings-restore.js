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

export default class ToolSettingsRestore extends LitElement {

    // --- CONSTRUCTOR ---
    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    // --- PROPERTIES ---
    static get properties() {
        return {
            study: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    // --- PRIVATE METHODS ---
    #init() {
        this._study = {};
        this.isLoading = false;
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
            listStudies: [UtilsNew.objectClone(this._study.fqn)],
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

    // --- UPDATE ---
    update(changedProperties) {
        if (changedProperties.has("study") || changedProperties.has("opencgaSession")) {
            this.#initOriginalObjects();
        }
        super.update(changedProperties);
    }

    // --- EVENTS ---
    onFieldChange() {
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

    onSubmit(e) {
        // 1. Prepare query params
        const activeTab = this._activeTab[e.detail.value];
        const params = {
            includeResult: true,
        };
        // 2. Query
        this.#setLoading(true);
        const _toolSettingsRestorePromises = this._data.listStudies.map(studyFqn => {
            // 2.1. Retrieve the backup or default tool settings of each study
            const study = OpencgaCatalogUtils.getStudyInSession(this.opencgaSession, studyFqn);
            const allToolSettings = OpencgaCatalogUtils.getRestoreIVASettings(this.opencgaSession, study, activeTab);
            // 2.2 Return the query
            return this.opencgaSession.opencgaClient.studies()
                .update(studyFqn, allToolSettings, params)
                .then(() => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                        title: `${UtilsNew.capitalize(activeTab)} Settings Restore in study ${studyFqn}`,
                        message: `${UtilsNew.capitalize(activeTab)} settings restored correctly`,
                    });
                })
                .catch(reason => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                });
        });
        // 2. Execute all changes and refresh session
        Promise.all(_toolSettingsRestorePromises)
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

        return html `
            <data-form
                .data="${this._data}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    // --- DEFAULT CONFIG ---
    getDefaultConfig() {
        return {
            id: "",
            title: "",
            icon: "",
            type: "tabs",
            display: {
                width: 12,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                buttonsVisible: true,
                buttonsLayout: "top",
                buttonsClassName: "mt-2",
            },
            buttons: {
                clearText: "Discard Changes",
                okText: "Update",
            },
            sections: [
                {
                    title: "Reset default settings",
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
                        {
                            title: "Preview changes",
                            type: "custom",
                            display: {
                                defaultLayout: "vertical",
                                render: () => {
                                    return html `
                                        <div class="pt-3 pe-3">
                                            <tool-settings-editor
                                                .toolSettings="${UtilsNew.objectClone(this.opencgaSession.ivaDefaultSettings.settings)}"
                                                .selectSettings="${true}"
                                                .readOnly="${true}"
                                                .study="${this._study}"
                                                .opencgaSession="${this.opencgaSession}">
                                            </tool-settings-editor>
                                        </div>

                                    `;
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Restore backup settings",
                    display: {
                        // titleHeader: "",
                        // titleStyle: "",
                        // visible: study => !!study?.attributes[SETTINGS_NAME + "_BACKUP"]?.settings,
                        descriptionClassName: "form-text",
                        // descriptionStyle: "",
                        // visible: () =>
                    },
                    elements: [
                        {
                            type: "notification",
                            text: "No backup avaliable",
                            display: {
                                visible: !this._study?.attributes[SETTINGS_NAME + "_BACKUP"]?.settings,
                                notificationType: "warning",
                            },
                        },
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
                                visible: !!this._study?.attributes[SETTINGS_NAME + "_BACKUP"]?.settings,
                                placeholder: "Select study or studies..."
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                visible: !!this._study?.attributes[SETTINGS_NAME + "_BACKUP"]?.settings,
                                render: () => {
                                    return html `
                                        <tool-settings-editor
                                            .toolSettings="${UtilsNew.objectClone(this._study.attributes[SETTINGS_NAME + "_BACKUP"].settings)}"
                                            .readOnly="${true}"
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

customElements.define("tool-settings-restore", ToolSettingsRestore);
