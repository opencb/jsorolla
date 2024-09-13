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

import {html, LitElement, nothing} from "lit";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "./utils/lit-utils";
import ModalUtils from "./modal/modal-utils.js";
import "./opencga-export.js";
import "../variant/interpretation/variant-interpreter-grid-config.js";
import WebUtils from "./utils/web-utils.js";

export default class OpencbGridToolbar extends LitElement {

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
            rightToolbar: {
                type: Array
            },
            query: {
                type: Object
            },
            settings: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this._settings = this.getDefaultSettings();
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this._settings = {
                ...this.getDefaultSettings(),
                ...this.settings,
            };
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };

            this.permissionID = WebUtils.getPermissionID(this._config.resource, "WRITE");
        }

        super.update(changedProperties);
    }

    onCloseSetting() {
        ModalUtils.close(`${this._prefix}SettingModal`);
    }

    onExport(e) {
        // Simply forwarding from opencga-export to grid components
        LitUtils.dispatchCustomEvent(this, "export", {}, e.detail);
    }

    onActionClick(e) {
        const action = e.currentTarget.dataset.action;
        switch (action) {
            case "create":
                this._config.create?.modalId ?
                    ModalUtils.show(this._config.create.modalId) :
                    ModalUtils.show(`${this._prefix}CreateModal`);
                break;
            case "export":
                ModalUtils.show(`${this._prefix}ExportModal`);
                break;
            case "settings":
                ModalUtils.show(`${this._prefix}SettingModal`);
                break;
        }
        LitUtils.dispatchCustomEvent(this, toolbar + UtilsNew.capitalize(action));
    }

    render() {
        const rightButtons = [];
        if (this.rightToolbar?.length > 0) {
            for (const rightButton of this.rightToolbar) {
                rightButtons.push(rightButton.render());
            }
        }
        // Button create text
        const buttonCreateText = this._settings?.buttonCreateText || "New...";

        // Check 'Create' permissions
        let isCreateDisabled = false;
        let isCreateDisabledTooltip = "";
        if (this._config?.create?.display?.disabled) {
            isCreateDisabled = true;
            isCreateDisabledTooltip = this._config?.create?.display?.disabledTooltip;
        } else {
            const simplifyPermissions = this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions;
            const hasPermissions = OpencgaCatalogUtils
                .checkPermissions(this.opencgaSession?.study, this.opencgaSession?.user?.id, this.permissionID, simplifyPermissions);
            if (!hasPermissions) {
                isCreateDisabled = true;
                isCreateDisabledTooltip = "Creating a new instance requires write permissions on the study. Please, contact your administrator if you need different access rights.";
            }
        }

        return html`
            <div class="opencb-grid-toolbar">
                <div class="row mb-2">
                    <div id="${this._prefix}ToolbarLeft" class="col-md-6">
                        <!-- Display components on the LEFT -->
                    </div>
                    <div id="${this._prefix}toolbar" class="col-md-6" data-cy="toolbar">
                        <!-- Display components on the RIGHT -->
                        <div class="d-flex gap-1 justify-content-end" data-cy="toolbar-wrapper">
                            <!-- First, display custom elements passed as 'rightToolbar' parameter, this must be the first ones displayed -->
                            ${rightButtons?.length > 0 ? rightButtons.map(rightButton => html`
                                <div class="btn-group">
                                    ${rightButton}
                                </div>
                            `) : nothing}

                            <!-- Second, display elements configured -->
                            ${this._config?.create && (this._settings.showCreate || this._settings.showNew) ? html`
                                <div class="btn-group">
                                    <!-- Note 20230517 Vero: it is not possible to trigger a tooltip on a disabled button.
                                    As a workaround, the tooltip will be displayed from a wrapper -->
                                    ${isCreateDisabled ? html `
                                        <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" title="${isCreateDisabledTooltip}">
                                            <button data-cy="toolbar-btn-create" data-action="create" type="button" class="btn btn-light" disabled>
                                                <i class="fas fa-file pe-1" aria-hidden="true"></i> ${buttonCreateText}
                                            </button>
                                        </span>
                                    ` : html `
                                        <button data-cy="toolbar-btn-create" data-action="create" type="button" class="btn btn-light" @click="${this.onActionClick}">
                                            ${this._settings?.downloading === true ? html`
                                                <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
                                            ` : nothing}
                                            <i class="fas fa-file pe-1" aria-hidden="true"></i> ${buttonCreateText}
                                        </button>
                                    `}
                                </div>
                            ` : nothing}

                            ${this._settings.showExport ? html`
                                <div class="btn-group">
                                    <button data-cy="toolbar-btn-export" data-action="export" type="button" class="btn btn-light" @click="${this.onActionClick}">
                                        ${this._settings?.downloading === true ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>` : null}
                                        <i class="fas fa-download pe-1" aria-hidden="true"></i> Export ...
                                    </button>
                                </div>
                            ` : nothing}

                            ${this._settings?.showSettings ? html`
                                <div class="btn-group">
                                    <button data-cy="toolbar-btn-settings" data-action="settings" type="button" class="btn btn-light" @click="${this.onActionClick}">
                                        <i class="fas fa-cog pe-1"></i> Settings ...
                                    </button>
                                </div>
                            ` : nothing}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add modals-->
            ${(this._config?.create &&
            (this._settings.showCreate || this._settings.showNew) &&
            OpencgaCatalogUtils.checkPermissions(this.opencgaSession?.study, this.opencgaSession?.user?.id, this.permissionID)) ?
            ModalUtils.create(this, this._config.create?.modalId || `${this._prefix}CreateModal`, this._config.create) :
            nothing}

            ${this._settings?.showExport && this._config?.export ? ModalUtils.create(this, `${this._prefix}ExportModal`, this._config.export) : nothing}

            ${this._settings?.showSettings && this._config?.settings ? ModalUtils.create(this, `${this._prefix}SettingModal`, this._config.settings) : nothing}
        `;
    }

    getDefaultSettings() {
        return {
            // label: "records",
            showCreate: true,
            showExport: true,
            showSettings: true,
            // download: ["Tab", "JSON"],
            // buttons: ["columns", "download"],
        };
    }

    getDefaultConfig() {
        return {
            export: {
                display: {
                    modalDraggable: true,
                    modalTitle: this.config?.resource + " Export",
                    modalSize: "modal-lg",
                },
                render: () => html`
                    <opencga-export
                        .config="${this._config}"
                        .query=${this.query}
                        .opencgaSession="${this.opencgaSession}"
                        @export="${this.onExport}"
                        @changeExportField="${this.onChangeExportField}">
                    </opencga-export>
                `,
            },
            settings: {
                display: {
                    modalDraggable: true,
                    modalTitle: this.config?.resource + " Settings",
                    modalSize: "modal-lg"
                },
                render: () => !this._config?.showInterpreterConfig ? html `
                    <catalog-browser-grid-config
                        .opencgaSession="${this.opencgaSession}"
                        .gridColumns="${this._config.columns}"
                        .toolId="${this._config?.toolId}"
                        .config="${this._settings}"
                        @settingsUpdate="${this.onCloseSetting}">
                    </catalog-browser-grid-config>` : html `
                    <variant-interpreter-grid-config
                        .opencgaSession="${this.opencgaSession}"
                        .gridColumns="${this._config.columns}"
                        .config="${this._settings}"
                        .toolId="${this._config?.toolId}"
                        @settingsUpdate="${this.onCloseSetting}">
                    </variant-interpreter-grid-config>
                `,
            }
        };
    }

}

customElements.define("opencb-grid-toolbar", OpencbGridToolbar);
