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
import ModalUtils from "./modal/modal-ultils.js";
import "./opencga-export.js";
import "./modal/modal-popup.js";
import debug from "debug";
import NotificationUtils from "./utils/notification-utils";

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
            operation: {
                type: Object,
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
            this._settings = {...this.getDefaultSettings(), ...this.settings};
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    // onDownloadFile(e) {
    //     this.dispatchEvent(new CustomEvent("download", {
    //         detail: {
    //             option: e.target.dataset.downloadOption
    //         }
    //     }));
    // }

    // not used as changes to exportFields is not propagated outside opencga-export anymore (exportFields is now sent on click on download button via `export` event)
    // onChangeExportField(e) {
    //     // simply forwarding from opencga-export to grid components
    //     LitUtils.dispatchCustomEvent(this, "changeExportField", e.detail, {});
    // }

    // checkboxToggle(e) {
    //     // We undo the checkbox action. We will toggle it on a different event
    //     e.currentTarget.checked = !e.currentTarget.checked;
    // }

    // onColumnClick(e) {
    //     // We do this call to avoid the dropdown to be closed after the click
    //     e.stopPropagation();
    //
    //     // Toggle the checkbox
    //     e.currentTarget.firstElementChild.checked = !e.currentTarget.firstElementChild.checked;
    //     this.dispatchEvent(new CustomEvent("columnChange", {
    //         detail: {
    //             id: e.currentTarget.dataset.columnId,
    //             selected: e.currentTarget.firstElementChild.checked
    //         }, bubbles: true, composed: true
    //     }));
    //
    // }

    // isTrue(value) {
    //     return UtilsNew.isUndefinedOrNull(value) || value;
    // }

    // CAUTION: solution 2 to edit two or more consecutive times the same component in grid: sample, individual, etc. -->
    onCloseModal() {
        this.operation = null;
    }

    onGridConfigChange(e) {
        this.__config = e.detail.value;
    }

    onConfigSave(e) {
        // Update user configuration
        // console.log("onGridConfigSave", this, "values", e.detail.value.columns);
        try {
            OpencgaCatalogUtils.updateGridConfig(this.opencgaSession, "sampleBrowserCatalog", e.detail.value);
            this.settingsObserver();

            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: "Configuration saved",
            });
        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
        }
    }

    onExport(e) {
        // Simply forwarding from opencga-export to grid components
        LitUtils.dispatchCustomEvent(this, "export", {}, e.detail);
    }

    onActionClick(e) {
        const action = e.currentTarget.dataset.action;
        switch (action) {
            case "create":
                // this.dispatchEvent(new CustomEvent("actionClick", {
                //     detail: {
                //         action: action,
                //     }
                // }));
                // this.dispatchEvent(new CustomEvent("toolbarNewClick", {
                //     detail: {
                //         action: action,
                //     }
                // }));
                ModalUtils.show(`${this.prefix}CreateModal`);
                break;
            case "export":
                // $(`#${this._prefix}export-modal`, this).modal("show");
                ModalUtils.show(`${this.prefix}ExportModal`);
                break;
            case "settings":
                ModalUtils.show(`${this.prefix}SettingModal`);
                break;
        }
        LitUtils.dispatchCustomEvent(this, toolbar + action);
    }

    render() {
        const rightButtons = [];
        if (this.rightToolbar?.length > 0) {
            for (const rightButton of this.rightToolbar) {
                rightButtons.push(rightButton.render());
            }
        }

        return html`
            <style>
                .opencb-grid-toolbar .checkbox-container label:before {
                    margin-top: 5px;
                }
                .opencb-grid-toolbar {
                    margin-bottom: ${~this._settings?.buttons.indexOf("new") ? 10 : 5}px;
                }
            </style>

            <div class="opencb-grid-toolbar">
                <div class="row">
                    <div id="${this._prefix}ToolbarLeft" class="col-md-6">
                        <!-- Display components on the LEFT -->
                    </div>

                    <div id="${this._prefix}toolbar" class="col-md-6">
                        <!-- Display components on the RIGHT -->
                        <div class="form-inline text-right pull-right">
                            <!-- First, display custom elements passed as 'rightToolbar' parameter, this must be the first ones displayed -->
                            ${rightButtons?.length > 0 ? rightButtons.map(rightButton => html`
                                <div class="btn-group">
                                    ${rightButton}
                                </div>
                            `) : nothing}

                            <!-- Second, display elements configured -->
                            ${(this._settings.showCreate || this._settings.showNew) &&
                            OpencgaCatalogUtils.checkPermissions(this.opencgaSession?.study, this.opencgaSession?.user?.id, `WRITE_${this._config.resource}`) ? html`
                                <div class="btn-group">
                                    <button data-action="create" type="button" class="btn btn-default btn-sm" @click="${this.onActionClick}">
                                        ${this._settings?.downloading === true ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>` : null}
                                        <i class="fas fa-file icon-padding" aria-hidden="true"></i> New ...
                                    </button>
                                </div>
                            ` : nothing}

                            ${this._settings.showExport ? html`
                                <div class="btn-group">
                                    <button data-action="export" type="button" class="btn btn-default btn-sm" @click="${this.onActionClick}">
                                        ${this._settings?.downloading === true ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>` : null}
                                        <i class="fas fa-download icon-padding" aria-hidden="true"></i> Export ...
                                    </button>
                                </div>
                            ` : nothing}

                            <!-- && this._config? !== undefined-->
                            ${this._settings?.showSettings ? html`
                                <div class="btn-group">
                                    <button data-action="settings" type="button" class="btn btn-default btn-sm" @click="${this.onActionClick}">
                                        <i class="fas fa-cog icon-padding"></i> Settings ...
                                    </button>
                                </div>` : nothing}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add modals-->
            ${(this._settings.showCreate || this._settings.showNew) && this._config?.create && OpencgaCatalogUtils.checkPermissions(this.opencgaSession?.study, this.opencgaSession?.user?.id, `WRITE_${this._config.resource}`) ?
                ModalUtils.create(this, `${this.prefix}CreateModal`, this._config.create) : nothing
            }

            ${this._settings?.showExport && this._config?.export ?
                ModalUtils.create(this, `${this.prefix}ExportModal`, this._config.export) : nothing}

            ${this._settings?.showSettings && this._config?.settings ?
                ModalUtils.create(this, `${this.prefix}SettingModal`, this._config.settings) : nothing}

            <!-- // CAUTION: solution 2 to edit two or more consecutive times the same component in grid: sample, individual, etc. -->
            <!-- $this.operation && ModalUtils.create(this.operation.modalId, this.operation.config)} -->
            ${ false && html `
                <modal-popup
                    .modalId="${this.operation.modalId}"
                    .config="${this.operation.config}"
                    @closeModal="${this.onCloseModal}">
                </modal-popup>
            `}
        `;
    }

    getDefaultSettings() {
        return {
            label: "records",
            showCreate: true,
            showDownload: true,
            showSettings: true,
            download: ["Tab", "JSON"],
            buttons: ["columns", "download"],
            rightToolbar: {
                // render
            }
        };
    }

    getDefaultConfig() {
        return {
            export: {
                display: {
                    modalTitle: this.config?.resource + " Export",
                },
                render: () => html`
                    <opencga-export
                        .config="${this._config}"
                        .query=${this.query}
                        .opencgaSession="${this.opencgaSession}"
                        @export="${this.onExport}"
                        @changeExportField="${this.onChangeExportField}">
                    </opencga-export>`
            },
            settings: {
                display: {
                    modalTitle: this.config?.resource + " Settings",
                    modalbtnsVisible: false
                },
                render: () => html `
                    <catalog-browser-grid-config
                        .opencgaSession="${this.opencgaSession}"
                        .gridColumns="${this._config.columns}"
                        .config="${this._settings}"
                        @configChange="${this.onGridConfigChange}"
                        @modalOk="${this.onConfigSave}">
                    </catalog-browser-grid-config>`
            }
        };
    }

}
customElements.define("opencb-grid-toolbar", OpencbGridToolbar);
