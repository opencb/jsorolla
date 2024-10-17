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
import LitUtils from "../../commons/utils/lit-utils";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import "./study-admin-users.js";
import "./study-admin-permissions.js";
import "./study-admin-variable.js";
import "./study-admin-audit.js";
import "./study-admin-configuration.js";
import "../../variant/operation/clinical-analysis-configuration-update.js";
import "../../variant/operation/variant-secondary-sample-index-configure-operation.js";
import "../../commons/layouts/custom-vertical-navbar.js";

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
            studyId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this.study = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("studyId") || changedProperties.has("opencgaSession")) {
            this.studyIdObserver();
        }
        super.update(changedProperties);
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
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
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "studySearch", this.study, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    render() {
        const activeMenuItem = "UsersAndGroups";
        if (this.opencgaSession.study && this.opencgaSession.organization) {
            if (!OpencgaCatalogUtils.isOrganizationAdmin(this.opencgaSession.organization, this.opencgaSession.user.id) &&
                !OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
                return html`
                    <tool-header class="page-title-no-margin"  title="${this._config.name}" icon="${this._config.icon}"></tool-header>
                    <div class="d-flex flex-column align-items-center justify-content-center">
                        <h1 class="display-1"><i class="fas fa-user-shield me-4"></i>Restricted access</h1>
                        <h3>The page you are trying to access has restricted access.</h3>
                        <h3>Please refer to your system administrator.</h3>
                    </div>
                `;
            }

            return html `
                <tool-header class="page-title-no-margin"  title="${this._config.name}" icon="${this._config.icon}"></tool-header>
                <custom-vertical-navbar
                    .study="${this.opencgaSession.study}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config}"
                    .activeMenuItem="${activeMenuItem}">
                </custom-vertical-navbar>
            `;
        }
    }

    getDefaultConfig() {
        return {
            id: "",
            name: "Study Admin",
            logo: "",
            icon: "fas fa-sliders-h",
            visibility: "private", // public | private | none
            menu: [
                {
                    id: "general",
                    name: "General",
                    description: "",
                    icon: "",
                    featured: "", // true | false
                    visibility: "private",
                    submenu: [
                        {
                            id: "audit",
                            name: "Audit",
                            icon: "fas fa-book",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <study-admin-audit
                                    .opencgaSession="${opencgaSession}"
                                    .study="${study}">
                                </study-admin-audit>`,
                        },
                    ],
                },
                {
                    id: "configuration",
                    name: "Configuration",
                    description: "",
                    icon: "",
                    featured: "", // true | false
                    visibility: "private",
                    submenu: [
                        {
                            id: "UsersAndGroups",
                            name: "Users and Groups",
                            icon: "fas fa-user-friends",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <study-admin-users
                                        .opencgaSession="${opencgaSession}"
                                        .study="${study}">
                                </study-admin-users>`,
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
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <study-admin-permissions
                                        .opencgaSession="${opencgaSession}"
                                        .study="${study}">
                                </study-admin-permissions>`,
                        },
                        {
                            id: "VariableSets",
                            name: "Variable Sets",
                            icon: "fas fa-book",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <study-admin-variable
                                        .opencgaSession="${opencgaSession}"
                                        .study="${study}">
                                </study-admin-variable>`,
                        },
                        // {
                        //     id: "Configuration",
                        //     // label: "Configuration",
                        //     name: "Configuration",
                        //     icon: "fas fa-cog",
                        //     visibility: "private",
                        //     render: (opencgaSession, study) => html`
                        //         <study-admin-configuration
                        //                 .opencgaSession="${opencgaSession}"
                        //                 .study="${study}">
                        //         </study-admin-configuration>`,
                        // },
                    ],
                },
                {
                    id: "variant-configuration",
                    name: "Variant Configuration",
                    description: "",
                    icon: "",
                    featured: "", // true | false
                    visibility: "private",
                    submenu: [
                        {
                            id: "clinical-analysis-configuration-operation",
                            name: "Clinical Analysis Configuration",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: (opencgaSession, study) => {
                                return html `
                                    <clinical-analysis-configuration-update
                                            .toolParams="${{study: study.id}}"
                                            .opencgaSession="${opencgaSession}">
                                    </clinical-analysis-configuration-update>
                                `;
                            }
                        },
                        {
                            id: "variant-secondary-sample-configure-index",
                            name: "Sample Index Configuration",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: (opencgaSession, study) => {
                                return html `
                                    <variant-secondary-sample-index-configure-operation
                                        .toolParams="${{study: study.id}}"
                                        .opencgaSession="${opencgaSession}">
                                    </variant-secondary-sample-index-configure-operation>
                              `;
                            }
                        },
                    ],
                },
                // {
                //     id: "Operations",
                //     name: "Operations",
                //     category: true, // true | false
                //     visibility: "private",
                //     description: "",
                //     icon: "",
                //     featured: "", // true | false
                //     submenu: [
                //         // {
                //         //     id: "Solr",
                //         //     name: "Solr",
                //         //     // CAUTION: icon vs. img in config.js?
                //         //     img: "/sites/iva/img/logos/Solr.png",
                //         //     visibility: "private",
                //         // },
                //         // {
                //         //     id: "Rysnc",
                //         //     name: "Rysnc",
                //         //     icon: "",
                //         //     visibility: "private",
                //         // },
                //     ],
                // },
            ],
        };
    }

}

customElements.define("study-admin", StudyAdmin);
