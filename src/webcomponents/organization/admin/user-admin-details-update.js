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

export default class UserAdminDetailsUpdate extends LitElement {

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
        // Some of the user fields modeled in the form cannot be updated
        this.updateCustomisation = [
            params => {
                if (params.account?.expirationDate) {
                    // eslint-disable-next-line no-param-reassign
                    params.account = {expirationDate: params.account.expirationDate};
                }
            },
        ];
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
        this.requestUpdate();
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

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        this.updatedFields = FormUtils.getUpdatedFields(
            this.user,
            this.updatedFields,
            param,
            e.detail.value,
            e.detail.action);

        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard changes",
            message: "Are you sure you want to discard the changes made?",
            ok: () => {
                this.#initOriginalObjects();
                this.requestUpdate();
                // We need to dispatch a component clear event
                LitUtils.dispatchCustomEvent(this, "userClear", null, {
                    user: this.user,
                });
            },
        });
    }

    onSubmit() {
        const params = {
            includeResult: true,
        };
        const updateParams = FormUtils.getUpdateParams(this._user, this.updatedFields, this.updateCustomisation);

        this.#setLoading(true);
        this.opencgaSession.opencgaClient.organization()
            .updateUser(this.userId, updateParams, params)
            .then(response => {
                this.user = UtilsNew.objectClone(response.responses[0].results[0]);
                this.#initOriginalObjects();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `User Details Update`,
                    message: `User ${this.userId} updated correctly`,
                });
                LitUtils.dispatchCustomEvent(this, "userUpdate", this.user, {});
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                LitUtils.dispatchCustomEvent(this, "userUpdateFailed", this.user, {}, error);
            })
            .finally(() => {
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
                @submit="${this.onSubmit}"
                @clear="${this.onClear}">
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
                    display: {
                        titleVisible: false,
                    },
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
                    ],
                },
                {
                    title: "Account",
                    display: {
                        titleVisible: false,
                    },
                    elements: [
                        {
                            title: "Expiration Date",
                            field: "account.expirationDate",
                            type: "input-date",
                            display: {
                                format: date => UtilsNew.dateFormatter(date)
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("user-admin-details-update", UserAdminDetailsUpdate);
