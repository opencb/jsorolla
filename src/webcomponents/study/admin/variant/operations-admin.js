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
import OpencgaCatalogUtils from "../../../../core/clients/opencga/opencga-catalog-utils";
import "../../../variant/operation/variant-index-operation.js";
import "../../../variant/operation/variant-stats-index-operation.js";
import "../../../variant/operation/variant-annotation-index-operation.js";
import "../../../variant/operation/variant-secondary-annotation-index-operation.js";
import "../../../variant/operation/variant-secondary-sample-index-operation.js";
import "../../../commons/view/vertical-menu.js";
import "../../../commons/pages/restricted-access-page.js";

export default class OperationsAdmin extends LitElement {

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
        this.study = {};
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

        return html`
            <tool-header title="${this._config.name}"></tool-header>
            <vertical-menu
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config || {}}">
            </vertical-menu>
        `;
    }

    getDefaultConfig() {
        return {
            name: "Variant Operations",
            display: {
                menuStyle: "width:240px;",
            },
            menu: [
                {
                    id: "organization-operations",
                    name: "Organization Operations",
                    submenu: [
                        {
                            id: "variant-annotation-index",
                            name: "Variant Annotation Index",
                            render: opencgaSession => {
                                if (!OpencgaCatalogUtils.isOrganizationAdmin(opencgaSession.organization, opencgaSession.user.id)) {
                                    return html`
                                        <div class="d-flex flex-column align-items-center justify-content-center">
                                            <h1 class="display-1"><i class="fas fa-user-shield me-4"></i>Restricted access</h1>
                                            <h3>The page you are trying to access has restricted access.</h3>
                                            <h3>Please refer to your system administrator.</h3>
                                        </div>
                                    `;
                                }
                                return html`
                                    <variant-annotation-index-operation
                                        .toolParams="${{project: opencgaSession.project.fqn}}"
                                        .opencgaSession="${opencgaSession}">
                                    </variant-annotation-index-operation>
                                `;
                            }
                        },
                        {
                            id: "variant-secondary-annotation-index",
                            name: "Variant Secondary Annotation Index",
                            render: opencgaSession => {
                                if (!OpencgaCatalogUtils.isOrganizationAdmin(opencgaSession.organization, opencgaSession.user.id)) {
                                    return html`
                                        <div class="d-flex flex-column align-items-center justify-content-center">
                                            <h1 class="display-1"><i class="fas fa-user-shield me-4"></i>Restricted access</h1>
                                            <h3>The page you are trying to access has restricted access.</h3>
                                            <h3>Please refer to your system administrator.</h3>
                                        </div>
                                    `;
                                }
                                return html`
                                    <variant-secondary-annotation-index-operation
                                        .toolParams="${{project: opencgaSession.project.fqn}}"
                                        .opencgaSession="${opencgaSession}">
                                    </variant-secondary-annotation-index-operation>
                                `;
                            }
                        },
                    ],
                },
                {
                    id: "variant-operations",
                    name: "Study Operations",
                    submenu: [
                        {
                            id: "variant-index",
                            name: "Variant Index",
                            render: opencgaSession => html`
                                <variant-index-operation
                                    .toolParams="${{study: opencgaSession.study.fqn}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-index-operation>
                            `,
                        },
                        {
                            id: "variant-stats-index",
                            name: "Variant Stats Index",
                            render: opencgaSession => html`
                                <variant-stats-index-operation
                                    .toolParams="${{study: opencgaSession.study.fqn}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-stats-index-operation>
                            `,
                        },
                        {
                            id: "variant-secondary-sample-index",
                            name: "Variant Secondary Sample Index",
                            render: opencgaSession=> {
                                return html`
                                    <variant-secondary-sample-index-operation
                                        .toolParams="${{study: opencgaSession.study.id}}"
                                        .opencgaSession="${opencgaSession}">
                                    </variant-secondary-sample-index-operation>
                                `;
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("operations-admin", OperationsAdmin);
