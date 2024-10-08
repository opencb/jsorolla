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
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";

export default class UserPasswordReset extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            user: {
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
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            titleStyle: "color: var(--main-bg-color);margin-bottom:16px;font-weight:bold;",
            defaultLayout: "horizontal",
            buttonOkText: "Reset password",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    #initOriginalObjects() {
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig") || changedProperties.has("user")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onSubmit() {
        // QUESTION:
        //  - TASK-1667, includeResult
        //  - JS client do not have argument for params, only user
        let error;
        this.#setLoading(true);
        //  Reset password
        this.opencgaSession.opencgaClient.users()
            .resetPassword(this.user.id)
            .then(() => {
                this.#initOriginalObjects();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `User Reset Password`,
                    message: `User ${this.user.id} password reset correctly`,
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "userUpdate", this.user.id, {}, error);
                this.#setLoading(false);
            });

    }

    render() {
        // TODO: check if opencgaSession has been provided
        return html`
            <data-form
                .data="${this.user}"
                .config="${this._config}"
                @submit="${() => this.onSubmit()}"
                @clear="${() => this.onClear()}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Reset Password",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: `Do you really want to reset ${this.user?.id}'s password?`,
                    elements: [
                        {
                            type: "notification",
                            text: `The user ${this.user?.id} will receive an email with a temporary password`,
                            display: {
                                visible: true,
                                icon: "fas fa-exclamation-triangle",
                                notificationType: "error",
                            },
                        },
                        {
                            title: "User ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                disabled: true,
                            }
                        },
                        {
                            title: "Email",
                            field: "email",
                            type: "input-text",
                            display: {
                                disabled: true,
                            }
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("user-password-reset", UserPasswordReset);
