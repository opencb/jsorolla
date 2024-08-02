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
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils";

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
            organizationId: {
                type: String,
            },
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
        if (changedProperties.has("organizationId")) {
            this.organizationIdObserver();
        }
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
    organizationIdObserver() {
        // FIXME Vero: on creating a new group, for instance,
        //  the session is updated but the org id does not change.
        //  I need to get the organization info again to refresh the grid.
        //  For now, I will query org info only with property opencgaSession change.
        //  TO think about it.
        // if (this.organizationId && this.opencgaSession) {
        if (this.organizationId || this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.organization()
                // FIXME Vero: To remove hardcoded organization when the following bug is fixed:
                //  https://app.clickup.com/t/36631768/TASK-5980
                // .info(this.organizationId)
                .info("test")
                .then(response => {
                    this.organization = UtilsNew.objectClone(response.responses[0].results[0]);
                })
                .catch(reason => {
                    // this.organization = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    LitUtils.dispatchCustomEvent(this, "organizationInfo", this.organization, {}, error);
                    this.#setLoading(false);
                });
        }
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

    opencgaSessionObserver() {
        this.study = this.opencgaSession.study;
        this._config = this.getDefaultConfig();
    }

    // --- RENDER METHOD  ---
    render() {
        if (this.opencgaSession.study && this.organization) {
            if (!OpencgaCatalogUtils.isOrganizationAdmin(this.organization, this.opencgaSession.user.id) &&
                !OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
                return html`
                    <tool-header class="page-title-no-margin"  title="${this._config.name}" icon="${this._config.icon}"></tool-header>
                    <div class="d-flex flex-column align-items-center justify-content-center">
                        <h1 class="display-1"><i class="fa-solid fa-user-shield me-4"></i></i>Restricted access</h1>
                        <h3>The page you are trying to access has restricted access.</h3>
                        <h3>Please refer to your system administrator.</h3>
                    </div>
                `;
            }

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
