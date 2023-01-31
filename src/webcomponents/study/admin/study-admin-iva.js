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
import "../../study/admin/study-settings-update.js";
import LitUtils from "../../commons/utils/lit-utils";

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
                type: String
            },
            study: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("studyId") || changedProperties.has("opencgaSession")) {
            this.studyIdObserver();
        }
        super.update(changedProperties);
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    studyIdObserver() {
        /*
        for (const project of this.opencgaSession?.projects) {
            for (const study of project.studies) {
                if (study.id === this.studyId || study.fqn === this.studyId) {
                    this.study = study;
                    break;
                }
            }
        }
        */
        if (this.studyId && this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.studies()
                .info(this.studyId)
                .then(response => {
                    this.study = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.study = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "studySearch", this.study, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this.study = {};
        }
    }

    render() {
        const activeMenuItem = "sample";
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
            id: "",
            name: "IVA Settings",
            logo: "",
            icon: "",
            visibility: "private", // public | private | none
            menu: [
                {
                    id: "config",
                    name: "Configuration",
                    description: "",
                    icon: "",
                    featured: "", // true | false
                    visibility: "private",
                    category: true,
                    submenu: [
                        {
                            id: "sample",
                            name: "Sample browser settings",
                            title: "Sample Browser settings",
                            icon: "fas fa-vial",
                            visibility: "private",
                            render: (opencgaSession, study) => html `
                                <study-settings-update
                                    .opencgaSession="${opencgaSession}"
                                    .study="${study}"
                                    .item="${"SAMPLE"}">
                                </study-settings-update>
                            `,
                        },
                    ],
                },
            ],
        };
    }


}
customElements.define("study-admin-iva", StudyAdminIva);
