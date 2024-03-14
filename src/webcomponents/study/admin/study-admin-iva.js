/**
 * Copyright 2015-2023 OpenCB *
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
import "../../commons/layouts/custom-vertical-navbar.js";
import "../../commons/tool-settings-restore";
import "../../commons/tool-settings-update.js";
import LitUtils from "../../commons/utils/lit-utils";
import NotificationUtils from "../../commons/utils/notification-utils";
import UtilsNew from "../../../core/utils-new";

export default class StudyAdminIva extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            studyId: {
                type: String,
            },
            study: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            settings: {
                type: Object,
            },
        };
    }

    #init() {
        this.menuStructure = {
            catalog: ["Catalog Tools", Object.keys(CATALOG_SETTINGS)],
            // variant: ["Variant", Object.keys(VARIANT_SETTINGS)],
            clinical: ["Clinical Tools", Object.keys(INTERPRETER_SETTINGS)],
            user: ["User", Object.keys(USER_SETTINGS)],
        };
    }

    update(changedProperties) {
        if (changedProperties.has("studyId")) {
            this.studyIdObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    /* -- OBSERVER METHODS -- */
    opencgaSessionObserver() {
        this.study = this.opencgaSession.study;
        this._config = this.getDefaultConfig();
    }

    studyIdObserver() {
        if (this.studyId && this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.studies()
                .info(this.studyId)
                .then(response => {
                    this.study = response.responses[0].results[0];
                })
                .catch(reason => {
                    error = reason;
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "studySearch", this.study, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    // --- RENDER METHOD  ---
    render() {
        return html`
            <tool-header class="page-title-no-margin" title="${this._config.name}" icon="${this._config.icon}"></tool-header>
            <custom-vertical-navbar
                .study="${this.study}"
                .opencgaSession="${this.opencgaSession}"
                .activeMenuItem="${"tool_settings"}"
                .config="${this._config}">
            </custom-vertical-navbar>
        `;
    }

    getDefaultConfig() {
        const menu = [
            {
                id: "general",
                name: "General",
                visibility: "private",
                submenu: [
                    {
                        id: "tool_settings",
                        name: "Tool Settings",
                        visibility: "private",
                        render: (opencgaSession, study) => {
                            return html `
                                <div class="py-3">Reset all settings to their original defaults and restore the backup version</div>
                                <tool-settings-restore
                                    .study="${study}"
                                    .opencgaSession="${opencgaSession}"
                                    @studyToolSettingsUpdate="${e => this.onStudyToolSettingsUpdate(e)}">
                                </tool-settings-restore>
                            `;
                        },
                    },
                    // {
                    //     id: "constants",
                    //     name: "Constants",
                    //     // icon: "fa-solid fa-square",
                    //     visibility: "private",
                    //     render: (opencgaSession, study) => this.renderToolSettings(),
                    // },
                ],
            },
            ...Object.entries(this.menuStructure)
                .map(([menuKey, [header, submenuKeys]]) => ({
                    id: menuKey,
                    name: header,
                    category: true,
                    visibility: "private",
                    submenu: submenuKeys.map(toolName => {
                        const toolSettings = this.settings[toolName];
                        return {
                            id: toolName.toLowerCase(),
                            name: UtilsNew.capitalize(toolName.toLowerCase().replace(/_/g, " ")),
                            // icon: "fa-solid fa-square",
                            visibility: "private",
                            render: (opencgaSession, study) => {
                                return html `
                                    <tool-settings-update
                                        .opencgaSession="${opencgaSession}"
                                        .study="${study}"
                                        .toolSettings="${toolSettings}"
                                        .toolName="${toolName}">
                                    </tool-settings-update>
                                `;
                            },
                        };
                    })
                }))
        ];
        return {
            name: "IVA Configuration",
            logo: "",
            icon: "fas fa-sliders-h",
            visibility: "private", // public | private | none
            menu: menu
        };
    }

}

customElements.define("study-admin-iva", StudyAdminIva);
