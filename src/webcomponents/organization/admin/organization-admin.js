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
import UtilsNew from "../../../core/utils-new";
import LitUtils from "../../commons/utils/lit-utils";
import "./group-admin-browser.js";
import "./user-admin-browser.js";

// FIXME VERY IMPORTANT:
//  ********************************************
//  Enable only for organization owner or admin
//  ********************************************

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
            organizationId: {
                type: String,
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
        this._activeMenuItem = "";
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("organizationId") || changedProperties.has("opencgaSession")) {
            this.organizationIdObserver();
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
                    LitUtils.dispatchCustomEvent(this, "organizationChange", this.organization, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    // --- RENDER METHOD  ---
    render() {
        if (this.organization) {
            return html`
                <!-- <tool-header class="page-title-no-margin" title="$this._config.name}" icon="$this._config.icon}"></tool-header>-->
                <custom-vertical-navbar
                    .organization="${this.organization}"
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
                id: "dashboard",
                name: "Dashboard",
                description: "",
                icon: "",
                featured: "", // true | false
                visibility: "private",
                submenu: [
                    // TODO: pending refactor and fix
                    {
                        id: "audit",
                        name: "Audit",
                        icon: "fas fa-vial",
                        visibility: "private",
                        render: (opencgaSession, study) => html``,
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
                    {
                        id: "users",
                        name: "Users",
                        icon: "fas fa-vial",
                        visibility: "private",
                        render: (opencgaSession, organization) => html`
                            <user-admin-browser
                                .organization="${organization}"
                                .opencgaSession="${opencgaSession}">
                            </user-admin-browser>
                        `,
                    },
                    {
                        id: "settings",
                        name: "Settings",
                        icon: "fas fa-vial",
                        visibility: "private",
                        render: (opencgaSession, study) => html``,
                    },
                    {
                        id: "studies",
                        name: "Projects/Studies",
                        icon: "fas fa-vial",
                        visibility: "private",
                        render: (opencgaSession, study) => html``,
                    },
                ],
            },
            {
                id: "configure",
                name: "Configure",
                description: "",
                icon: "",
                featured: "", // true | false
                visibility: "private",
                submenu: [
                    {
                        id: "identity-providers",
                        name: "Identity Providers",
                        icon: "fas fa-vial",
                        visibility: "private",
                        render: (opencgaSession, study) => html``,
                    },
                    {
                        id: "optimization",
                        name: "Optimizations",
                        icon: "fas fa-vial",
                        visibility: "private",
                        render: (opencgaSession, study) => html``,
                    },
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
