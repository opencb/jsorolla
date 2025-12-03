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
import WebUtils from "../../commons/utils/web-utils.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import "./group-admin-browser.js";
import "./user-admin-browser.js";
import "../../project/projects-admin.js";
import "./project-admin-browser.js";
import "./organization-admin-detail.js";
import "../../commons/pages/restricted-access-page.js";
import "../../commons/view/vertical-menu.js";
import "./federation-create.js";
import "./federation-connect.js";

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
                type: Object,
            },
            tool: {
                type: String,
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    onChangeActiveItem(event) {
        const [app, tool] = WebUtils.getApplicationAndToolFromHash();
        WebUtils.redirectTo(this.opencgaSession, app, tool, {
            tool: event.detail.value,
        });
    }

    render() {
        if (!this.opencgaSession?.organization || !OpencgaCatalogUtils.isOrganizationAdmin(this.opencgaSession?.organization, this.opencgaSession?.user?.id)) {
            return html`
                <restricted-access-page
                    message="The page you are trying to access has restricted access. Please refer to your system administrator.">
                </restricted-access-page>
            `;
        }

        return html `
            <tool-header title="Organization Admin: ${this.opencgaSession?.organization?.id}"></tool-header>
            <vertical-menu
                .opencgaSession="${this.opencgaSession}"
                .activeItem="${this.tool}"
                .config="${this._config || {}}"
                @changeActiveItem="${event => this.onChangeActiveItem(event)}">
            </vertical-menu>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                menuStyle: "width:240px;",
            },
            menu: [
                // {
                //     id: "general",
                //     name: "General",
                //     description: "",
                //     icon: "",
                //     featured: "",
                //     visibility: "private",
                //     submenu: [
                //         {
                //             id: "dashboard",
                //             name: "Dashboard (Coming soon)",
                //             icon: "fas fa-vial",
                //             visibility: "private",
                //             render: () => html``,
                //         },
                //         {
                //             id: "audit",
                //             name: "Audit (Coming soon)",
                //             type: "category",
                //             icon: "fas fa-vial",
                //             visibility: "private",
                //             render: () => html``,
                //         },
                //     ],
                // },
                {
                    id: "manage",
                    name: "Manage Organization",
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
                            render: opencgaSession => html`
                                <user-admin-browser
                                    .opencgaSession="${opencgaSession}">
                                </user-admin-browser>
                            `,
                        },
                        {
                            id: "studies",
                            name: "Projects and Studies",
                            render: opencgaSession => {
                                return html`
                                    <project-admin-browser
                                        .opencgaSession="${opencgaSession}">
                                    </project-admin-browser>
                                `;
                            },
                        },
                    ],
                },
                {
                    id: "federation",
                    name: "Federation",
                    visible: false,
                    submenu: [
                        {
                            id: "create",
                            name: "Create Federation",
                            render: opencgaSession => {
                                return html`
                                    <federation-create
                                        .organization="${opencgaSession?.organization}"
                                        .opencgaSession="${opencgaSession}">
                                    </federation-create>
                                `;
                            },
                        },
                        {
                            id: "connect",
                            name: "Connect Federation",
                            render: opencgaSession => {
                                return html`
                                    <federation-connect
                                        .organization="${opencgaSession?.organization}"
                                        .opencgaSession="${opencgaSession}">
                                    </federation-connect>
                                `;
                            },
                        },
                    ],
                },
                {
                    id: "configure",
                    name: "Configure",
                    submenu: [
                        {
                            id: "settings",
                            name: "Organization",
                            render: opencgaSession => {
                                return html`
                                    <organization-admin-detail
                                        .organization="${opencgaSession?.organization}"
                                        .opencgaSession="${opencgaSession}">
                                    </organization-admin-detail>
                                `;
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("organization-admin", OrganizationAdmin);
