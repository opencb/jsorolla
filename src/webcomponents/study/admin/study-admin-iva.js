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
import LitUtils from "../../commons/utils/lit-utils";
import NotificationUtils from "../../commons/utils/notification-utils";
import UtilsNew from "../../../core/utils-new";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils";
import "../../commons/view/vertical-menu.js";
import "../../commons/pages/restricted-access-page.js";
import "../../commons/tool-settings-restore";
import "../../commons/tool-settings-update.js";

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
        this._config = {};
    }

    update(changedProperties) {
        if (changedProperties.has("studyId")) {
            this.studyIdObserver();
        }

        if (changedProperties.has("opencgaSession") || changedProperties.has("settings")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    organizationIdObserver() {
        // FIXME Vero: on creating a new group, for instance,
        //  the session is updated but the org id does not change.
        //  I need to get the organization info again to refresh the grid.
        //  For now, I will query org info only with property opencgaSession change.
        //  TO think about it.
        // if (this.organizationId && this.opencgaSession) {
        if (this.organizationId || this.opencgaSession) {
            let error;
            this.opencgaSession.opencgaClient.organization()
                .info(this.opencgaSession.organization.id)
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
                    this.requestUpdate();
                });
        }
    }

    studyIdObserver() {
        if (this.studyId && this.opencgaSession) {
            let error;
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
                    LitUtils.dispatchCustomEvent(this, "studySearch", this.study, {}, error);
                    this.requestUpdate();
                });
        }
    }

    render() {
        const isOrganizationAdmin = OpencgaCatalogUtils.isOrganizationAdmin(this.opencgaSession?.organization, this.opencgaSession?.user?.id);
        const isAdmin = OpencgaCatalogUtils.isAdmin(this.opencgaSession?.study, this.opencgaSession?.user?.id);

        if (!this.opencgaSession || (!isOrganizationAdmin && !isAdmin)) {
            return html`
                <restricted-access-page
                    message="The page you are trying to access has restricted access. Please refer to your system administrator.">
                </restricted-access-page>
            `;
        }

        return html`
            <tool-header title="${this._config.name}"></tool-header>
            <vertical-menu
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config || {}}">
            </vertical-menu>
        `;
    }

    getDefaultConfig() {
        const toolGroups = [
            {
                id: "catalog",
                name: "Catalog Tools",
                tools: Object.keys(CATALOG_SETTINGS),
            },
            {
                id: "clinical",
                name: "Clinical Tools",
                tools: Object.keys(INTERPRETER_SETTINGS),
            },
            {
                id: "user",
                name: "User",
                tools: Object.keys(USER_SETTINGS),
            },
        ];

        return {
            name: "IVA Configuration",
            menu: [
                {
                    id: "general",
                    name: "General",
                    submenu: [
                        {
                            id: "tool_settings",
                            name: "Tool Settings",
                            render: opencgaSession => html`
                                <div class="py-3">Reset all settings to their original defaults and restore the backup version</div>
                                <tool-settings-restore
                                    .opencgaSession="${opencgaSession}"
                                    .study="${opencgaSession.study}"
                                    @studyToolSettingsUpdate="${e => this.onStudyToolSettingsUpdate(e)}">
                                </tool-settings-restore>
                            `,
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
                ...toolGroups.map(toolGroup => ({
                    id: toolGroup.id,
                    name: toolGroup.name,
                    submenu: toolGroup.tools.map(toolName => {
                        const toolSettings = this.settings[toolName];
                        return {
                            id: toolGroup.id + "-" + toolName.toLowerCase(),
                            name: UtilsNew.capitalize(toolName.toLowerCase().replace(/_/g, " ")),
                            render: opencgaSession => html`
                                <tool-settings-update
                                    .opencgaSession="${opencgaSession}"
                                    .study="${{...opencgaSession.study}}"
                                    .toolSettings="${toolSettings}"
                                    .toolName="${toolName}">
                                </tool-settings-update>
                            `,
                        };
                    }),
                })),
            ],
        };
    }

}

customElements.define("study-admin-iva", StudyAdminIva);
