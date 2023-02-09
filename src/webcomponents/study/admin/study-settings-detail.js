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
import "../../commons/tool-settings-update.js";
import "../../commons/tool-settings-preview.js";

export default class StudySettingsDetail extends LitElement {

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
                type: Object,
            },
            study: {
                type: Object,
            },
            toolSettings: {
                type: Object,
            },
            tool: {
                type: String,
            },
            ivaSettingsName: {
                type: String,
            },
            config: {
                type: Object,
            },

        };
    }

    #init() {
        this.data = null;
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
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
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    toolSettingsObserver() {
        this._toolSettings = UtilsNew.objectClone(this.toolSettings);
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    // --- EVENTS ---
    onStudyToolSettingsUpdate(e) {
        this._toolSettings = UtilsNew.objectClone(e.detail._toolSettings);
        this.highlightPreview = true;
        this.requestUpdate();
    }

    // --- RENDER ---
    render() {
        return html `
            <detail-tabs
                .data="${this._toolSettings}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
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
                        return html `
                            <tool-settings-update
                                .toolSettings="${this.toolSettings}"
                                .tool="${this.tool}"
                                .ivaSettingsName="${this.ivaSettingsName}"
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
                    render: () => {
                        return html `
                            <tool-settings-preview
                                .opencgaSession="${this.opencgaSession}"
                                .settings="${this._toolSettings}"
                                .tool="${this.tool}"
                                .highlightPreview="${this.highlightPreview}">
                            </tool-settings-preview>
                        `;
                    },
                },
            ],
        };
    }

    /*
getDefaultConfigOld() {
    return Types.dataFormConfig({
        id: "interpreter-grid-config",
        title: "",
        icon: "",
        type: "tabs",
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
    });
}
*/

}

customElements.define("study-settings-detail", StudySettingsDetail);

