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
import LitUtils from "../../commons/utils/lit-utils.js";

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
            buttonOkText: "Update"
        };
    }

    #initConfigNotification() {
        this._config.notification = {
            title: "",
            text: "Some changes have been done in the form. Not saved changes will be lost",
            type: "notification",
            display: {
                visible: () => {
                    return UtilsNew.isNotEmpty(this.updatedParam);
                },
                notificationType: "warning",
            },
        };
    }

    #initOriginalObjects() {
        // this._listUsersStudy = UtilsNew.objectClone(
        //     this.study.groups.filter(group => group.id === "@members"))
        //     .userIds;
        this.updatedFields = {};
        // Read list organization users to prepare the allowed values in the Users select menu
        this.groupsAllowedValues = this.study.groups;
        debugger
        this.component = {
            users: [],
            groups: UtilsNew.objectClone(this.study.groups),
        };
        this._component = UtilsNew.objectClone(this.component);
        // Prepare allowedValues for the select options menu
        // for (const group of this.study.groups) {
        //     this.groupsAllowedValues.push({id: group.id});
        // }
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
            this._config = this.getDefaultConfig();
            if (!this._config?.notification) {
                this.#initConfigNotification();
            }
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
    onFieldChange(e, field) {
        debugger
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
        // 1. Prepare query params
        const params = {
            includeResult: true,
        };
        // 2. Query
        this.#setLoading(true);
    }

    // --- RENDER ---
    render() {
        return html`
            <data-form
                .data="${this._component}"
                .config="${this._config}"
                .updateParams="${this.updatedFields}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "",
            display: this.displayConfig,
            sections: [
                {
                    // title: "Manage users in study groups",
                    display: {
                        // titleHeader: "",
                        // titleStyle: "",
                        descriptionClassName: "d-block text-secondary",
                        // descriptionStyle: "",
                        // visible: () =>
                    },
                    elements: [
                        {
                            title: "Groups",
                            field: "groups",
                            type: "select",
                            multiple: true,
                            all: true,
                            required: true,
                            allowedValues: this.groupsAllowedValues,
                            display: {
                                // apply: () => ,
                                placeholder: "Select group or groups...",
                            },
                        },
                        {
                            title: "Select User or users",
                            field: "users",
                            type: "custom",
                            required: true,
                            display: {
                                render: (users, dataFormFilterChange, updateParams) => {
                                    const userIds = Array.isArray(users) ?
                                        users?.map(user => user.id).join(",") :
                                        users;

                                    const handleSamplesFilterChange = e => {
                                        // We need to convert value from a string wth commas to an array of IDs
                                        // eslint-disable-next-line no-param-reassign
                                        const userList = e.detail.value
                                            ?.split(",")
                                            .filter(userId => userId)
                                            .map(userId => ({id: userId}));
                                        dataFormFilterChange(userList);
                                    };

                                    return html`
                                        <catalog-search-autocomplete
                                                .value="${userIds}"
                                                .resource="${"USERS"}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .classes="${updateParams.users ? "selection-updated" : ""}"
                                                .config="${{multiple: true}}"
                                                @filterChange="${e => handleSamplesFilterChange(e)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
                            },
                        },

                    ],
                },
            ],
        };
    }

}

customElements.define("study-users-manage", StudyUsersManage);

