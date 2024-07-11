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
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import FormUtils from "../../commons/forms/form-utils.js";
import "./filters/user-status-filter.js";

export default class UserAdminStatusUpdate extends LitElement {

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
        this.user = {}; // Original object
        this._user = {}; // Updated object
        this.userId = "";
        this.updatedFields = {};
        this.displayConfig = {};
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            titleStyle: "color: var(--main-bg-color);margin-bottom:16px;font-weight:bold;",
            defaultLayout: "horizontal",
            buttonOkText: "Update Status",
            buttonOkDisabled: true,
        };
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
                visible: () => UtilsNew.isNotEmpty(this.updatedFields),
                notificationType: "warning",
            },
        };
    }

    #initOriginalObjects() {
        this._user = UtilsNew.objectClone(this.user);
        this.updatedFields = {};
        this.displayConfigObserver();
    }

    update(changedProperties) {
        if (changedProperties.has("userId")) {
            this.userIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfigObserver();
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

    displayConfigObserver() {
        this.displayConfig = {
            ...this.displayConfigDefault,
            ...this.displayConfig,
        };
        this._config = this.getDefaultConfig();
        if (!this._config?.notification) {
            this.#initConfigNotification();
        }
    }

    onFieldChange(e) {
        const param = e.detail.param;
        this.updatedFields = FormUtils.getUpdatedFields(
            this.user,
            this.updatedFields,
            param,
            e.detail.value,
            e.detail.action);
        this._config.display.buttonOkDisabled = UtilsNew.isEmpty(this.updatedFields);
        this._config = {...this._config};
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard changes",
            message: "Are you sure you want to discard the changes made?",
            ok: () => {
                this.#initOriginalObjects();
                // We need to dispatch a component clear event
                LitUtils.dispatchCustomEvent(this, "userClear", null, {
                    user: this.user,
                });
            },
        });
    }

    onSubmit() {
        let error;
        const params = {
            includeResult: true,
        };
        const updateParams = FormUtils.getUpdateParams(this._user, this.updatedFields);

        this.#setLoading(true);
        this.opencgaSession.opencgaClient.organization()
            .userUpdateStatus(this.user.id, updateParams.internal.status.id, params)
            .then(response => {
                this.user = UtilsNew.objectClone(response.responses[0].results[0]);
                this.updatedFields = {};
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `User Status Update`,
                    message: `User ${this.userId} status has been updated correctly`,
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "userUpdate", this.user, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.user.internal?.status?.id) {
            return html `
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    The ${this.user.id} does not have a status ID.
                </div>
            `;
        }

        return html`
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
            display: this.displayConfig,
            sections: [
                {
                    title: "Current Status",
                    elements: [
                        {
                            title: "User ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                disabled: true,
                            }
                        },
                        {
                            title: "Status",
                            type: "complex",
                            display: {
                                containerClassName: "d-flex align-items-center",
                                template: "${internal.status}",
                                format: {
                                    // FIXME: Displaying original data this.user.internal.status. Should not be a complex element
                                    "internal.status": () => CatalogGridFormatter.userStatusFormatter(this.user?.internal?.status, this._config.display?.userStatus),
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Change Status",
                    description: "You can change the status of the user here",
                    display: {
                        // titleHeader: "h4",
                        // titleClassName: "d-block text-secondary"
                        // titleStyle: "",
                        // descriptionClassName: "d-block text-secondary",
                        // descriptionStyle: "",
                        // visible: () =>
                    },
                    elements: [
                        {
                            title: "New Status",
                            field: "internal.status.id",
                            type: "custom",
                            display: {
                                render: (status, dataFormFilterChange) => html `
                                    <user-status-filter
                                        .status="${status}"
                                        .config="${this._config.display?.userStatus}"
                                        .multiple="${false}"
                                        .forceSelection=${true}
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </user-status-filter>
                                `,
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("user-admin-status-update", UserAdminStatusUpdate);
