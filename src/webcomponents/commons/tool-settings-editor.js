/**
 * Copyright 2015-2023 OpenCB
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

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new";
import NotificationUtils from "./utils/notification-utils";
import LitUtils from "./utils/lit-utils";
import "./tool-settings-preview.js";


export default class ToolSettingsEditor extends LitElement {

    // --- CONSTRUCTOR ---
    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    // --- PROPERTIES ---
    static get properties() {
        return {
            toolSettings: {
                type: Object,
            },
            readOnly: {
                type: Boolean,
            },
            toolName: {
                type: Object,
            },
            study: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    // --- PRIVATE METHODS ---
    #init() {
        this.isLoading = false;
        this.readOnly = false;
    }

    #initOriginalObjects() {
        // The original settings and study are maintained. A copy is used for previewing the ongoing changes in json
        this._toolSettings = UtilsNew.objectClone(this.toolSettings);
        this._toolName = this.toolName;
        this._config = {
            ...this.getDefaultConfig(),
            // ...this.config,
        };
    }

    // --- UPDATE ---
    update(changedProperties) {
        if (changedProperties.has("toolSettings")) {
            this.toolSettingsObserver();
        }
        if (changedProperties.has("readOnly")) {
            this.readOnlyObserver();
        }
        super.update(changedProperties);
    }

    // --- OBSERVERS ---
    toolSettingsObserver() {
        if (this.toolSettings) {
            this.#initOriginalObjects();
        }
    }

    readOnlyObserver() {
        if (this.readOnly) {
            this._toolSettings = UtilsNew.objectClone(this.toolSettings[Object.keys(this.toolSettings)[0]]);
            this._toolName = Object.keys(this.toolSettings)[0];
            this.requestUpdate();
        }
    }


    // --- EVENTS ---
    onStudyToolSettingsChange(e, field) {
        switch (field) {
            case "json":
                this.highlightPreview = true;
                this._toolSettings = UtilsNew.objectClone(e.detail.value?.json);
                break;
            case "default":
                this._toolSettings = UtilsNew.objectClone(this.opencgaSession.ivaDefaultSettings.settings[this.toolName]);
                break;
            case "backup":
                this._toolSettings = UtilsNew.objectClone(this.study.attributes[SETTINGS_NAME + "_BACKUP"].settings[this.toolName]);
                break;
        }
        LitUtils.dispatchCustomEvent(this, "studyToolSettingsChange", null, {
            _toolSettings: this._toolSettings
        });

        this.requestUpdate();
    }

    onToolChange(e) {
        this._toolSettings = this.toolSettings[e.detail.value];
        this._toolName = e.detail.value;
        this.requestUpdate();
    }

    renderSelect() {
        return html `
            <select-field-filter
                .data="${Object.keys(this.toolSettings)}"
                .value="${this._toolName}"
                .multiple=${false}
                .forceSelection=${true}
                @filterChange="${this.onToolChange}">
            </select-field-filter>
        `;
    }

    // --- RENDER ---
    #renderStyle() {
        return html`
            <style>
                #tool-settings-editor-card {
                    display: flex;
                    flex-direction: column;
                    margin-top: 1em;
                }
                #tool-settings-editor-card-header {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0.5em;
                    margin: 1em 0;
                }
                #tool-settings-editor-card-header > .card-header-title {
                    margin-right: 1em;
                    font-weight: bold;
                }
                #tool-settings-editor-card-header > .card-header-options .filter-option-inner-inner {
                }

            </style>`;
    }

    render() {
        return html `
            <!-- STYLE -->
            ${this.#renderStyle()}

            <div class="card" id="tool-settings-editor-card">
                <!-- Header -->
                <div class="card-header" id="tool-settings-editor-card-header">
                    ${this.readOnly ? html `
                        <div class="card-header-title">Select one of the tools for previewing (READ-ONLY) the settings: </div>
                    `: null}
                    <div class="card-header-options">
                        ${this.readOnly ? this.renderSelect() : html `
                            <button
                                class="btn btn-warning btn-sm" type="button"
                                @click="${e => this.onStudyToolSettingsChange(e, "default")}">
                                DEFAULT SETTINGS
                            </button>
                            <button
                                class="btn btn-warning btn-sm" type="button"
                                @click="${e => this.onStudyToolSettingsChange(e, "backup")}">
                                BACKUP SETTINGS
                            </button>
                        `}
                    </div>
                </div>
                <!-- Content -->
                <div class="card-body" id="">
                    <detail-tabs
                        .data="${this._toolSettings}"
                        .config="${this._config}"
                        .opencgaSession="${this.opencgaSession}">
                    </detail-tabs>
                </div>
            </div>
        `;
    }

    // --- DEFAULT CONFIG ---
    getDefaultConfig() {
        return {
            display: {
                align: "left",
            },
            items: [
                {
                    id: "settings-json",
                    name: "Configure",
                    active: true,
                    display: {
                        align: "",
                        titleClass: "",
                        titleStyle: "",
                        tabTitleClass: "",
                        tabTitleStyle: "",
                        contentClass: "",
                        contentStyle: "",
                    },
                    render: () => {
                        return html `
                            <json-editor
                                .data="${this._toolSettings}"
                                .config="${{readOnly: this.readOnly}}"
                                @fieldChange="${e => this.onStudyToolSettingsChange(e, "json")}">
                            </json-editor>
                        `;
                    }
                },
                // 2. Component responsible for previewing the IVA settings
                {
                    id: "settings-preview",
                    name: "Preview",
                    active: false,
                    display: {
                        align: "",
                        titleClass: "",
                        titleStyle: "",
                        tabTitleClass: "",
                        tabTitleStyle: "",
                        contentClass: "",
                        contentStyle: "",
                    },
                    render: (data, isActive) => {
                        if (isActive) {
                            return html`
                                <tool-settings-preview
                                    .opencgaSession="${this.opencgaSession}"
                                    .settings="${this._toolSettings}"
                                    .tool="${this._toolName}"
                                    .highlightPreview="${this.highlightPreview}">
                                </tool-settings-preview>
                            `;
                        }
                    },
                },
            ],
        };
    }

}

customElements.define("tool-settings-editor", ToolSettingsEditor);
