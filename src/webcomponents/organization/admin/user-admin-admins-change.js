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
import NotificationUtils from "../../commons/utils/notification-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "./filters/user-status-filter.js";

export default class UserAdminAdminsChange extends LitElement {

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
            action: {
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
        this.userId = "";
        this.displayTitle = "";
        this.displayText = "";
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            titleStyle: "color: var(--main-bg-color);margin-bottom:16px;font-weight:bold;",
            defaultLayout: "horizontal",
            buttonOkText: "Confirm",
            buttonClearText: "",
        };
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("userId") || changedProperties.has("action")) {
            this.propertyObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    propertyObserver() {
        if (this.action && this.userId) {
            this.displayMessages = {
                "REMOVE": {
                    title: `Remove user '${this.userId}' from the list of organization users.`,
                    text: `The user '${this.userId}' will be REMOVED from the list of organization administrators.
                    As a result, they will no longer be able to perform specific actions such as creating or editing users,
                    modifying organization information, or creating projects and studies.`,
                    successText: `The '${this.userId}' has been successfully REMOVED from the list of organization administrators`,
                },
                "ADD": {
                    title: `Add user '${this.userId}' to the list of organization users.`,
                    text: `The user '${this.userId}' will be ADDED to the list of organization administrators.
                    As a result, they be able to perform specific actions such as creating or editing users,
                    modifying organization information, or creating projects and studies.`,
                    successText: `The '${this.userId}' has been successfully ADDED to the list of organization administrators`,
                },
            };
            this.displayTitle = this.displayMessages[this.action].title;
            this.displayText = this.displayMessages[this.action].text;
            this.displaySuccessText = this.displayMessages[this.action].successText;
        }
    }

    onSubmit() {
        const params = {
            includeResult: true,
            adminsAction: this.action,
        };
        let admins = this.organization.admins;
        this.action === "ADD" ? admins.push(this.userId) : admins = [this.userId]; // REMOVE userId from array of admins

        const updateParams = {
            admins: admins,
        };
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.organization()
            .update(this.organization.id, updateParams, params)
            .then(response => {
                this.user = UtilsNew.objectClone(response.responses[0].results[0]);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `Organization Admin`,
                    message: this.displaySuccessText,
                });
                LitUtils.dispatchCustomEvent(this, "userUpdate", this.user, {});
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest", this._study, {});
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                LitUtils.dispatchCustomEvent(this, "userUpdateFailed", this.user, {}, reason);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this.userId}"
                .config="${this._config}"
                @submit="${this.onSubmit}"
                @clear="${this.onClear}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            icon: "fas fa-edit",
            buttons: {
                okText: "Confirm",
            },
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    // title: this.displayTitle,
                    elements: [
                        {
                            type: "notification",
                            text: this.displayText,
                            display: {
                                visible: true,
                                icon: "fas fa-exclamation-triangle",
                                notificationType: "warning",
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("user-admin-admins-change", UserAdminAdminsChange);
