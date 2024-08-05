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
import "../../user/user-password-reset.js";

export default class UserAdminPasswordReset extends LitElement {

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
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._user = null;
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("userId") || changedProperties.has("opencgaSession")) {
            this.userIdObserver();
        }
        super.update(changedProperties);
    }

    userIdObserver() {
        if (this.opencgaSession && this.userId) {
            this.opencgaSession.opencgaClient.users()
                .info(this.userId, {
                    organization: this.opencgaSession.organization.id,
                })
                .then(response => {
                    this._user = UtilsNew.objectClone(response.responses[0].results[0]);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    onSubmit() {
        let error;
        this.#setLoading(true);
        //  Reset password
        this.opencgaSession.opencgaClient.users()
            .resetPassword(this._user.id)
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `User Reset Password`,
                    message: `User ${this._user.id} password reset correctly`,
                });
                LitUtils.dispatchCustomEvent(this, "closeNotification", this._user.id, {}, error);
                this._user = null;
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: `Reset Password: User <b>${this._user.id}</b> in organization ${this.opencgaSession.organization.id}`,
            message: `
                Are you sure you want to reset ${this._user.id}'s password?
                <br><br>
                The user <b>${this._user.id}</b> will receive an email with a temporary password in the following
                email address:
                <span class="text-muted">${this._user.email}</span>.
            `,
            ok: () => {
                this.onSubmit();
            },
            cancel: () => {
                this._user = null;
                LitUtils.dispatchCustomEvent(this, "closeNotification", null);
            },
        });
    }

    getDefaultConfig() {}

}

customElements.define("user-admin-password-reset", UserAdminPasswordReset);
