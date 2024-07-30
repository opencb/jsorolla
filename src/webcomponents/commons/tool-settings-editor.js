/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../core/utils-new";
import NotificationUtils from "./utils/notification-utils";
import LitUtils from "./utils/lit-utils";
import "./tool-settings-preview.js";
import "./forms/select-field-filter.js";

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
        <div style="width:20rem">
            <select-field-filter
                .data="${Object.keys(this.toolSettings)}"
                .value="${this._toolName}"
                .config="${{
                    multiple: false,
                    liveSearch: false
                }}"
                @filterChange="${this.onToolChange}">
            </select-field-filter>
        </div>
        `;
    }

    // --- RENDER ---
    render() {
        return html `
            <div class="card d-flex flex-column mt-3" id="tool-settings-editor-card">
                <!-- Header -->
                <div class="d-flex justify-content-center align-items-center mt-3 gap-2" id="tool-settings-editor-card-header">
                    ${this.readOnly ? html `
                        <label class="form-label fw-bold">Select one of the tools for previewing (READ-ONLY) the settings: </label>
                    `: nothing}
                    <div class="d-flex gap-1">
                        ${this.readOnly ? this.renderSelect() : html `
                            <button
                                class="btn btn-warning" type="button"
                                @click="${e => this.onStudyToolSettingsChange(e, "default")}">
                                DEFAULT SETTINGS
                            </button>
                            <button
                                class="btn btn-warning" type="button"
                                @click="${e => this.onStudyToolSettingsChange(e, "backup")}">
                                BACKUP SETTINGS
                            </button>
                        `}
                    </div>
                </div>
                <!-- Content -->
                <div class="card-body ps-3 pe-2" id="">
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
                    name: "Tool Settings",
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
                        if (this.readOnly) {
                            return html `
                                <json-viewer
                                    .data="${this._toolSettings}">
                                </json-viewer>
                            `;
                        } else {
                            return html `
                                <json-editor
                                    .data="${this._toolSettings}"
                                    .config="${{readOnly: this.readOnly}}"
                                    @fieldChange="${e => this.onStudyToolSettingsChange(e, "json")}">
                                </json-editor>
                            `;
                        }
                    }
                },
                // 2. Component responsible for previewing the IVA settings
                {
                    id: "settings-preview",
                    name: "Tool Preview",
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
