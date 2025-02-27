/**
 * Copyright 2015-2019 OpenCB
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
import "./study-admin-users.js";
import "./study-admin-permissions.js";
import "./study-admin-variable.js";
import "./study-admin-audit.js";
import "./study-admin-configuration.js";
import "../../variant/operation/clinical-analysis-configuration-update.js";
import "../../variant/operation/variant-secondary-sample-index-configure-operation.js";
import "../../commons/view/vertical-menu.js";
import "../../commons/pages/restricted-access-page.js";

export default class StudyAdmin extends LitElement {

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
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
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

        return html `
            <tool-header title="${this._config.name}"></tool-header>
            <vertical-menu
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config || {}}">
            </vertical-menu>
        `;
    }

    getDefaultConfig() {
        return {
            name: "Study Admin",
            display: {
                menuStyle: "width:240px;",
            },
            menu: [
                {
                    id: "manage",
                    name: "Manage Study",
                    description: "",
                    submenu: [
                        {
                            id: "UsersAndGroups",
                            name: "Users and Groups",
                            icon: "fas fa-user-friends",
                            render: opencgaSession => html`
                                <study-admin-users
                                    .opencgaSession="${opencgaSession}"
                                    .study="${opencgaSession.study}">
                                </study-admin-users>
                            `,
                        },
                        /*
                        {
                            id: "groups",
                            name: "Groups",
                            icon: "fas fa-users-cog",
                            visibility: "private",
                            render: (opencgaSession, study) => {
                                return html`
                                    <group-admin-browser
                                        .study="${study}"
                                        .opencgaSession="${opencgaSession}">
                                    </group-admin-browser>
                                `;
                            }
                        },
                         */
                        {
                            id: "Permissions",
                            name: "Permissions",
                            icon: "fas fa-key",
                            render: opencgaSession => html`
                                <study-admin-permissions
                                    .opencgaSession="${opencgaSession}"
                                    .study="${opencgaSession.study}">
                                </study-admin-permissions>
                            `,
                        },
                        {
                            id: "VariableSets",
                            name: "Variable Sets",
                            icon: "fas fa-book",
                            render: opencgaSession => html`
                                <study-admin-variable
                                    .opencgaSession="${opencgaSession}"
                                    .study="${opencgaSession.study}">
                                </study-admin-variable>
                            `,
                        },
                    ],
                },
                {
                    id: "variant-configuration",
                    name: "Variant Configuration",
                    description: "",
                    submenu: [
                        {
                            id: "clinical-analysis-configuration-operation",
                            name: "Clinical Analysis Configuration",
                            icon: "fas fa-key",
                            render: opencgaSession => html`
                                <clinical-analysis-configuration-update
                                    .toolParams="${{study: opencgaSession.study.id}}"
                                    .opencgaSession="${opencgaSession}">
                                </clinical-analysis-configuration-update>
                            `,
                        },
                        {
                            id: "variant-secondary-sample-configure-index",
                            name: "Sample Index Configuration",
                            icon: "fas fa-key",
                            render: opencgaSession => html`
                                <variant-secondary-sample-index-configure-operation
                                    .toolParams="${{study: opencgaSession.study.id}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-secondary-sample-index-configure-operation>
                            `,
                        },
                    ],
                },
                {
                    id: "general",
                    name: "General",
                    description: "",
                    submenu: [
                        {
                            id: "audit",
                            name: "Audit",
                            icon: "fas fa-book",
                            render: opencgaSession => html`
                                <study-admin-audit
                                    .opencgaSession="${opencgaSession}"
                                    .study="${opencgaSession.study}">
                                </study-admin-audit>
                            `,
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("study-admin", StudyAdmin);
