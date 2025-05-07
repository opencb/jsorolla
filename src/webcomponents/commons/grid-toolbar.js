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
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "./utils/lit-utils.js";
import ModalUtils from "./modal/modal-utils.js";
import "./opencga-export.js";
import "./catalog-browser-grid-config.js";
import "../variant/interpretation/variant-interpreter-grid-config.js";

export default class GridToolbar extends LitElement {

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
            toolId: {
                type: String,
            },
            resource: {
                type: String,
            },
            rightToolbar: {
                type: Array
            },
            leftContent: {
                type: Object,
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

        if (changedProperties.has("config") || changedProperties.has("resource")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    onCloseSetting() {
        ModalUtils.close(`${this._prefix}SettingModal`);
    }

    onExport(e) {
        LitUtils.dispatchCustomEvent(this, "export", {}, e.detail);
    }

    onActionClick(event) {
        const action = event.currentTarget.dataset.action;
        switch (action) {
            case "export":
                ModalUtils.show(`${this._prefix}ExportModal`);
                break;
            case "settings":
                ModalUtils.show(`${this._prefix}SettingModal`);
                break;
        }
    }

    renderRightButtons() {
        return (this.rightToolbar || []).map(button => {
            if (typeof button.render === "function") {
                return button.render();
            } else {
                return html`
                    <button class="btn btn-light ${button.className || ""} ${button.disabled ? "disabled" : ""}" @click="${button.onClick}">
                        ${button.icon ? html`<i class="fas ${button.icon} me-1"></i>` : nothing}
                        ${button.title}
                    </button>
                `;
            }
        });
    }

    render() {
        return html`
            <div class="d-flex align-items-center justify-content-between mb-2" data-cy="toolbar">
                <div class="d-flex align-items-center" data-cy="toolbar-left-content">
                    ${this.leftContent || nothing}
                </div>
                <div class="d-flex gap-1 justify-content-end" data-cy="toolbar-wrapper">
                    ${this.rightToolbar?.length > 0 ? html`
                        <div class="d-flex align-items-stretch gap-1">
                            ${this.renderRightButtons()}
                        </div>
                    ` : nothing}

                    ${this.rightToolbar?.length > 0 && (this._settings?.showExport || this._settings?.showSettings) ? html`
                        <div class="w-px bg-gray-200 mx-1"></div>
                    ` : nothing}

                    ${this._settings.showExport ? html`
                        <button data-cy="toolbar-btn-export" data-action="export" type="button" class="btn btn-light" @click="${this.onActionClick}">
                            ${this._settings?.downloading === true ? html`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>` : null}
                            <i class="fas fa-download pe-1" aria-hidden="true"></i> Export ...
                        </button>
                    ` : nothing}

                    ${this._settings?.showSettings ? html`
                        <button data-cy="toolbar-btn-settings" data-action="settings" type="button" class="btn btn-light" @click="${this.onActionClick}">
                            <i class="fas fa-cog pe-1"></i> Settings ...
                        </button>
                    ` : nothing}
                </div>
            </div>

            ${this._settings?.showExport && this._config?.export ? ModalUtils.create(this, `${this._prefix}ExportModal`, this._config.export) : nothing}

            ${this._settings?.showSettings && this._config?.settings ? ModalUtils.create(this, `${this._prefix}SettingModal`, this._config.settings) : nothing}
        `;
    }

    getDefaultSettings() {
        return {
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
                    modalTitle: (this.resource || this.config?.resource) + " Export",
                    modalSize: "modal-lg",
                },
                render: () => html`
                    <opencga-export
                        .resource="${this.resource || this.config?.resource}"
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
                    modalTitle: (this.resource || this.config?.resource) + " Settings",
                    modalSize: "modal-lg"
                },
                render: () => !this._config?.showInterpreterConfig ? html `
                    <catalog-browser-grid-config
                        .opencgaSession="${this.opencgaSession}"
                        .gridColumns="${this._config.columns}"
                        .toolId="${this.toolId || this._config?.toolId}"
                        .config="${this._settings}"
                        @settingsUpdate="${this.onCloseSetting}">
                    </catalog-browser-grid-config>` : html `
                    <variant-interpreter-grid-config
                        .opencgaSession="${this.opencgaSession}"
                        .gridColumns="${this._config.columns}"
                        .config="${this._settings}"
                        .toolId="${this.toolId || this._config?.toolId}"
                        @settingsUpdate="${this.onCloseSetting}">
                    </variant-interpreter-grid-config>
                `,
            }
        };
    }

}

customElements.define("grid-toolbar", GridToolbar);
