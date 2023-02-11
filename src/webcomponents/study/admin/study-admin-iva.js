/**
 * Copyright 2015-2023 OpenCB *
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

import {LitElement, html} from "lit";

import "../../commons/layouts/custom-vertical-navbar.js";
import "./study-settings-detail.js";
import LitUtils from "../../commons/utils/lit-utils";
import NotificationUtils from "../../commons/utils/notification-utils";

export default class StudyAdminIva extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            studyId: {
                type: String,
            },
            study: {
                type: Object,
            },
            settings: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {}

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("studyId")) {
            this.studyIdObserver();
        }
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    /* -- OBSERVER METHODS -- */
    opencgaSessionObserver() {
        this._config = this.getDefaultConfig();
    }

    studyIdObserver() {
        if (this.studyId && this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.studies()
                .info(this.studyId)
                .then(response => {
                    this.study = response.responses[0].results[0];
                })
                .catch(reason => {
                    error = reason;
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "studySearch", this.study, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    settingsObserver() {}

    /* -- RENDER METHOD  -- */
    render() {
        const activeMenuItem = "individual";
        return html`
            <custom-vertical-navbar
                .study="${this.opencgaSession.study}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                .activeMenuItem="${activeMenuItem}">
            </custom-vertical-navbar>`;
    }

    getDefaultConfig() {
        return {
            name: "IVA Configuration",
            logo: "",
            icon: "fas fa-sliders-h",
            visibility: "private", // public | private | none
            menu: Object.entries(this.settings)
                // module: catalog | user | about
                // moduleSettings: CATALOG_SETTINGS | USER_SETTINGS | ABOUT_SETTINGS
                .map(([module, moduleSettings]) => {
                    return {
                        id: module,
                        name: module.toUpperCase(),
                        visibility: "private",
                        category: true,
                        submenu: Object.entries(moduleSettings)
                            .map(([toolName, toolSettings]) => {
                                const match = toolName.match(/^(.*)_[^_]*$/);
                                const name = (match ? match[1] : toolName);
                                return {
                                    id: name.toLowerCase(),
                                    name: `${name}`,
                                    icon: "fa-solid fa-square",
                                    visibility: "private",
                                    render: (opencgaSession, study) => {
                                        const locus = {
                                            toolId: toolName,
                                            module: "catalog",
                                        };
                                        return html `
                                            <study-settings-detail
                                                .opencgaSession="${opencgaSession}"
                                                .study="${study}"
                                                .toolSettings="${toolSettings}"
                                                .locus="${locus}">
                                            </study-settings-detail>
                                        `;
                                    }
                                };
                            }),
                    };
                }),
            // [
            // {
            //     id: "catalog",
            //     name: "CATALOG",
            //     description: "",
            //     icon: "",
            //     featured: "", // true | false
            //     visibility: "private",
            //     category: true,
            //     submenu: Object.entries(this.settings.catalog)
            //         .map(([toolId, toolSettings]) => {
            //             // const name = UtilsNew.capitalize(toolId.split("_")[0]);
            //             const match = toolId.match(/^(.*)_[^_]*$/);
            //             const name = (match ? match[1] : toolId);
            //             return {
            //                 id: name.toLowerCase(),
            //                 name: `${name} Browser`,
            //                 icon: "fa-solid fa-square",
            //                 visibility: "private",
            //                 render: (opencgaSession, study) => {
            //                     const locus = {
            //                         toolId: toolId,
            //                         module: "catalog",
            //                     };
            //                     return html `
            //                         <study-settings-detail
            //                             .opencgaSession="${opencgaSession}"
            //                             .study="${study}"
            //                             .toolSettings="${toolSettings}"
            //                             .locus="${locus}">
            //                         </study-settings-detail>
            //                     `;
            //                 }
            //             };
            //         }),
            // },
            // {
            //     id: "user",
            //     name: "USER PROFILE",
            //     description: "",
            //     icon: "",
            //     featured: "", // true | false
            //     visibility: "private",
            //     category: true,
            //     submenu: Object.entries(this.settings.user)
            //         .map(([toolId, toolSettings]) => {
            //             // const name = UtilsNew.capitalize(toolId.split("_")[0]);
            //             const match = toolId.match(/^(.*)_[^_]*$/);
            //             const name = (match ? match[1] : toolId);
            //             return {
            //                 id: name.toLowerCase(),
            //                 name: `${name}`,
            //                 icon: "fa-solid fa-square",
            //                 visibility: "private",
            //                 render: (opencgaSession, study) => {
            //                     const locus = {
            //                         toolId: toolId,
            //                         module: "user",
            //                     };
            //                     return html `
            //                         <study-settings-detail
            //                             .opencgaSession="${opencgaSession}"
            //                             .study="${study}"
            //                             .toolSettings="${toolSettings}"
            //                             .locus="${locus}">
            //                         </study-settings-detail>
            //                     `;
            //                 }
            //             };
            //         }),
            // },
            // {
            //     id: "about",
            //     name: "ABOUT",
            //     description: "",
            //     icon: "",
            //     featured: "",
            //     visibility: "private",
            //     category: true,
            //     submenu: this.settings.pages
            //         .map(([toolId, toolSettings]) => {
            //             // const name = UtilsNew.capitalize(toolId.split("_")[0]);
            //             const match = toolId.match(/^(.*)_[^_]*$/);
            //             const name = (match ? match[1] : toolId);
            //             return {
            //                 id: name.toLowerCase(),
            //                 name: `${name}`,
            //                 icon: "fa-solid fa-square",
            //                 visibility: "private",
            //                 render: (opencgaSession, study) => {
            //                     const locus = {
            //                         toolId: toolId,
            //                         module: "about",
            //                     };
            //                     return html `
            //                         <study-settings-detail
            //                             .opencgaSession="${opencgaSession}"
            //                             .study="${study}"
            //                             .toolSettings="${toolSettings}"
            //                             .locus="${locus}">
            //                         </study-settings-detail>
            //                     `;
            //                 }
            //             };
            //         }),
            // },
            // ],
        };
    }


}
customElements.define("study-admin-iva", StudyAdminIva);
