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
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import "./user-admin-grid.js";
import NotificationUtils from "../../commons/utils/notification-utils";

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
        this.COMPONENT_ID = "user-admin-browser";
        this.users = [];
        this._config = this.getDefaultConfig();
        this.isLoading = false;
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    // TODO to remove when BUG 2 fixed
    onUserCreated(e) {
        this.users.push(e.detail.user);
    }
    #getUsers(isSingleStudy) {
        // FIXME: refactor
        // If the component is used for managing the groups of the whole organization
        this._users = [];
        if (isSingleStudy) {
            this._study.groups?.forEach(group => {
                let protectedGroup = false;
                if (group.id === "@admins" || group.id === "@members") {
                    protectedGroup = true;
                }
                const newGroup = {
                    studyId: this._study.id,
                    groupId: group.id,
                    users: group.userIds.map(user => {
                        debugger
                        return {id: user, name: user};
                    }),
                    protectedGroup: protectedGroup,
                };
                this._groups.push(newGroup);
            });
        } else {
            // FIXME 20240321 Vero:
            //  *********************************************************************************
            //  [ BUG 1 ]
            //  The method info from the ws Organizations is returning an empty array of projects.
            //  The following bug has been created:
            //       https://app.clickup.com/t/36631768/TASK-5923.
            //  Meanwhile, I use the list of projects from opencgaSession.
            //  *********************************************************************************
            //  [ BUG 2 ]
            //  The list of organization users:
            //      - Should use the endpoint: admin/users/search
            //        but not allowed for owner/admin organization user.
            //      - For listing in the user-grid a new user that still hasn't joined a group in study,
            //        we temporarily retrieve the users in study groups and fake a new user created.
            //  *********************************************************************************

            // TODO: to remove and to use enpoint admin/users/search when [ BUG 2 ] fixed
            const users = this.opencgaSession?.projects
                .map(project => project.studies).flat()
                .map(study => study.groups).flat()
                .map(group => group.userIds).flat()
                .filter(user => user !=="opencga");
            // Unique users
            this.allUsersIds = UtilsNew.sort([...new Set(users)]);

            let error;
            this.#setLoading(true);
            const params = {
                organization: this.organization.id,
            };
            // this.opencgaSession.opencgaClient.admin()
            //     .searchUsers(params)
            // TODO: not needed when [ BUG 2 ] fixed
            this.opencgaSession.opencgaClient.users()
                .info(this.allUsersIds.join(","), params)
                .then(response => {
                    // this.users = UtilsNew.objectClone(response.responses[0]?.results);
                    // TODO: To remove when [ BUG 2 ] fixed
                    this.users.push(...UtilsNew.objectClone(response.responses[0]?.results));
                })
                .catch(reason => {
                    error = reason;
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                })
                .finally(() => {
                    LitUtils.dispatchCustomEvent(this, "usersInfo", this.component, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    update(changedProperties) {
        if (changedProperties.has("organization") ||
            changedProperties.has("study") ||
            changedProperties.has("opencgaSession")) {
            this.#getUsers(!this.organization);
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
        if (Object.keys(this.users).length === 0) {
            return html `
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    This organization does not have users yet.
                    Please create some users.
                </div>
            `;
        }

        return html `
            <!-- 1. Render filter graphics if enabled -->
            ${this.renderFilterGraphics()}
            <!-- 2. Render grid -->
            <user-admin-grid
                .toolId="${this.COMPONENT_ID}"
                .organization="${this.organization}"
                .users="${this.users}"
                .opencgaSession="${this.opencgaSession}"
                @userCreate="${e => this.onUserCreated(e)}">
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
