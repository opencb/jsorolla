/**
 * Copyright 2015-2019 OpenCB
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

import { html, LitElement } from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import GridCommons from "../commons/grid-commons.js";
import OpencgaCatalogUtils from "../../clients/opencga/opencga-catalog-utils.js"
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

        this._config = { ...this.getDefaultConfig(), ...this.config };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        // console.log("Rendering permission table connectedCallback:", document.querySelector(`#${this.gridId}`))
    }

    // Note: WE NEED this function because we are rendering using JQuery not lit-element API
    // Note: Other solution just if the firstUpdated not work, updateComplete ()
    // This is executed when all updates are finished including the render function that contains the rendered table
    // More info about updateComplete: https://lit-element.polymer-project.org/guide/lifecycle#updatecomplete
    //
    // firstUpdated(changedProperties) {
    //     if (changedProperties.has("study")) {
    //         this.studyObserver();
    //     }
    //     // console.log("Rendering permission table firstUpdated:", document.querySelector(`#${this.gridId}`))
    // }

    update(changedProperties) {
        if (changedProperties.has("studyId")) {
            for (const project of this.opencgaSession.projects) {
                for (const study of project.studies) {
                    if (study.id === this.studyId || study.fqn === this.studyId) {
                        this.study = { ...study };
                        break;
                    }
                }
            }
        }

        if (changedProperties.has("study")) {
            this.studyObserver();
        }

        super.update(changedProperties);
    }

    studyObserver() {

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
                        return html`
                            <h1>Permission rules Component</h1>`;
                    }
                }
            ]
        };
    }

    render() {

        if (!OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
            return html`
            <div class="guard-page">
                <i class="fas fa-lock fa-5x"></i>
                <h3>No permission to view this page</h3>
            </div>`
        }

        return html`
            <div style="margin: 20px">
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
