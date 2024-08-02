/**
 * Copyright 2015-2024 OpenCB *
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
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import "./group-admin-browser.js";
import "./user-admin-browser.js";
import "../../project/projects-admin.js";
import "./project-admin-browser.js";
import "./organization-admin-detail.js";

export default class OrganizationAdmin extends LitElement {

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
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
        this._activeMenuItem = "";
    }

    // --- RENDER METHOD  ---
    render() {
        if (this.opencgaSession?.organization) {
            if (!OpencgaCatalogUtils.isOrganizationAdmin(this.opencgaSession.organization, this.opencgaSession.user.id)) {
                return html `
                    <div class="d-flex flex-column align-items-center justify-content-center">
                        <h1 class="display-1"><i class="fas fa-user-shield me-4"></i>Restricted access</h1>
                        <h3>The page you are trying to access has restricted access.</h3>
                        <h3>Please refer to your system administrator.</h3>
                    </div>
                `;
            }
            return html `
                <!-- <tool-header class="page-title-no-margin" title="$this._config.name}" icon="$this._config.icon}"></tool-header>-->
                <custom-vertical-navbar
                    .organization="${this.opencgaSession.organization}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config}"
                    .activeMenuItem="${this._activeMenuItem}">
                </custom-vertical-navbar>
            `;
        }
    }

    getDefaultConfig() {
        const menu = [
            {
                id: "general",
                name: "General",
                description: "",
                icon: "",
                featured: "",
                visibility: "private",
                submenu: [
                    // TODO
                    {
                        id: "dashboard",
                        name: "Dashboard (Coming soon)",
                        icon: "fas fa-vial",
                        visibility: "private",
                        render: () => html``,
                    },
                    // TODO
                    {
                        id: "audit",
                        name: "Audit (Coming soon)",
                        type: "category",
                        icon: "fas fa-vial",
                        visibility: "private",
                        render: () => html``,
                    },
                ],
            },
            {
                id: "manage",
                name: "Manage",
                description: "",
                icon: "",
                featured: "", // true | false
                visibility: "private",
                submenu: [
                    /* Vero Note: Maintained for future use in Organization Admin
                    {
                        id: "groups",
                        name: "Groups",
                        icon: "fas fa-vial",
                        visibility: "private",
                        render: (opencgaSession, organization) => html`
                            <group-admin-browser
                                .organization="${organization}"
                                .opencgaSession="${opencgaSession}">
                            </group-admin-browser>
                        `,
                    },
                     */
                    {
                        id: "users",
                        name: "Users",
                        icon: "fas fa-users",
                        visibility: "private",
                        render: (opencgaSession, organization) => html`
                            <user-admin-browser
                                .organization="${organization}"
                                .opencgaSession="${opencgaSession}">
                            </user-admin-browser>
                        `,
                    },
                    {
                        id: "studies",
                        name: "Projects/Studies",
                        icon: "fas fa-project-diagram",
                        visibility: "private",
                        render: (opencgaSession, organization) => {
                            return html`
                                <project-admin-browser
                                    .organization="${organization}"
                                    .opencgaSession="${opencgaSession}">
                                </project-admin-browser>
                            `;
                        },
                    },
                ],
            },
            {
                id: "configure",
                name: "Configure",
                description: "",
                icon: "",
                featured: "",
                visibility: "private",
                submenu: [
                    {
                        id: "settings",
                        name: "Organisation",
                        icon: "fas fa-sitemap",
                        visibility: "private",
                        render: (opencgaSession, organization) => {
                            return html`
                                <organization-admin-detail
                                    .organization="${organization}"
                                    .opencgaSession="${opencgaSession}">
                                </organization-admin-detail>
                            `;
                        },
                    },
                    /*
                    {
                        id: "optimization",
                        name: "Optimizations",
                        icon: "fas fa-vial",
                        visibility: "private",
                        render: (opencgaSession, study) => html``,
                    },
                     */
                ],
            },
        ];

        return {
            name: "Organization Admin",
            logo: "",
            icon: "",
            visibility: "",
            menu: menu,
        };
    }

}

customElements.define("organization-admin", OrganizationAdmin);
