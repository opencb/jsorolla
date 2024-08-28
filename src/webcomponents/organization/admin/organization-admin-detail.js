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
 *
 */

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import ModalUtils from "../../commons/modal/modal-utils.js";
import "./organization-admin-add.js";
import "./organization-admin-owner-update.js";
import "./organization-admin-update.js";

export default class OrganizationAdminDetail extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            organization: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "organization-admin-detail";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;

        this.updatedFields = {};
        this.isLoading = false;

        this.displayConfigDefault = {
            buttonsVisible: false,
            collapsable: true,
            titleVisible: false,
            titleWidth: 2,
            defaultValue: "-",
            pdf: false,
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("organization") ||
            changedProperties.has("displayConfig")) {
            this.propertyObserver();
        }

        super.update(changedProperties);
    }

    propertyObserver() {
        // With each property change we must be updated config and create the columns again. No extra checks are needed.
        this.displayConfig = {
            ...this.displayConfigDefault,
            ...this.displayConfig
        };

        this.modals = {
            /*
            "change-owner": {
                label: "Change Owner",
                icon: "fas fa-user-shield",
                modalId: `${this._prefix}AddAdminOrganizationModal`,
                render: () => this.renderChangeOwnerOrganization(),
                permission: OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
            },
             */
            "organization-update": {
                label: "Edit Organization (coming soon...)",
                icon: "far fa-edit",
                modalId: `${this._prefix}UpdateOrganizationModal`,
                render: () => this.renderOrganizationUpdate(),
                permission: OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
            },
        };
    }

    // *** EVENTS ***
    async onActionClick(e) {
        this.action = e.currentTarget.dataset.action;
        this.requestUpdate();
        await this.updateComplete;
        ModalUtils.show(this.modals[this.action]["modalId"]);
    }

    // *** RENDER ***
    /*
    renderChangeOwnerOrganization() {
        return ModalUtils.create(this, `${this._prefix}UpdateOrganizationModal`, {
            display: {
                modalTitle: `Update Organization: ${this.organization.id}`,
                modalDraggable: true,
                modalCyDataName: "modal-organization-owner-update",
                modalSize: "modal-lg"
            },
            render: () => {
                return html`
                    <organization-admin-owner-update
                        .organization="${this.organization}"
                        .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </organization-admin-owner-update>
                `;
            },
        });
    }
    */

    renderOrganizationUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateOrganizationModal`, {
            display: {
                modalTitle: `Update Organization: ${this.organization.id}`,
                modalDraggable: true,
                modalCyDataName: "modal-organization-update",
                modalSize: "modal-lg"
            },
            render: () => {
                return html`
                    <organization-admin-update
                        .organization="${this.organization}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </organization-admin-update>
                `;
            },
        });
    }

    renderOrganizationToolbar() {
        return html `
            <div class="d-flex justify-content-end">
                 ${
                    Object.keys(this.modals).map(modalKey => {
                        const modal = this.modals[modalKey];
                        const color = modal.permission !== "disabled" ? modal.color : "";
                        return html`
                            <!-- Display components on the RIGHT -->
                            <div id="${this._prefix}toolbar" class="d-flex me-1" data-cy="organization-toolbar">
                                <div class="d-flex gap-1" data-cy="organization-toolbar-wrapper">
                                    <button data-action="${modalKey}" type="button" class="btn btn-light disabled"  @click="${e => this.onActionClick(e, modal.render())}">
                                        <div class="d-flex align-items-center">
                                            <div class="me-2"><i class="${modal.icon} ${color}" aria-hidden="true"></i></div>
                                            <div class="me-4 ${color}">${modal.label}...</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        `;
                    })
                }
            </div>
        `;
    }

    render() {
        if (this.organization) {
            return html`
                <!-- 1. Render organization toolbar -->
                ${this.renderOrganizationToolbar()}
                <!-- 2. Render organization information-->
                <data-form
                    .data="${this.organization}"
                    .config="${this._config}">
                </data-form>
                <!-- 3. On action click, render update modal -->
                ${this.action ? this.modals[this.action]["render"](): nothing}
            `;
        }
    }

    // *** CONFIG ***
    getDefaultConfig() {
        return {
            title: "Organization",
            type: "tabs",
            icon: "",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "Organization View",
                    elements: [
                        {
                            title: "Organization ID",
                            type: "complex",
                            display: {
                                template: "${id} (UUID: ${uuid})",
                                style: {
                                    id: {
                                        "font-weight": "bold",
                                    }
                                },
                            },
                        },
                        {
                            title: "Organization Name",
                            field: "name"
                        },
                        {
                            title: "Owner",
                            field: "name"
                        },
                        {
                            title: "Admins",
                            field: "admins",
                            type: "list",
                            display: {
                                defaultValue: "The organization does not have admins yet.",
                                contentLayout: "bullets",
                            },
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date),
                            },
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date),
                            },
                        },
                    ],
                },
                {
                    title: "Authentication Origins",
                    elements: [
                        {
                            title: "Authentication origins",
                            field: "configuration.authenticationOrigins",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        id: "id",
                                        title: "ID",
                                        field: "id",
                                        formatter: () => {},
                                    },
                                    {
                                        id: "host",
                                        title: "Host",
                                        field: "host",
                                        formatter: () => {},
                                    },
                                    {
                                        id: "type",
                                        title: "Type",
                                        field: "type",
                                        formatter: () => {},
                                    },
                                ],
                            },
                        },
                    ]
                },
            ],
        };
    }

}

customElements.define("organization-admin-detail", OrganizationAdminDetail);
