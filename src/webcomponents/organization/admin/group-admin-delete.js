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

export default class GroupAdminDelete extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            group: {
                type: Object,
            },
            active: {
                type: Boolean,
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
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Delete",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig,
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onSubmit() {
        this.#setLoading(true);
        let error;
        return this.opencgaSession.opencgaClient.studies()
            .updateGroups(this.group.fqn, {id: this.group.id}, {action: "REMOVE"})
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `Group Delete`,
                    message: `Group ${this.group.id} in study ${this.group.fqn} deleted successfully`,
                });
                LitUtils.dispatchCustomEvent(this, "groupDelete", {});
                LitUtils.dispatchCustomEvent(this, "studyUpdateRequest", {});
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
                .data="${this.group}"
                .config="${this._config}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    // title: `Are you sure you want to remove group '${this.group?.id}'?`,
                    elements: [
                        {
                            type: "notification",
                            text: "The following users could have unexpected permissions if you remove this group",
                            display: {
                                visible: true,
                                icon: "fas fa-exclamation-triangle",
                                notificationType: "error",
                            },
                        },
                        {
                            // name: "UserIds",
                            field: "users",
                            type: "list",
                            display: {
                                separator: " ",
                                contentLayout: "bullets",
                                transform: users => users.length ?
                                    users.map(user => ({userId: user.id})) :
                                    [{userId: "This group does not have users"}],
                                template: "${userId}",
                                // FIXME: why is not working?
                                // className: {
                                //     "userId": "badge badge-pill badge-primary",
                                // },
                                // style: {
                                //     "userId": {
                                //         "color": "white",
                                //         "background-color": "blue"
                                //     },
                                // }
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("group-admin-delete", GroupAdminDelete);
