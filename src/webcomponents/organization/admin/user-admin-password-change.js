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
import NotificationUtils from "../../commons/utils/notification-utils.js";
import "../../user/user-password-change.js";

export default class UserAdminPasswordChange extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.user = {}; // Original object
        this._user = {}; // Updated object
        this.userId = "";
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

    #initOriginalObjects() {
        this._user = UtilsNew.objectClone(this.user);
        this.updatedFields = {};
    }

    update(changedProperties) {
        if (changedProperties.has("userId")) {
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
                    LitUtils.dispatchCustomEvent(this, "userInfo", this.user, {}, error);
                    this.#setLoading(false);
                });
        }
    }

    render() {
        return html `
            <detail-tabs
                .data="${this._user}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            title: "",
            showTitle: false,
            items: [
                {
                    id: "change-password",
                    name: "Change Password",
                    active: true,
                    render: (user, active, opencgaSession) => {
                        return html`
                            <user-password-change
                                .userId="${user.id}"
                                .opencgaSession="${opencgaSession}"
                                .organizationId="${this.organization.id}"
                                .displayConfig="${{
                                    titleVisible: false,
                                }}">
                            </user-password-change>
                        `;
                    },
                },
            ],
        };
        /*
        return {
            icon: "fas fa-edit",
            buttons: {
                clearText: "Discard Changes",
                okText: "Update",
            },
            display: this.displayConfig,
            sections: [
                {
                    title: "Change Password",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => {
                                    debugger
                                    return html`
                                        <user-password-change
                                            .user="${this.userId}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .organization="${this.organization}"
                                            .displayConfig="${{
                                                titleVisible: false,
                                                buttonsVisible: false,
                                            }}">
                                        </user-password-change>
                                    `;
                                },
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
    /*
                    ],
                },
            ],
        };
    */
    }

}

customElements.define("user-admin-password-change", UserAdminPasswordChange);
