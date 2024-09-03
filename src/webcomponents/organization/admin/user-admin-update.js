/**
 * Copyright 2015-2024 OpenCB
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
import LitUtils from "../../commons/utils/lit-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import "../../user/user-password-change.js";
import "../../user/user-password-reset.js";

export default class UserAdminUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            userId: {
                type: String
            },
            organization: {
                type: Object,
            },
            studyId: {
                type: String,
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._user = {};
        this.userId = "";
        this.studyId = "";
        this.displayConfig = {};
        this.updatedFields = {};

        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    #initConfigNotification() {
        this._config.notification = {
            title: "",
            text: "Some changes have been done in the form. Not saved changes will be lost",
            type: "notification",
            display: {
                visible: () => {
                    return UtilsNew.isNotEmpty(this.updatedFields);
                },
                notificationType: "warning",
            },
        };
    }

    #initUser() {
        // 1. Group contains params: (a) id: e.g. "@admins", (b) userIds: e.g. ["test"]
        this._user = UtilsNew.objectClone(this.user);
        // 2. In the update form, we need to manage as well the permissions of this group.
        // Retrieve ACL permissions. Check if this study group has acl
        // CAUTION: study does not have acl?
        // const groupPermissions = this._study?.acl
        //     ?.find(acl => acl.member === this.opencgaSession.user.id)?.groups
        //     ?.find(group => group.id === this.group.id)?.permissions || [];
        // // 3. Add current permissions and template key to the object group
        // this.group = {
        //     ...this.group,
        //     permissions: groupPermissions,
        //     template: "", // Fixme: not sure how to retrieve template
        // };
        this.initOriginalObjects();
    }

    #initOriginalObjects() {
        this._user = UtilsNew.objectClone(this.user);
        this.updatedFields = {};
    }

    update(changedProperties) {
        if ((changedProperties.has("userId") && this.active)) {
            this.userIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
            if (!this._config?.notification) {
                this.#initConfigNotification();
            }
        }
        super.update(changedProperties);
    }

    userIdObserver() {
        if (this.userId && this.opencgaSession) {
            const params = {
                organization: this.organization.id,
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.users()
                .info(this.userId, params)
                .then(response => {
                    this.user = UtilsNew.objectClone(response.responses[0].results[0]);
                    this.#initOriginalObjects();
                })
                .catch(reason => {
                    error = reason;
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                })
                .finally(() => {
                    LitUtils.dispatchCustomEvent(this, "userInfo", this.study, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    // Uncomment to post-process data-form manipulation
    // onFieldChange(e) {
    //     debugger
    //     this.updatedFields = e.detail?.updatedFields || {};
    //     this.requestUpdate();
    // }

    onFieldChange(e) {
        const param = e.detail.param;
        this.updatedFields = FormUtils.getUpdatedFields(
            this.group,
            this.updatedFields,
            param,
            e.detail.value,
            e.detail.action);
        if (param === "template") {
            this._group.template = e.detail.value;
        }
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard changes",
            message: "Are you sure you want to discard the changes made?",
            ok: () => {
                this.initOriginalObjects();
                this.requestUpdate();
                // We need to dispatch a component clear event
                LitUtils.dispatchCustomEvent(this, "groupClear", null, {
                    group: this._group,
                });
            },
        });
    }

    onSubmit() {
        const paramsAction = {
            action: "SET"
        };
        const studyAclParams = {
            study: this.studyId,
            template: this._group.template,
            // permissions: this._group.permissions,
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.studies()
            .updateAcl(this.groupId, paramsAction, studyAclParams)
            .then(response => {
                this.group = UtilsNew.objectClone(response.responses[0].results[0]);
                this.updatedFields = {};
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `User Update`,
                    message: `User ${this.userId} updated correctly`,
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "updateUser", this.group, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        return html `
            <data-form
                .data="${this._user}"
                .config="${this._config}"
                .updateParams="${this.updatedFields}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            icon: "fas fa-edit",
            buttons: {
                clearText: "Discard Changes",
                okText: "Update",
            },
            display: this.displayConfig,
            sections: [
                {
                    title: "Details",
                    elements: [
                        {
                            title: "User Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                helpMessage: "Edit the user name...",
                            },
                        },
                        {
                            title: "User email",
                            field: "email",
                            type: "input-text",
                            display: {
                                helpMessage: "Edit the user email...",
                            },
                        },
                        {
                            title: "Enable user",
                            field: "enabled",
                            type: "toggle-switch",
                            display: {
                                disabled: true,
                                helpMessage: "Coming soon: Enable/Disable a user in an organization",
                            },
                        },

                    ],
                },
                {
                    title: "Credentials",
                    elements: [
                        {
                            title: "Set password",
                            type: "custom",
                            display: {
                                render: (data, active, opencgaSession) => html`
                                    <user-password-change
                                        .opencgaSession="${opencgaSession}">
                                    </user-password-change>
                                `,
                            },
                        },
                        {
                            title: "Reset password",
                            type: "custom",
                            display: {
                                render: (data, active, opencgaSession) => html`
                                    <user-password-reset
                                        .opencgaSession="${opencgaSession}">
                                    </user-password-reset>
                                `,
                            },
                        },
                        /*
                        {
                            title: "Reset password",
                            field: "pwdReset",
                            type: "toggle-switch",
                            display: {
                                disabled: true,
                                helpMessage: "Coming soon: Force user to reset the password",
                            },
                        },
                        {
                            title: "Expires in",
                            field: "pwdExpiration",
                            type: "input-text",
                            display: {
                                disabled: true,
                                helpMessage: "Coming soon: Enable password expiration",
                            },
                        },
                         */
                    ],
                },
                {
                    title: "Permissions",
                    elements: [
                        {
                            title: "Templates",
                            field: "template",
                            type: "toggle-buttons",
                            allowedValues: ["analyst", "view_only"],
                        },
                        // TODO: Implement customised permissions for the group
                        // {
                        //     title: "Permissions",
                        //     field: "permissions",
                        //     type: "toggle-buttons",
                        // },
                    ],
                },
                // {
                //     title: "Users",
                //     elements: [
                //     ],
                // },
            ],
        };
    }

}

customElements.define("user-admin-update", UserAdminUpdate);
