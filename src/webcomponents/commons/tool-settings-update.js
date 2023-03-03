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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils";

export default class ToolSettingsUpdate extends LitElement {

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
            study: {
                type: Object,
            },
            toolSettings: {
                type: Object,
            },
            toolName: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    // --- PRIVATE METHODS ---
    #init() {
        this._toolSettings = {}; // Local copy for tool settings
    }

    // TODO 20230210 Vero:
    //  1. Move to utils-new.js.
    //  2. Repeated in opencga-update
    //  3. Rename first parameter and function name
    #getResourceName(name, type) {
        const words = name
            .toLowerCase()
            .split("_");

        switch (type) {
            case "event":
                return words
                    .reduce((result, word) => result + UtilsNew.capitalize(word));
            case "label":
                return words
                    .map(word => UtilsNew.capitalize(word))
                    .join(" ");
        }
    }

    #initOriginalObjects() {
        // The original settings and study are maintained. A copy is used for previewing the ongoing changes in json
        this._study = UtilsNew.objectClone(this.study);
        this._toolSettings = UtilsNew.objectClone(this.toolSettings);
        this.updatedFields = {};
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    // --- UPDATE ---
    update(changedProperties) {
        if (changedProperties.has("study") || changedProperties.has("toolSettings")) {
            this.componentObserver();
        }
        super.update(changedProperties);
    }

    // --- OBSERVERS ---
    componentObserver() {
        if (this.study && this.toolSettings && this.opencgaSession) {
            this.#initOriginalObjects();
        }
    }

    // --- EVENTS ---
    onFieldChange(e, field) {
        // FIXME: switch case when json-editor returns param.
        const param = field || e.detail.param;
        // The json has been modified, so we need to:
        // 1. To update the local object settings where we store the settings modifications
        if (e.detail.value?.json) {
            this._toolSettings = UtilsNew.objectClone(e.detail.value?.json);
            this._study.attributes[SETTINGS_NAME].settings[this.toolName] = this._toolSettings;
        }
        // if (param === "fqn") {
        //     // FIXME this should not be necessary, we need to re-think the data-form.data object
        //     this._study.fqn = "";
        //     this._listStudies = e.detail.value?.length > 0 ? e.detail.value?.split(",") : [];
        // }
        if (param === "default") {
            this._toolSettings = UtilsNew.objectClone(this.opencgaSession.ivaDefaultSettings.settings[this.toolName]);
            this._study.attributes[SETTINGS_NAME].settings[this.toolName] = this._toolSettings;
        }

        // To notify that the json has been modified
        // CAUTION 20230208 Vero: the toolSettings json has been updated
        LitUtils.dispatchCustomEvent(this, "studyToolSettingsChange", null, {
            _toolSettings: this._toolSettings
        });

        // Shallow copy just for refreshing the memory direction of this._study
        this._study = {...this._study};

        this.requestUpdate();
    }

    // --- RENDER ---
    render() {

        return html `
            <div class="card" id="">
                <!-- Header -->
                <div class="card-header" id="">
                    <button class="btn btn-warning btn-sm" type="button" @click="${e => this.onFieldChange(e, "default")}">
                        DEFAULT SETTINGS
                    </button>
                </div>
                <!-- Content -->
                <div class="card-body" id="">
                    <json-editor
                        .data="${this._toolSettings}">
                    </json-editor>
                </div>

            </div>
        `;


        /*
        return html `
            <data-form
                .data="${this._study}"
                .config="${this._config}"
                .updateParams="${this.updatedFields}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
        */
    }

    // --- DEFAULT CONFIG ---
    getDefaultConfig() {
        return {
            id: "",
            title: "",
            icon: "",
            display: {
                width: 10,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                // defaultLayout: "vertical",
                // buttonsVisible: true,
                // buttonsLayout: "top",
                // buttonOkDisabled: () => this._listStudies?.length === 0
            },
            // buttons: {
            //     clearText: "Discard Changes",
            //     okText: "Update",
            // },
            sections: [
                {
                    title: "Tool Configuration",
                    display: {
                        // titleHeader: "",
                        // titleStyle: "",
                        descriptionClassName: "help-block",
                        // descriptionStyle: "",
                        // visible: () =>
                    },
                    elements: [
                        {
                            title: "Load default settings",
                            field: "default",
                            type: "custom",
                            display: {
                                render: () => {
                                    return html `
                                        <button class="btn btn-warning btn-sm" type="button" @click="${e => this.onFieldChange(e, "default")}">
                                            DEFAULT SETTINGS
                                        </button>
                                    `;
                                },
                                help: {
                                    text: "Warning: This will discard any change made!"
                                }
                            },
                        },
                        {
                            title: "You can edit the options in the JSON Editor",
                            field: `attributes.${SETTINGS_NAME}.settings.${this.toolName}`,
                            type: "json-editor",
                            display: {
                                defaultLayout: "vertical",
                                visible: () => this.toolName !== "ALL",
                            }
                        },
                    ],
                },
            ]
        };
    }

}

customElements.define("tool-settings-update", ToolSettingsUpdate);
