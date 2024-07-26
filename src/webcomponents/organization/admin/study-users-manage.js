/**
 * Copyright 2015-2023 OpenCB
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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import FormUtils from "../../commons/forms/form-utils";
import LitUtils from "../../commons/utils/lit-utils";

export default class StudyUsersManage extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            studyFqn: {
                type: String,
            },
            groups: {
                type: Array,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.updateParams = {};
        this.isLoading = false;
        this.displayConfig = {};
        this.displayConfigDefault = {
            style: "margin: 10px",
            defaultLayout: "horizontal",
            labelAlign: "right",
            labelWidth: 3,
            buttonOkText: "Update",
        };
    }

    #initOriginalObjects() {
        // 1. Data in data-form
        // Original object
        this.userRole = {
            "org-owner": {
                displayName: "OWNER",
                check: userId => this.opencgaSession.organization.owner === userId,
            },
            "org-admin": {
                displayName: "ADMIN",
                check: userId => this.opencgaSession.organization.admins.includes(userId),
            },
            "study-admin": {
                displayName: "STUDY ADMIN",
                check: userId => this.groups.find(group => group.id === "@admins").userIds.includes(userId),
            },
        };

        this.component = {
            selectedGroups: this.groups.map(group => group.id).join(",") || "",
            selectedUsers: this.users?.map(user => user.id) || [],
        };
        // Modified object
        this._component = UtilsNew.objectClone(this.component);

        // 2. Query variables
        this._userGroupUpdates = [];

        // 3. Display
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    // --- LIT LIFE CYCLE
    update(changedProperties) {
        if (changedProperties.has("studyFqn") ||
            changedProperties.has("groups") ||
            changedProperties.has("opencgaSession")) {
            this.propertyObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig,
            };
        }
        super.update(changedProperties);
    }

    // --- OBSERVERS ---
    async propertyObserver() {
        if (this.opencgaSession?.organization?.id && this.groups && this.studyFqn) {
            const filters = {
                organization: this.opencgaSession.organization.id,
                include: "id",
                count: true,
                limit: 1,
            };
            this.#setLoading(true);
            try {
                const responseNoUsers = await this.opencgaSession.opencgaClient.users().search(filters);
                const noUsers = responseNoUsers.responses[0].numTotalResults;
                if (noUsers > 0) {
                    filters.limit = noUsers;
                    const responseUsers = await this.opencgaSession.opencgaClient.users().search(filters);
                    this.users = UtilsNew.objectClone(responseUsers.responses[0].result);
                    this.#initOriginalObjects();
                }
            } catch (error) {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            }
            this.#setLoading(false);
        }
    }

    // --- EVENTS ---
    onFieldChange(e) {
        const param = e.detail.param;
        this.updatedFields = FormUtils.getUpdatedFields(this.component, this.updatedFields, param, e.detail.value, e.detail.action);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard changes",
            message: "Are you sure you want to discard the changes made?",
            ok: () => {
                this.#initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        // 1. Create promises with updates
        this.#setLoading(true);
        const _userGroupPromises = this._userGroupUpdates
            .map(update => {
                let error;
                const params= {
                        includeResult: true,
                        action: update.isChecked ? "ADD" : "REMOVE",
                };
                const data = {
                    users: [update.userId],
                };
                return this.opencgaSession.opencgaClient.studies()
                    .updateGroupsUsers(this.studyFqn, update.groupId, data, params)
                    .then(() => {
                        const studyId = this.studyFqn.split(":").pop();
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            title: `User in Group Update`,
                            message: `
                                ${update.userId} ${update.isChecked ? "ADDED to" : "REMOVED from"}
                                ${update.groupId} in study ${studyId} correctly.
                            `,
                        });
                    })
                    .catch(reason => {
                        error = reason;
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                    })
                    .finally(() => {
                        LitUtils.dispatchCustomEvent(this, "userGroupUpdate", {}, {
                            user: update.userId,
                            group: update.groupId,
                        }, error);
                    });

            });
        // 2. Execute all changes and refresh session
        Promise.all(_userGroupPromises)
            .finally(() => {
                this.#setLoading(false);
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest", {});
                LitUtils.dispatchCustomEvent(this, "studyUpdate", this.study, {});
            });
    }

    onUserGroupChange(e, userId, groupId) {
        const pos = this._findChangePosition(userId, groupId);
        if (pos >= 0) {
            // Remove change from this._userGroupUpdates if the change has been undone.
            this._userGroupUpdates.splice(pos, 1);
        } else {
            // Create an object with the params needed
            this._userGroupUpdates.push({
                isChecked: e.currentTarget.checked,
                userId: userId,
                groupId: groupId,
            });
        }
        this._config = {...this._config};
        this.requestUpdate();
    }

    // Double-check if the user is undoing a previous change on a specific user / group.
    _findChangePosition(userId, groupId) {
        // pos will equal -1 if a previous changes has been undone
        return this._userGroupUpdates.findIndex(update => update.userId === userId && update.groupId === groupId);
    }

    _findCurrentValue(userId, groupId) {
        // Check if this user has been added/removed from this group
        const change = this._userGroupUpdates.find(update => update.userId === userId && update.groupId === groupId);
        if (change) {
            // 2. If added/removed, return value
            return change.isChecked;
        } else {
            // 2. If not, check if the user was initially on this group
            const group = this.groups.find(group => group.id === groupId);
            return group.userIds.includes(userId);
        }
    }

    renderStyle() {
        // Note 20240724 Vero: This css class enables vertical scroll on tbody
        return html `
            <style>
                .study-users-manage-table {
                    display: grid;
                    grid-template-rows: 1fr fit-content(512px);
                }
                .study-users-manage-table tr {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
                .study-users-manage-table tbody {
                    overflow: auto;
                }
            </style>
        `;
    }

    // --- RENDER ---
    render() {
        if (!this.component) {
            return nothing;
        }

        return html`
            ${this.renderStyle()}
                <data-form
                    .data="${this._component}"
                    .config="${this._config}"
                    .updateParams="${this.updatedFields}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${e => this.onClear(e)}"
                    @submit="${e => this.onSubmit(e)}">
                </data-form>
        `;
    }

    getDefaultConfig() {
        const sections = [
            {
                display: {
                    descriptionClassName: "d-block text-secondary",
                    visible: data => data?.selectedGroups !== "" && data?.selectedUsers?.length > 0,
                },
                elements: [
                    {
                        // title: "Table",
                        field: "selectedUsers",
                        type: "table",
                        display: {
                            className: "study-users-manage-table",
                            width: 12,
                            columns: [
                                {
                                    id: "id",
                                    title: "User Id",
                                    type: "custom",
                                    display: {
                                        render: (value, update, params, data, userId) => {
                                            const role = Object.values(this.userRole)
                                                .find(role => role.check(userId)) || {};
                                            return html`
                                                <div class="d-flex align-items-center">
                                                    ${role?.displayName ? html`
                                                        <div class="me-2">${userId}</div>
                                                        <div class="badge bg-light text-primary small">${role.displayName}</div>
                                                    ` : html`
                                                        <div>${userId}</div>
                                                    `}
                                                </div>
                                            `;
                                        }
                                    },
                                },
                                ...this.groups?.map(group => ({
                                    id: group.id,
                                    title: group.id,
                                    type: "custom",
                                    display: {
                                        helpMessage: "",
                                        render: (checked, dataFormFilterChange, updateParams, data, row) => {
                                            const currentValue = this._findCurrentValue(row, group.id);
                                            const changePosition = this._findChangePosition(row, group.id);
                                            return html`
                                                <div class="form-check form-switch">
                                                    <input
                                                        class="form-check-input"
                                                        type="checkbox"
                                                        .checked="${currentValue}"
                                                        @click="${e => this.onUserGroupChange(e, row, group.id)}">
                                                    ${changePosition >= 0 ? html`<span style="color: darkorange">*</span>` : ""}
                                                </div>
                                            `;
                                        }
                                    },
                                })),
                            ],
                        },
                    },
                ],
            },
        ];
        return {
            id: "",
            display: this.displayConfig,
            sections: sections,
        };
    }

}

customElements.define("study-users-manage", StudyUsersManage);

