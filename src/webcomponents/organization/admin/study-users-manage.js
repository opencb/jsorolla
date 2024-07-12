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
            studyId: {
                type: String,
            },
            organization: {
                type: Object,
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
        this.component = {}; // Original object
        this._component = {}; // Updated object
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
        // 1. Dataform variables
        this.component = {
            selectedGroups: "",
            selectedUsers: [],
        };
        this._component = UtilsNew.objectClone(this.component);
        // 2. Query variables
        this._userGroupUpdates = [];
        // 3. Display variables
        this._groupAllowedValues = this.study.groups;
        this._selectedGroups = [];
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    // --- LIT LIFE CYCLE
    update(changedProperties) {
        if (changedProperties.has("studyId") ||
            changedProperties.has("opencgaSession") ||
            changedProperties.has("organization")) {
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
    propertyObserver() {
        if (this.studyId && this.opencgaSession && this.organization.id) {
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.studies()
                .info(this.studyId)
                .then(response => {
                    this.study = UtilsNew.objectClone(response.responses[0].results[0]);
                    this.#initOriginalObjects();
                })
                .catch(error => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                })
                .finally(() => {
                    this.#setLoading(false);
                });
        }
    }

    // --- EVENTS ---
    onFieldChange(e) {
        const param = e.detail.param;
        this.updatedFields = FormUtils.getUpdatedFields(this.variant, this.updatedFields, param, e.detail.value, e.detail.action);

        if (param === "selectedGroups") {
            // Update the selectedGroups local variable. This is needed because the select-field-filter.js component is
            // returning comma separated string
            const selectedGroupIds = this._component.selectedGroups?.split(",") || [];
            this._selectedGroups = selectedGroupIds
                .map(selectedGroupId => this._groupAllowedValues.find(group => group.id === selectedGroupId));
            // If a group has been removed, remove possible updates stored in the array of changes
            this._userGroupUpdates = this._userGroupUpdates.filter((update => selectedGroupIds.includes(update.groupId)));
        }
        if (param === "selectedUsers") {
            // If a user has been removed, remove possible updates stored in the array of changes
            this._userGroupUpdates = this._userGroupUpdates.filter((update => this._component.selectedUsers.includes(update.userId)));
        }
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
                this.opencgaSession.opencgaClient.studies()
                    .updateGroupsUsers(this.study.fqn, update.groupId, data, params)
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            title: `User in Group Update`,
                            message: `
                                ${update.userId} ${update.isChecked ? "ADDED to" : "REMOVED from"}
                                ${update.groupId} in study ${this.study.id} correctly.
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
                this.#initOriginalObjects();
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest", {});
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
        return this._userGroupUpdates
            .findIndex(update => update.userId === userId && update.groupId === groupId);
    }

    _findCurrentValue(userId, groupId) {
        // 1. Check if this user has been added/removed from this group
        const change = this._userGroupUpdates
            .find(update => update.userId === userId && update.groupId === groupId);
        if (change) {
            return change.isChecked;
        }
        // 2. If not, check if the user was initially on this group
        const group = this._selectedGroups.find(group => group.id === groupId);
        return group.userIds.includes(userId);
    }

    // --- RENDER ---
    render() {
        if (!this.study) {
            return nothing;
        }

        return html`
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
                description: `This interface allows you to simultaneously manage multiple users in multiple groups within the selected study.
                Please note that adding a user to the special group @members will only grant them access to the metadata of the study.
                However, once users are in the @members group, Study Administrators can grant them additional permissions
                at the study level or within specific groups.`,
                display: {
                    descriptionClassName: "d-block text-secondary",
                },
                elements: [
                    {
                        title: "Select Group(s)",
                        field: "selectedGroups",
                        type: "select",
                        required: true,
                        multiple: true,
                        all: false,
                        allowedValues: this._groupAllowedValues,
                        display: {
                            // apply: () => ,
                            placeholder: "Select group or groups...",
                        },
                    },
                    {
                        title: "Select User(s)",
                        field: "selectedUsers",
                        type: "custom",
                        required: true,
                        display: {
                            visible: this._selectedGroups?.length > 0,
                            render: (users, dataFormFilterChange, updateParams) => {
                                const userIds = (users || []).join(",");
                                const handleUsersFilterChange = e => {
                                    // We need to convert value from a string with commas to an array of IDs
                                    const userList = (e.detail.value?.split(",") || []);
                                    dataFormFilterChange(userList);
                                };
                                return html`
                                    <catalog-search-autocomplete
                                        .value="${userIds}"
                                        .resource="${"USERS"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .classes="${updateParams?.users ? "selection-updated" : ""}"
                                        .config="${{multiple: true}}"
                                        @filterChange="${e => handleUsersFilterChange(e)}">
                                    </catalog-search-autocomplete>
                                `;
                            },
                        },
                    },
                ],
            },
            {
                display: {
                    descriptionClassName: "d-block text-secondary",
                    visible: data => data?.selectedGroups !== "" && data?.selectedUsers?.length > 0,
                },
                elements: [
                    {
                        title: "Table",
                        field: "selectedUsers",
                        type: "table",
                        display: {
                            width: 12,
                            columns: [
                                {
                                    id: "id",
                                    title: "User Id",
                                    type: "custom",
                                    display: {
                                        render: (value, update, params, data, row) => row,
                                    },
                                },
                                ...this._selectedGroups?.map(group => ({
                                    id: group.id,
                                    title: group.id,
                                    type: "custom",
                                    display: {
                                        helpMessage: "",
                                        render: (checked, dataFormFilterChange, updateParams, data, row) => {
                                            return html`
                                                <div class="form-check form-switch">
                                                    <input
                                                        class="form-check-input"
                                                        type="checkbox"
                                                        .checked="${this._findCurrentValue(row, group.id)}"
                                                        @click="${e => this.onUserGroupChange(e, row, group.id)}">
                                                    ${this._findChangePosition(row, group.id) >= 0 ? html`<span style="color: darkorange">*</span>` : ""}
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

