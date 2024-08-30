/**
 * Copyright 2015-2024 OpenCB *
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
 *
 */

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class OrganizationAdminUpdate extends LitElement {

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
                type: Object,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._organization = {};

        this.updatedFields = {};
        this.isLoading = false;
        this.displayConfig = {};
        this.displayConfigDefault = {
            style: "margin: 10px",
            defaultLayout: "horizontal",
            labelAlign: "right",
            buttonOkText: "Update",
            buttonOkDisabled: true,
        };
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
        this._organization = UtilsNew.objectClone(this.organization);
        // const {configuration, ...rest} = UtilsNew.objectClone(this.organization);
        // this._organization = {
        //     ...UtilsNew.objectClone(configuration),
        //     // token: {
        //     //     algorithm: "",
        //     //     secretKey: "",
        //     //     expiration: 0
        //     // },
        //     // defaultUserExpirationDate: "",
        // };
        this.updatedFields = {};
        this.displayConfigObserver();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("organization")) {
            this.#initOriginalObjects();
        }

        if (changedProperties.has("displayConfig")) {
            this.displayConfigObserver();
        }

        super.update(changedProperties);
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

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        this.updatedFields = FormUtils.getUpdatedFields(
            this.organization,
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
                LitUtils.dispatchCustomEvent(this, "organizationClear", null, {
                    organization: this._organization,
                });
            },
        });
    }

    onSubmit() {
        const params = {
            includeResult: true,
            authenticationOriginsAction: "SET",
        };

        let updateParams = FormUtils.getUpdateParams(this._organization, this.updatedFields, this.updateCustomisation);
        const {configuration, ...rest} = UtilsNew.objectClone(updateParams);
        delete updateParams.configuration;
        updateParams = {
            ...configuration,
            ...updateParams,
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.organization()
            .updateConfiguration(this.organization.id, updateParams, params)
            .then(() => {
                this._config = this.getDefaultConfig();
                this.updatedFields = {};
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `Organization Configuration Update`,
                    message: `Organization ${this.organization.id} updated correctly`,
                });
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest", this._organization, {}, error);
                LitUtils.dispatchCustomEvent(this, "organizationUpdate", this._organization, {}, error);
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

        return html`
            <data-form
                .data="${this._organization}"
                .config="${this._config}"
                .updateParams="${this.updatedFields}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    // *** CONFIG ***
    getDefaultConfig() {
        return {
            display: this.displayConfig,
            sections: [
                // CAUTION 20240731 Vero: The update of this datapoint is not included in the endpoint organization().updateConfiuration().
                //  Since currently the interface is just displaying a button for updating the configuration,
                //  and for consistency conceived to use a single endpoint per modal, it needs to be discussed with CTO or line-manager
                //  where to place this endpoint it in IVA (if needed).
                /*
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Organization Name",
                            field: "name",
                            type: "input-text",
                        },
                    ],
                },
                 */
                {
                    title: "Token",
                    elements: [
                        {
                            title: "Token",
                            field: "token",
                            type: "object",
                            elements: [
                                {
                                    title: "Algorithm",
                                    field: "token.algorithm",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Change the algorithm...",
                                        helpMessage: "The default algorithm is HS256.",
                                    },
                                },
                                {
                                    title: "Secret Key",
                                    field: "token.secretKey",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Change the secret key...",
                                        helpMessage: "",
                                    },
                                },
                                {
                                    title: "Expiration",
                                    field: "token.expiration",
                                    type: "input-num",
                                    allowedValues: [0],
                                    display: {
                                        placeholder: "Change the expiration time...",
                                        helpMessage: "The expiration time is configured in seconds. The default expiration time is 3600s.",
                                    },
                                },
                            ],
                        }
                    ],
                },
                {
                    title: "Configurations",
                    elements: [
                        {
                            title: "Optimizations",
                            field: "configuration.optimizations",
                            type: "object",
                            elements: [
                                {
                                    title: "Simplify Permissions",
                                    field: "configuration.optimizations.simplifyPermissions",
                                    type: "checkbox",
                                },
                            ],
                        },
                        {
                            title: "Default User Expiration Date",
                            field: "defaultUserExpirationDate",
                            type: "input-date",
                            display: {
                                placeholder: "Change the default user expiration date"
                            },
                        },
                        {
                            title: "Authentication Origins",
                            field: "configuration.authenticationOrigins",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                showAddItemListButton: true,
                                showAddBatchListButton: true,
                                showResetListButton: true,
                                view: data => html`
                                    <div>${data?.id} - ${data?.host}</div>
                                `,
                            },
                            elements: [
                                {
                                    title: "ID",
                                    field: "configuration.authenticationOrigins[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ID...",
                                    },
                                },
                                {
                                    title: "Type",
                                    field: "configuration.authenticationOrigins[].type",
                                    type: "select",
                                    allowedValues: ["OPENCGA", "LDAP", "AzureAD", "SSO"],
                                    display: {
                                        placeholder: "Select a type...",
                                    },
                                },
                                {
                                    title: "Host",
                                    field: "configuration.authenticationOrigins[].host",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a Host...",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("organization-admin-update", OrganizationAdminUpdate);
