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
import UtilsNew from "../../core/utils-new";
import NotificationUtils from "./utils/notification-utils";
import LitUtils from "./utils/lit-utils";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils";
import {guardPage} from "./html-utils";

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
        // The original settings and study are maintained. A copy is used for previewing the ongoing changes in json
        this._study = UtilsNew.objectClone(this.study);
        this._studyFqnList = this.opencgaSession?.study?.fqn ? [this.opencgaSession.study.fqn] : [];
        this._config = {
            ...this.getDefaultConfig(),
            // ...this.config,
        };
    }

    // --- UPDATE ---
    update(changedProperties) {
        if (changedProperties.has("study")) {
            this.studyObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    // --- OBSERVERS ---
    studyObserver() {
        if (this.study && this.opencgaSession) {
            this.#initOriginalObjects();
        }
    }

    opencgaSessionObserver() {
        // Read Projects and Study to prepare the Study select dropdown
        this.allowedValues = [];
        if (this.opencgaSession?.projects) {
            // Prepare allowedValues for the select options menu
            for (const project of this.opencgaSession.projects) {
                const fields = [];
                if (project.studies?.length > 0) {
                    for (const study of project.studies) {
                        if (OpencgaCatalogUtils.isAdmin(study, this.opencgaSession.user.id)) {
                            fields.push({id: study.fqn, name: study.fqn, disabled: study.fqn === this.opencgaSession.study.fqn});
                        }
                    }
                    if (fields.length > 0) {
                        this.allowedValues.push({name: `Project '${project.name}'`, fields: fields});
                    }
                }
            }
        }

        // Refresh configuration object to read new this.allowedValues array.
        this._config = {
            ...this.getDefaultConfig(),
            // ...this.config,
        };
    }

    // --- EVENTS ---
    onFieldChange(e, field) {
        const param = field || e.detail.param;
        // 1. Update the list of studies
        // NOTE Vero: In restoring settings, only changes in the study need to be listened.
        // Changes in the json editor are for read-only purposes (preview default/backup settings per tool)
        if (param === "fqn") {
            this._study.fqn = "";
            this._studyFqnList = e.detail.value?.length > 0 ? e.detail.value?.split(",") : [];
            // Shallow copy just for refreshing the memory direction of this._study
            this._study = {...this._study};
            this.requestUpdate();
        }
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
        this._studyFqnList.forEach(studyFqn => {
            // 2.1. Get new study tool settings
            const study = OpencgaCatalogUtils.getStudyInSession(this.opencgaSession, studyFqn);
            const allToolSettings = OpencgaCatalogUtils.getRestoreIVASettings(this.opencgaSession, study, activeTab);
            // 2.2 Query
            this.opencgaSession.opencgaClient.studies()
                .update(studyFqn, allToolSettings, params)
                .then(response => {
                    // 1. Dispatch success notification
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                        title: `${UtilsNew.capitalize(activeTab)} Settings Update`,
                        message: `${UtilsNew.capitalize(activeTab)} settings updated correctly`,
                    });
                    // 2. Dispatch study update event
                    LitUtils.dispatchCustomEvent(this, "studyUpdateRequest",
                        UtilsNew.objectClone(response.responses[0].results[0].fqn)
                    );
                })
                .catch(reason => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                })
                .finally(() => {
                    this.#setLoading(false);
                });
        });
    }

    // --- RENDER ---
    render() {
        if (!OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
            return guardPage("No permission to view this page");
        }

        return html `
            <data-form
                .data="${this._study}"
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
                // buttonOkDisabled: () => this._studyFqnList?.length === 0
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
                            field: "fqn",
                            type: "select",
                            multiple: true,
                            all: true,
                            required: true,
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
                                render: study => {
                                    return html `
                                        <div class="pt-3 pe-3">
                                            <tool-settings-editor
                                                .toolSettings="${UtilsNew.objectClone(this.opencgaSession.ivaDefaultSettings.settings)}"
                                                .selectSettings="${true}"
                                                .readOnly="${true}"
                                                .study="${study}"
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
                                visible: study => !study?.attributes[SETTINGS_NAME + "_BACKUP"]?.settings,
                                notificationType: "warning",
                            },
                        },
                        {
                            title: "Study",
                            field: "fqn",
                            type: "select",
                            multiple: true,
                            all: true,
                            required: true,
                            defaultValue: `${this._study.fqn}`,
                            allowedValues: this.allowedValues,
                            display: {
                                visible: study => !!study?.attributes[SETTINGS_NAME + "_BACKUP"]?.settings,
                                placeholder: "Select study or studies..."
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                visible: study => !!study?.attributes[SETTINGS_NAME + "_BACKUP"]?.settings,
                                render: study => {
                                    return html `
                                        <tool-settings-editor
                                            .toolSettings="${UtilsNew.objectClone(study.attributes[SETTINGS_NAME + "_BACKUP"].settings)}"
                                            .readOnly="${true}"
                                            .study="${study}"
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
