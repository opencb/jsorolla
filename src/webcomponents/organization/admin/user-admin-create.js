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

import {LitElement, html} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import UtilsNew from "../../../core/utils-new.js";

export default class UserAdminCreate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
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
        this._user = {};
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Create"
        };
        this._config = this.getDefaultConfig();
    }

    #initOriginalObjects() {
        this._user = {};
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.#initOriginalObjects();
    }

    onFieldChange(e, field) {
        this._user = {...e.detail.data}; // force to refresh the object-list
        debugger

        // const param = field || e.detail.param;
        // // 1. Update user id
        // if (param === "id") {
        //     // TODO 20240325 Vero: verify user id does not exist
        //     this.user.id = e.detail.data.id;
        // }
        // 2. Update the list of studies
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear user",
            message: "Are you sure to clear?",
            ok: () => {
                this._user = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        // Prepare object to be submitted
        this._user.organization = this.organization.id;
        delete this._user.confirmPassword;

        // CAUTION:
        //  - POST admin/users/create or
        //  - POST users/create ?
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.users()
            .create(this._user)
            .then(response => {
                const newUser = UtilsNew.objectClone(response.responses[0].results[0]);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `User Create`,
                    message: `User ${newUser.id} created in organization ${this.organization.id} successfully`,
                });
                LitUtils.dispatchCustomEvent(this, "userCreate", newUser, {});
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest", newUser, {});
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                this.#initOriginalObjects();
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this._user}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>`;
    }

    getDefaultConfig() {
        return {
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    elements: [
                        {
                            title: "User ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                            },
                        },
                        {
                            title: "User Name",
                            field: "name",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add the user name...",
                            },
                        },
                        {
                            title: "User Email",
                            field: "email",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add the user email...",
                            },
                        },
                        {
                            title: "User Password",
                            field: "password",
                            type: "input-password",
                            required: true,
                            validation: {
                                validate: (value, user) => !!user.password,
                                message: "The user password can not be empty.",
                            },
                            display: {
                                helpMessage: `
                                    Type a strong password of a minimum length of 8 characters, combining at least:
                                    1 upper-case letter, 1 lower-case letter, 1 digit, and 1 special character.
                                `,
                            },
                        },
                        {
                            title: "Confirm user password",
                            field: "confirmPassword",
                            type: "input-password",
                            required: true,
                            defaultValue: "",
                            validation: {
                                validate: (value, user) => {
                                    return !!user.confirmPassword && user.confirmPassword === user.password;
                                },
                                message: "The user passwords do not match.",
                            },
                        },
                        {
                            title: "Change password",
                            field: "requiredAction",
                            type: "toggle-switch",
                            required: false,
                            display: {
                                disabled: true,
                                helpMessage: "Coming soon: Required user action for changing password.",
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("user-admin-create", UserAdminCreate);
