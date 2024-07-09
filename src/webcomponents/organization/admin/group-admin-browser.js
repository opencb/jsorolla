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
import UtilsNew from "../../../core/utils-new.js";
import "./group-admin-grid.js";

export default class GroupAdminBrowser extends LitElement {

    /* -----------------------------------------------------------------------------------------------------------------
    CONSTRUCTOR AND PROPERTIES
    ----------------------------------------------------------------------------------------------------------------- */
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

    /* -----------------------------------------------------------------------------------------------------------------
    PRIVATE METHODS
    ----------------------------------------------------------------------------------------------------------------- */
    #init() {
        this.COMPONENT_ID = "groups-admin-browser";
        this._groups = [];
        this._studies = [];
        this._study = {};
        this._config = this.getDefaultConfig();
        this.isLoading = false;
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    #prepareGroups(groups, project, study) {
        /*
        if (this.study) {
            this._groups = [];
            this._studies = [this.opencgaSession.study];
            this.study.groups?.forEach(group => {
                const newGroup = {
                    studyId: this.study.id,
                    fqn: this.study.fqn,
                    group: group,
                    isGroupProtected: !!(group.id === "@admins" || group.id === "@members"),
                };
                this._groups.push(newGroup);
            });
        }
        */
        // Get all study groups
        const p = project || this.opencgaSession.project;
        const s = study || this.opencgaSession.study;

        this._studies.push({
            projectId: p.id,
            fqn: s.fqn,
            name: s.alias,
        });
        this._groups = groups.map(group => ({
            ...group,
            fqn: s.fqn,
            studyId: s.id,
            projectId: p.id,
            isProtected: !!(group.id === "@admins" || group.id === "@members"),
        }));
    }

    /* -----------------------------------------------------------------------------------------------------------------
    LIT LIFE-CYCLE
    ----------------------------------------------------------------------------------------------------------------- */
    update(changedProperties) {
        if (changedProperties.has("organizationId")) {
            this.organizationIdObserver();
        }
        if (changedProperties.has("organization")) {
            this.organizationObserver();
        }
        if (changedProperties.has("studyId")) {
            this.studyIdObserver();
        }
        if (changedProperties.has("study")) {
            this.studyObserver();
        }
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    /* -----------------------------------------------------------------------------------------------------------------
    OBSERVERS
    ----------------------------------------------------------------------------------------------------------------- */
    organizationObserver() {
        // Get all organization groups
        if (this.organization) {
            this._groups = [];
            this._studies = [];
            this.organization?.projects?.forEach(project => {
                project.studies?.forEach(study => {
                    this.#prepareGroups(study.groups, project, study);
                });
            });
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
                    LitUtils.dispatchCustomEvent(this, "organizationInfo", this.organization, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    studyObserver() {
        if (this.study) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.studies()
                .groups(this.study.fqn)
                .then(response => {
                    const groups = response.responses[0].results;
                    this.#prepareGroups(groups);
                })
                .catch(reason => {
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    LitUtils.dispatchCustomEvent(this, "studyChange", this.study, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    studyIdObserver() {
        if (this.studyId && this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.studies()
                .info(this.studyId)
                .then(response => {
                    this.study = UtilsNew.objectClone(response.responses[0].results[0]);
                })
                .catch(reason => {
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    LitUtils.dispatchCustomEvent(this, "studyChange", this.study, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    settingsObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.settings,
        };
    }

    /* -----------------------------------------------------------------------------------------------------------------
    RENDER
    ----------------------------------------------------------------------------------------------------------------- */
    renderFilterGraphics() {
        if (this._config.showGraphicFilters) {
            return html `
            <!--<graphic-filter></graphic-filter>-->
        `;
        }
    }

    render() {
        if (!this.opencgaSession) {
            return html`<div>Not valid session</div>`;
        }

        if (this._groups.length > 0 && this._studies.length > 0) {
            return html `
                <!-- 1. Render filter graphics if enabled -->
                ${this.renderFilterGraphics()}
                <!-- 2. Render grid -->
                <group-admin-grid
                    .toolId="${this.COMPONENT_ID}"
                    .opencgaSession="${this.opencgaSession}"
                    .groups="${this._groups}"
                    .studies="${this._studies}"
                    .config="${this._config}"
                    .active="${true}">
                </group-admin-grid>
            `;
        }
    }

    /* -----------------------------------------------------------------------------------------------------------------
    DEFAULT CONFIG
    ----------------------------------------------------------------------------------------------------------------- */
    getDefaultConfig() {
        return {
            showGraphicFilters: false,
        };
    }

}

customElements.define("group-admin-browser", GroupAdminBrowser);
