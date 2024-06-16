/**
 * Copyright 2015-2024 OpenCB *
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
 *
 */

import {LitElement, html} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import "./user-admin-grid.js";

export default class UserAdminBrowser extends LitElement {

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
            organization: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            // QUESTION: pending to decide if we allow browser settings here.
            settings: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "user-admin-browser";
        this.users = [];
        this._config = this.getDefaultConfig();
        this.isLoading = false;
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.settings,
        };
    }

    studyIdObserver() {
        if (this.studyId && this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.studies()
                .info(this.studyId)
                .then(response => {
                    this._study = UtilsNew.objectClone(response.responses[0].results[0]);
                })
                .catch(reason => {
                    this._study = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "studyChange", this.study, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this._study = {};
        }
    }

    renderFilterGraphics() {
        if (this._config.showGraphicFilters) {
            return html `
            <!--<graphic-filter></graphic-filter>-->
        `;
        }
    }

    render() {
        // if (Object.keys(this.users).length === 0) {
        //     return html `
        //         <div class="alert alert-info">
        //             <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
        //             This organization does not have users yet.
        //             Please create some users.
        //         </div>
        //     `;
        // }
        // .users="${this.users}"
        return html `
            <!-- 1. Render filter graphics if enabled -->
            ${this.renderFilterGraphics()}
            <!-- 2. Render grid -->
            <user-admin-grid
                .toolId="${this.COMPONENT_ID}"
                .organization="${this.organization}"
                .opencgaSession="${this.opencgaSession}"
                .active="${true}">
            </user-admin-grid>
        `;
    }

    getDefaultConfig() {
        return {
            showGraphicFilters: false,
        };
    }

}

customElements.define("user-admin-browser", UserAdminBrowser);
