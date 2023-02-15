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

    #init() {
        this.menuStructure = {
            variant: ["Variant", Object.keys(INTERPRETER_SETTINGS)],
            catalog: ["Catalog", Object.keys(CATALOG_SETTINGS)],
            user: ["User", Object.keys(USER_SETTINGS)],
        };
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("studyId")) {
            this.studyIdObserver();
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

    // --- RENDER METHOD  ---
    render() {
        return html`
            <custom-vertical-navbar
                .study="${this.opencgaSession.study}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                .activeMenuItem="${"individual"}">
            </custom-vertical-navbar>
        `;
    }

    getDefaultConfig() {
        return {
            name: "IVA Configuration",
            logo: "",
            icon: "fas fa-sliders-h",
            visibility: "private", // public | private | none
            menu: Object.entries(this.menuStructure)
                .map(([menuKey, [header, submenuKeys]]) => ({
                    id: menuKey,
                    name: header,
                    category: true,
                    visibility: "private",
                    submenu: submenuKeys.map(toolName => {
                        const toolSettings = this.settings[toolName];

                        const match = toolName.match(/^(.*)_[^_]*$/);
                        const name = (match ? match[1] : toolName);
                        return {
                            id: name.toLowerCase(),
                            name: name.replace(/_/g, " "),
                            icon: "fa-solid fa-square",
                            visibility: "private",
                            render: (opencgaSession, study) => {
                                return html `
                                        <study-settings-detail
                                            .opencgaSession="${opencgaSession}"
                                            .study="${study}"
                                            .toolSettings="${toolSettings}"
                                            .toolName="${toolName}">
                                        </study-settings-detail>
                                    `;
                            }
                        };
                    })
                }))
        };
    }

}

customElements.define("study-admin-iva", StudyAdminIva);
