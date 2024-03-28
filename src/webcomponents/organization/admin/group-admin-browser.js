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
 * The group admin browser component has two key responsibilities:
 * 1. Retrieving groups per study
 * 2. Rendering the graphic filters if enabled and grid.
 * Accepted properties are:
 * - A single study
 * - An organization with multiple projects/studies
 */

import {LitElement, html} from "lit";
import LitUtils from "../../commons/utils/lit-utils";
import UtilsNew from "../../../core/utils-new";
import "./group-admin-grid.js";

export default class GroupAdminBrowser extends LitElement {

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
            organizationId: {
                type: String,
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
        this.COMPONENT_ID = "groups-admin-browser";

        this._study = {};
        this._groups = [];
        this._config = this.getDefaultConfig();
        this.isLoading = false;
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    #getGroups(isSingleStudy) {
        // FIXME: refactor
        // If the component is used for managing the groups of the whole organization
        this._groups = [];
        if (isSingleStudy) {
            this._study.groups?.forEach(group => {
                let protectedGroup = false;
                if (group.id === "@admins" || group.id === "@members") {
                    protectedGroup = true;
                }
                const newGroup = {
                    studyId: this._study.id,
                    groupId: group.id,
                    protectedGroup: protectedGroup,
                };
                this._groups.push(newGroup);
            });
        } else {
            // FIXME 20240321 Vero:
            //  *********************************************************************************
            //  The method info from the ws Organizations is returning an empty array of projects.
            //  The following bug has been created:
            //  https://app.clickup.com/t/36631768/TASK-5923.
            //  Meanwhile, I use the list of projects from opencgaSession.
            //  *********************************************************************************
            /*
            this.organization?.projects?.forEach(project => {
                project.studies?.forEach(study => {
                    study.groups?.forEach(group => {
                        const newGroup = {
                            studyId: study.id,
                            groupId: group.id,
                        };
                        this._groups.push(newGroup);
                    });
                });
            });
             */
            this.opencgaSession?.projects?.forEach(project => {
                project.studies?.forEach(study => {
                    study.groups?.forEach(group => {
                        const newGroup = {
                            studyId: study.id,
                            groupId: group.id,
                            creationDate: group.creationDate,
                        };
                        this._groups.push(newGroup);
                    });
                });
            });
        }
    }

    update(changedProperties) {
        if (changedProperties.has("organization") ||
            changedProperties.has("study") ||
            changedProperties.has("opencgaSession")) {
            this.#getGroups(!this.organization);
        }
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

    organizationIdObserver() {
        if (this.organizationId && this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.organization()
                .info(this.organizationId)
                .then(response => {
                    this.organization = UtilsNew.objectClone(response.responses[0].results[0]);
                })
                .catch(reason => {
                    this.organization = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "organizationChange", this.organization, {}, error);
                    this.#setLoading(false);
                });

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
        if (Object.keys(this._groups).length === 0) {
            return html `
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    This organization does not have studies yet.
                    Please create some projects or studies to see the list of existent groups.
                </div>
            `;
        }

        return html `
            <!-- 1. Render filter graphics if enabled -->
            ${this.renderFilterGraphics()}
            <!-- 2. Render grid -->
            <group-admin-grid
                .toolId="${this.COMPONENT_ID}"
                .groups="${this._groups}"
                .opencgaSession="${this.opencgaSession}">
            </group-admin-grid>
        `;
    }

    getDefaultConfig() {
        return {
            showGraphicFilters: false,
        };
    }

}

customElements.define("group-admin-browser", GroupAdminBrowser);
