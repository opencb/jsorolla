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
import LitUtils from "../../../commons/utils/lit-utils";
import "../../../variant/operation/variant-index-operation.js";
import "../../../variant/operation/variant-stats-index-operation.js";
import "../../../variant/operation/variant-annotation-index-operation.js";
import "../../../variant/operation/variant-secondary-annotation-index-operation.js";
import "../../../variant/operation/variant-secondary-sample-index-operation.js";
import "../../../commons/layouts/custom-vertical-navbar.js";
import UtilsNew from "../../../../core/utils-new";
import OpencgaCatalogUtils from "../../../../core/clients/opencga/opencga-catalog-utils";

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
            organizationId: {
                type: String,
            },
            studyId: {
                type: String
            },
            study: {
                type: Object
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

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("organizationId") || changedProperties.has("opencgaSession")) {
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
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "studyChange", this.study, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    opencgaSessionObserver() {
        this._config = this.getDefaultConfig();
    }

    render() {
        const activeMenuItem = "variant-annotation-index";
        if (this.opencgaSession.study && this.organization) {
            if (!OpencgaCatalogUtils.isOrganizationAdminOwner(this.organization, this.opencgaSession.user.id) &&
                !OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
                return html`
                    <tool-header class="page-title-no-margin" title="${this._config.name}"
                                 icon="${this._config.icon}"></tool-header>
                    <div class="d-flex flex-column align-items-center justify-content-center">
                        <h1 class="display-1"><i class="far fa-smile-wink me-4"></i>Restricted access</h1>
                        <h3>The page you are trying to access has restricted access.</h3>
                        <h3>Please refer to your system administrator.</h3>
                    </div>
                `;
            }
            return html`
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
            name: "Operations Admin",
            logo: "",
            icon: "",
            visibility: "", // public | private | none
            menu: [
                {
                    id: "organization-operations",
                    name: "Organization Operations",
                    description: "",
                    icon: "",
                    visibility: "private",
                    featured: "",
                    category: true,
                    submenu: [
                        {
                            id: "variant-annotation-index",
                            name: "Variant Annotation Index",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: opencgaSession => html`
                                <variant-annotation-index-operation
                                    .toolParams="${{project: opencgaSession.project.id}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-annotation-index-operation>
                            `,
                        },
                        {
                            id: "variant-secondary-annotation-index",
                            name: "Variant Secondary Annotation Index",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: opencgaSession => html`
                                <variant-secondary-annotation-index-operation
                                    .toolParams="${{project: opencgaSession.project.id}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-secondary-annotation-index-operation>
                            `,
                        },
                    ],
                },
                {
                    id: "variant-operations",
                    name: "Study Operations",
                    description: "",
                    icon: "",
                    visibility: "private",
                    featured: "",
                    category: true,
                    submenu: [
                        {
                            id: "variant-index",
                            name: "Variant Index",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <variant-index-operation
                                    .toolParams="${{study: study.fqn}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-index-operation>
                            `,
                        },
                        {
                            id: "variant-stats-index",
                            name: "Variant Stats Index",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <variant-stats-index-operation
                                    .toolParams="${{study: study.fqn}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-stats-index-operation>
                            `,
                        },
                        {
                            id: "variant-secondary-sample-index",
                            name: "Variant Secondary Sample Index",
                            icon: "fas fa-key",
                            visibility: "private",
                            type: "navitem",
                            render: (opencgaSession, study) => {
                                // CAUTION: no .fqn? in toolParams property?
                                return html`
                                    <variant-secondary-sample-index-operation
                                        .toolParams="${{study: study.id}}"
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
