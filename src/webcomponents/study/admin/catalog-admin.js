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

import {LitElement, html} from "lit";

import "./study-admin-sample.js";
import "./study-admin-individual.js";
import "./study-admin-family.js";
import "./study-admin-cohort.js";
import "./study-admin-configuration.js";
import LitUtils from "../../commons/utils/lit-utils";
import "../../commons/layouts/custom-vertical-navbar.js";

export default class CatalogAdmin extends LitElement {

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
        const activeMenuItem = "Sample";
        return html`
            <tool-header class="page-title-no-margin"  title="${this._config.name}" icon="${this._config.icon}"></tool-header>
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
            name: "Catalog Management",
            logo: "",
            icon: "",
            visibility: "private", // public | private | none
            // title: "Study",
            // sections: [
            menu: [
                {
                    id: "manage",
                    name: "Manage",
                    description: "",
                    icon: "",
                    featured: "", // true | false
                    visibility: "private",
                    submenu: [
                        // {
                        //     id: "Dashboard",
                        //     name: "Dashboard",
                        //     visibility: "none",
                        //     icon: "fas fa-tachometer-alt",
                        //     // QUESTION: Which one: (a) or (b)
                        //     // question: (a)
                        //     // display: {
                        //     //     contentClass: "",
                        //     //     contentStyle: ""
                        //     //     defaultLayout: "vertical",
                        //     //     render: () => html`
                        //     //         <under-construction>
                        //     //             .title="Study dashboard"
                        //     //         </under-construction>`,
                        //     // },
                        //     // question: (b)
                        //     render: () => html`
                        //         <under-construction>
                        //             .title="Study dashboard"
                        //         </under-construction>`,
                        // },
                        {
                            id: "Sample",
                            name: "Sample",
                            icon: "fas fa-vial",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <study-admin-sample
                                        .opencgaSession="${opencgaSession}"
                                        .study="${study}">
                                </study-admin-sample>`,
                        },
                        {
                            id: "Individual",
                            name: "Individual",
                            icon: "fas fa-user",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <study-admin-individual
                                        .opencgaSession="${opencgaSession}"
                                        .study="${study}">
                                </study-admin-individual>`,
                        },
                        {
                            id: "Family",
                            name: "Family",
                            icon: "fas fa-users",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <study-admin-family
                                        .opencgaSession="${opencgaSession}"
                                        .study="${study}">
                                </study-admin-family>`,
                        },
                        {
                            id: "Cohort",
                            name: "Cohort",
                            icon: "fas fa-bezier-curve",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <study-admin-cohort
                                        .opencgaSession="${opencgaSession}"
                                        .study="${study}">
                                </study-admin-cohort>`,
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("catalog-admin", CatalogAdmin);
