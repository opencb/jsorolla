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
import UtilsNew from "../../../core/utils-new.js";
import NotificationUtils from "../../commons/utils/notification-utils";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils";
import LitUtils from "../../commons/utils/lit-utils";
import "../../commons/tool-settings-editor.js";


export default class StudySettingsDetail extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            study: {
                type: Object,
            },
            toolSettings: {
                type: Object,
            },
            toolName: {
                type: String,
            },
        };
    }

    #initOriginalObjects() {
        // The original settings and study are maintained. A copy is used for previewing the ongoing changes in json
        this._study = UtilsNew.objectClone(this.opencgaSession.study);
        this._toolSettings = UtilsNew.objectClone(this.toolSettings);
        this._listStudies = this.opencgaSession?.study?.fqn ? [this.opencgaSession.study.fqn] : [];
        this.updatedFields = {};
        // Read Projects and Study to prepare the allowed values in the Study select menu
        this.allowedValues = [];
        if (this.opencgaSession?.projects) {
            // Prepare allowedValues for the select options menu
            for (const project of this.opencgaSession.projects) {
                const fields = [];
                for (const study of project.studies) {
                    fields.push({id: study.fqn, name: study.fqn, disabled: study.fqn === this.opencgaSession.study.fqn});
                }
                this.allowedValues.push({name: `Project '${project.name}'`, fields: fields});
            }
        }
        this._config = {
            ...this.getDefaultConfig(),
        };
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }
    // --- LIT LIFE CYCLE
    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("study")) {
            this.studyObserver();
        }
        if (changedProperties.has("toolSettings")) {
            this.toolSettingsObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        super.update(changedProperties);
    }

    // --- OBSERVERS ---
    opencgaSessionObserver() {
        // Read Projects and Study to prepare the select menu
        this.#initOriginalObjects();
        /*
        this.allowedValues = [];
        if (this.opencgaSession?.projects) {
            // Prepare allowedValues for the select options menu
            for (const project of this.opencgaSession.projects) {
                const fields = [];
                for (const study of project.studies) {
                    fields.push({id: study.fqn, name: study.fqn, disabled: study.fqn === this.opencgaSession.study.fqn});
                }
                this.allowedValues.push({name: `Project '${project.name}'`, fields: fields});
            }

            // Refresh configuration object to read new this.allowedValues array.
            this._config = {
                ...this.getDefaultConfig(),
                // ...this.config,
            };
        }
         */
    }

    studyObserver() {
        this._study = UtilsNew.objectClone(this.study);
    }

    toolSettingsObserver() {
        this._toolSettings = UtilsNew.objectClone(this.toolSettings);
    }

    // --- EVENTS ---
    onFieldChange(e, field) {
        const param = field || e.detail.param;
        // 1. Update the list of studies
        if (param === "fqn") {
            this._study.fqn = "";
            this._listStudies = e.detail.value?.length > 0 ? e.detail.value?.split(",") : [];
        }
        if (e.detail.value?.json) {
            this._toolSettings = UtilsNew.objectClone(e.detail.value?.json);
            this._study.attributes[SETTINGS_NAME].settings[this.toolName] = this._toolSettings;
        }
        // Shallow copy just for refreshing the memory direction of this._study
        this._study = {...this._study};
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard changes",
            message: "Are you sure you want to discard the changes made?",
            ok: () => {
                this.#initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit(e, field) {
        // 1. Prepare query params
        const params = {
            includeResult: true,
        };
        // 2. Query
        this.#setLoading(true);
        this._listStudies.forEach(studyId => {
            // 2.1. Get new study tool settings
            // const updateParams = OpencgaCatalogUtils.getNewToolIVASettings(this.opencgaSession, this.toolName, this._toolSettings);
            let updateParams;
            switch (field) {
                case "default":
                    updateParams = OpencgaCatalogUtils.getDefaultIVASettings(this.opencgaSession, studyId);
                    break;
                case "backup":
                    updateParams = OpencgaCatalogUtils.getDefaultIVASettings(this.opencgaSession, studyId);
                    break;
                case "tool":
                    updateParams = OpencgaCatalogUtils.getNewToolIVASettings(this.opencgaSession, this.toolName, this._toolSettings);
                    break;
            }
            // 2.2 Query
            this.opencgaSession.opencgaClient.studies()
                // .update(this.opencgaSession.study.fqn, updateParams, params)
                .update(studyId, updateParams, params)
                .then(response => {
                    // 1. Dispatch success notification
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                        title: `${this.option} Settings Update`,
                        message: `${this.option} settings updated correctly`,
                    });
                    // 2. Dispatch study update event
                    LitUtils.dispatchCustomEvent(this, "studyUpdateRequest",
                        UtilsNew.objectClone(response.responses[0].results[0].fqn)
                    );
                })
                .catch(reason => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                })
                .finally(() => {
                    this.#setLoading(false);
                });
        });
    }

    // --- RENDER ---
    render() {
        return html`
            <data-form
                .data="${this._study}"
                .config="${this._config}"
                .updateParams="${this.updatedFields}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSubmit(e, "tool")}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "",
            display: {
                width: 10,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                buttonsVisible: true,
                buttonsLayout: "top",
                buttonOkDisabled: () => this._listStudies?.length === 0
            },
            buttons: {
                clearText: "Discard Changes",
                okText: "Update",
            },
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
                            title: "Study",
                            field: "fqn",
                            type: "select",
                            multiple: true,
                            all: true,
                            required: true,
                            defaultValue: `${this._study.fqn}`,
                            allowedValues: this.allowedValues,
                            display: {
                                placeholder: "Select study or studies..."
                            },
                        },
                    ],
                },
                {
                    title: "Settings",
                    type: "tabs",
                    display: {
                        // titleHeader: "",
                        // titleStyle: "",
                        descriptionClassName: "help-block",
                        // descriptionStyle: "",
                        // visible: () =>
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: study => {
                                    return html `
                                        <tool-settings-editor
                                            .toolSettings="${this._toolSettings}"
                                            .toolName="${this.toolName}"
                                            .study="${study}"
                                            .opencgaSession="${this.opencgaSession}"
                                            @toolSettingsChange="${e => this.onFieldChange(e)}">
                                        </tool-settings-editor>
                                    `;
                                },
                            },
                        },
                    ],
                },
            ],
        };
    }


    // --- DEFAULT CONFIG ---
    getDefaultConfigWorking() {
        return {
            display: {
                align: "center",
            },
            items: [
                // 1. Component responsible for configuring the IVA settings
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
                        return html`
                            <tool-settings-update
                                    .study="${this.study}"
                                    .toolSettings="${this.toolSettings}"
                                    .toolName="${this.toolName}"
                                    .opencgaSession="${this.opencgaSession}"
                                    @studyToolSettingsUpdate="${e => this.onStudyToolSettingsUpdate(e)}">
                            </tool-settings-update>
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
                                        .tool="${this.toolName}"
                                        .highlightPreview="${this.highlightPreview}">
                                </tool-settings-preview>
                            `;
                        }
                    },
                },
            ],
        };
    }

    // CAUTION 20231102 Vero: Planned to change the structure of the elements. Remove when finished.
    /*
    getDefaultConfigOld() {
        return {
            id: "",
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
                // {
                //     title: "Study Filter",
                //     elements: [
                //         {
                //             title: "Study",
                //             type: "custom",
                //             required: true,
                //             display: {
                //                 render: toolParams => html`
                //                     <catalog-search-autocomplete
                //                         .value="${toolParams?.study}"
                //                         .resource="${"STUDY"}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         .config="${{multiple: false, disabled: !!this.study}}"
                //                         @filterChange="${e => this.onFieldChange(e, "study")}">
                //                     </catalog-search-autocomplete>
                //                 `,
                //             },
                //         }
                //     ],
                // },
                {
                    // title: "Configuration Parameters",
                    id: "settings-json",
                    title: "Settings",
                    description: "TODO THINK ABOUT A DESCRIPTION",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                        descriptionClassName: "help-block",
                        descriptionStyle: "margin: 0px 10px",
                        // visible: () => !!this.config?.genotype?.type
                    },
                    elements: [
                        {
                            field: "body",
                            type: "json-editor",
                            display: {
                                // rows: 25,
                                // defaultLayout: "vertical"
                            }
                        },
                    ],
                },
                {
                    // title: "Configuration Parameters",
                    id: "settings-preview",
                    title: "Preview",
                    description: "TODO THINK ABOUT A DESCRIPTION",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                        descriptionClassName: "help-block",
                        descriptionStyle: "margin: 0px 10px",
                        // visible: () => !!this.config?.genotype?.type
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                defaultLayout: "vertical",
                                render: () => {
                                    return html `
                                        <!-- 2. Render Preview -->
                                        <div>
                                            <component-settings-previewer
                                            .opencgaSession="${this.opencgaSession}"
                                            .settings="${this.toolParams.body}">
                                            </component-settings-previewer>
                                        </div>
                                    `;
                                }
                            }
                        },
                    ],
                },
            ],
        };
    }
     */

}

customElements.define("study-settings-detail", StudySettingsDetail);

