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
import Types from "./types";
import UtilsNew from "../../core/utils-new";
import NotificationUtils from "./utils/notification-utils";
import LitUtils from "./utils/lit-utils";

export default class ToolSettingsUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolSettings: {
                type: Object,
            },
            // settings: {
            //     type: Object,
            // },
            toolLabel: {
                type: String,
            },
            ivaSettingsName: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.toolSettings = {};
        this.ivaSettingsName = "";
        this.toolLabel = "";

        this.isLoading = false;
        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };
        this._toolSettings = {}; // Local copy for mai
        this.config = this.getDefaultConfig();

    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    #getResourceName(type) {
        this.toolLabel = this.tool
            .toLowerCase()
            .split("_");

        switch (type) {
            case "event":
                return this.toolLabel
                    .reduce((result, word) => result + UtilsNew.capitalize(word));
            case "label":
                return this.toolLabel
                    .map(word => UtilsNew.capitalize(word))
                    .join(" ");
        }
    }

    update(changedProperties) {
        if (changedProperties.has("toolSettings")) {
            this.initOriginalObjects();
        }
        super.update(changedProperties);
    }


    initOriginalObjects() {
        // We maintain the original settings and use a copy for
        this._toolSettings = UtilsNew.objectClone(this.toolSettings);
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
            body: this._toolSettings,
        };
    }
    // --- OBSERVERS ---

    // --- EVENTS ---
    onFieldChange(e) {
        // The json has been modified, so we need to:
        // 1. To update the local object settings where we store the settings modifications
        this._toolSettings = {...e.detail.value.json};
        // 2. To update the form this.toolParams
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
            body: this._toolSettings
        };
        // To notify that the json has been modified
        // CAUTION 20230208 Vero: distinguish events:
        //  - Update of the json
        //  - Update in opencga
        LitUtils.dispatchCustomEvent(this, "studyToolSettingsUpdate", null, {
            _toolSettings: this._toolSettings,
        }, null, {bubbles: true, composed: true});

        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard changes",
            message: "Are you sure you want to discard the changes made?",
            ok: () => {
                this.initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const toolName = this.#getResourceName("label");
        const params = {
            includeResult: true,
        };
        const otherAttributes = UtilsNew.objectCloneExclude(this.opencgaSession.study.attributes, [this.ivaSettingsName, `${this.ivaSettingsName}_BACKUP`]);
        const otherToolsSettings = UtilsNew.objectCloneExclude(this.opencgaSession.study.attributes[this.ivaSettingsName].settings, [this.tool]);

        const updateParams = {
            attributes: {
                ...otherAttributes,
                [this.ivaSettingsName]: {
                    userId: this.opencgaSession.user.id,
                    // FIXME: it will store a '*-dev' version
                    // version: this.version.split("-")[0],
                    date: UtilsNew.getDatetime(), // update date
                    settings: {
                        ...otherToolsSettings,
                        [this.tool]: UtilsNew.objectClone(this._toolSettings),
                    }
                },
                [this.ivaSettingsName + "_BACKUP"]: UtilsNew.objectClone(this.opencgaSession.study.attributes[this.ivaSettingsName]),
            }
        };

        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.studies()
            .update(this.opencgaSession.study.fqn, updateParams, params)
            .then(response => {
                // 1. Update the attributes property
                const study = UtilsNew.objectClone(response.responses[0].results[0]);
                // 2. Dispatch notification
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `${toolName} Settings Update`,
                    message: `${toolName} settings updated correctly`,
                });
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest", study.fqn);
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    // --- RENDER ---
    render() {
        return html `
            <data-form
                .data="${this.toolParams}"
                .config="${this.config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            id: "",
            title: "",
            icon: "",
            display: {
                width: 10,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                defaultLayout: "vertical",
                buttonsVisible: true,
                buttonsLayout: "top"
            },
            buttons: {
                clearText: "Discard Changes",
                okText: "Update",
            },
            sections: [
                {
                    title: "Study",
                    description: "TODO THINK ABOUT A STUDY DESCRIPTION",
                    display: {
                        // titleHeader: "",
                        // titleStyle: "",
                        descriptionClassName: "help-block",
                        // descriptionStyle: "",
                        // visible: () =>
                    },
                    elements: [
                        {
                            title: "Study",
                            type: "custom",
                            required: true,
                            // FIXME 20230208 Vero: look for another approach if this form element is always disabled.
                            display: {
                                render: () => html `
                                    <catalog-search-autocomplete
                                        .value="${this.opencgaSession.study.fqn}"
                                        .resource="${"STUDY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false, disabled: !!this.opencgaSession.study.fqn}}"
                                        @filterChange="${e => this.onFieldChange(e, "study")}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        }
                    ],
                },
                {
                    // title: "Configuration Parameters",
                    id: "settings-json",
                    title: "Settings",
                    description: "TODO THINK ABOUT A DESCRIPTION",
                    display: {
                        // titleHeader: "",
                        // titleStyle: "",
                        descriptionClassName: "help-block",
                        // descriptionStyle: "",
                        // visible: () =>
                    },
                    elements: [
                        {
                            field: "body",
                            type: "json-editor",
                        },
                    ],
                },
            ]
        });
    }

}

customElements.define("tool-settings-update", ToolSettingsUpdate);

