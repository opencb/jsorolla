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

import {html, LitElement} from "lit";
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
        debugger
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
            buttonsVisible: false,
        };
    }

    #initOriginalObjects() {
        // 1. Dataform variables
        this.component = {
            selectedGroups: "",
            selectedUsers: [],
        };
        this._component = UtilsNew.objectClone(this.component);
        // 2. Display variables
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
            // Update the selectedGroups local variable.
            // This is needed because the select-field-filter.js component is returning comma separated string
            this._selectedGroups = this._component.selectedGroups
                .split(",")
                .map(selectedGroupId => this._groupAllowedValues.find(group => group.id === selectedGroupId));
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

    onSubmit(e, userId, groupId) {
        // 1. Prepare query params
        const isChecked = e.currentTarget.checked;
        const params = {
            includeResult: true,
            action: isChecked ? "ADD" : "REMOVE"
        };
        const data = {
            users: [userId]
        };

        // 2. Query
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.studies()
            .updateGroupsUsers(this.study.fqn, groupId, data, params)
            .then(response => {
                const results = response.responses[0].results;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `User in Group Update`,
                    message: `${userId} ${isChecked ? "ADDED" : "REMOVED"} from ${groupId} correctly`,
                });
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest", this.study.fqn);
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                this.#setLoading(false);
            });
        this.requestUpdate();
    }

    // --- RENDER ---
    render() {
        if (this.study) {
            return html`
                <data-form
                    .data="${this._component}"
                    .config="${this._config}"
                    .updateParams="${this.updatedFields}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${this.onClear}">
                </data-form>
            `;
        }
    }

    getDefaultConfig() {
        const sections = [
            {
                display: {
                    // titleHeader: "",
                    // titleStyle: "",
                    descriptionClassName: "d-block text-secondary",
                    // descriptionStyle: "",
                    // visible: () =>
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
                            render: (users, dataFormFilterChange, updateParams, data) => {
                                const userIds = Array.isArray(users) ?
                                    users?.map(user => user.id).join(",") :
                                    users;
                                const handleUsersFilterChange = e => {
                                    // We need to convert value from a string with commas to an array of IDs
                                    // eslint-disable-next-line no-param-reassign
                                    const userList = (e.detail.value?.split(",") || [])
                                        .filter(userId => userId)
                                        .map(userId => ({
                                            id: userId,
                                            groups: this._selectedGroups.reduce((acc, group) => {
                                                return {
                                                    ...acc,
                                                    [group.id]: group.userIds.includes(userId),
                                                };
                                            }, {}),
                                        }));
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
                    // titleHeader: "",
                    // titleStyle: "",
                    descriptionClassName: "d-block text-secondary",
                    // descriptionStyle: "",
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
                                    field: "id",
                                },
                                ...this._selectedGroups?.map(group => ({
                                    id: group.id,
                                    title: group.id,
                                    field: `groups.${group.id}`,
                                    type: "custom",
                                    display: {
                                        helpMessage: "",
                                        render: (checked, dataformfilterchange, updateparams, data, row) => {
                                            debugger
                                            return html`
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox"
                                                           ?checked="${checked}"
                                                           @click="${e => this.onSubmit(e, row.id, group.id)}">
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

