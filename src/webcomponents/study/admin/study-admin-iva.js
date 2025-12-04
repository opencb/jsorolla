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
import WebUtils from "../../commons/utils/web-utils.js";
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
            opencgaSession: {
                type: Object,
            },
            tool: {
                type: String,
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
        if (changedProperties.has("opencgaSession") || changedProperties.has("settings")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    formatToolTitle(str) {
        if (typeof str !== "string") {
            return "";
        }

        let title = str
            .trim()
            .toLowerCase()
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        // CAUTION 20250228 Vero: The code was designed for formatting the tool names
        //  from the tool keys in browser.settings.js for consistency. We have planned a discussion for unifying tool names.
        //  I am pretty sure that a change on the name in settings, won't affect the application,
        //  but since it is a delicate tool, I prefer to go for this awful workaround and do it properly in 3.1
        return (title === "Clinical Analysis Browser") ? "Clinical Analysis Portal" : title;
    }

    onChangeActiveItem(event) {
        const [app, tool] = WebUtils.getApplicationAndToolFromHash();
        WebUtils.redirectTo(this.opencgaSession, app, tool, {
            tool: event.detail.value,
        });
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
                .activeItem="${this.tool}"
                .config="${this._config || {}}"
                @changeActiveItem="${event => this.onChangeActiveItem(event)}">
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
            display: {
                menuStyle: "width:240px;",
            },
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
                            name: this.formatToolTitle(toolName),
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
