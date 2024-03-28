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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import GridCommons from "../../commons/grid-commons.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import {guardPage, construction} from "../../commons/html-utils.js";
import "../permission/permission-browser-grid.js";

export default class StudyAdminPermissions extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            studyId: {
                type: String
            },
            study: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    getDefaultConfig() {
        return {
            items: [
                {
                    id: "permissions",
                    name: "Study Permissions",
                    icon: "fa fa-table icon-padding",
                    active: true,
                    render: (study, active, opencgaSession) => {
                        return html`
                            <permission-browser-view
                                .study=${study}
                                .active=${active}
                                .opencgaSession=${opencgaSession}>
                            </permission-browser-view>`;
                    }
                },
                {
                    id: "permissionRules",
                    name: "Permission Rules",
                    icon: "fas fa-clipboard-list",
                    active: false,
                    render: () => {
                        return construction;
                    }
                }
            ]
        };
    }

    render() {

        if (!OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
            return guardPage("No permission to view this page");
        }

        return html`
            <div style="margin: 25px 40px">
                <detail-tabs
                    .data=${this.study}
                    .mode=${"pills"}
                    .config="${this._config}"
                    .opencgaSession="${this.opencgaSession}">
                </detail-tabs>
            </div>
            `;
    }

}

customElements.define("study-admin-permissions", StudyAdminPermissions);
