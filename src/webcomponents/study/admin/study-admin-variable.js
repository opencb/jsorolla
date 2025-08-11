/**
 * Copyright 2015-2021 OpenCB
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
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import DetailTabs from "../../commons/view/detail-tabs.js";
import {guardPage} from "../../commons/html-utils.js";
import "../permission/permission-browser-grid.js";
import "../variable-set/variable-set-create.js";
import "../variable-set/variable-set-view.js";

export default class StudyAdminVariable extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            // study: {
            //     type: Object
            // },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    render() {
        if (!OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
            return guardPage("No permission to view this page");
        }

        return html`
            <div style="margin: 20px">
                <detail-tabs
                    .data="${this.opencgaSession.study}"
                    .config="${this._config}"
                    .mode=${DetailTabs.PILLS_MODE}
                    .opencgaSession="${this.opencgaSession}">
                </detail-tabs>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            items: [
                {
                    id: "view-variable",
                    name: "View Variable Set",
                    icon: "fa fa-table icon-padding",
                    active: true,
                    render: (study, active, opencgaSession) => {
                        return html`
                            <div class="row">
                                <div class="col-md-6 my-2">
                                    <variable-set-view
                                        .variableSets="${opencgaSession.study.variableSets}"
                                        .opencgaSession="${opencgaSession}">
                                    </variable-set-view>
                                </div>
                            </div>`;
                    }
                },
                {
                    id: "create-variable",
                    name: "Create Variable Set",
                    icon: "fas fa-clipboard-list",
                    active: false,
                    render: (study, active, opencgaSession) => {
                        return html`
                            <div class="row">
                                <div class="col-md-6 mx-3 my-4">
                                    <variable-set-create
                                        .opencgaSession="${opencgaSession}">
                                    </variable-set-create>
                                </div>
                            </div>`;
                    }
                }
            ]
        };
    }

}

customElements.define("study-admin-variable", StudyAdminVariable);
