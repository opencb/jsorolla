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
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils";

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
            studyFqn: {
                type: String,
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
        this.isStudyAdmin = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "I understand. Let's delete this group"
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
                ...this.displayConfig
            };
        }
        super.update(changedProperties);
    }

    onSubmit() {
        this.#setLoading(true);
        let error;
        return this.opencgaSession.opencgaClient.studies()
            .updateGroups(this.studyFqn, {id: this.group.id}, {action: "REMOVE"})
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `Group Delete`,
                    message: `Group ${this.group.id} in study ${this.studyId} deleted successfully`,
                });
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest", {}, {}, null);
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "groupDelete", {}, {
                    id: this.group.id,
                    study: this.studyFqn,
                }, error);
                this.#setLoading(false);

            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .config="${this._config}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>`;
    }

    getDefaultConfig() {
        return {
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "Do you really want to delete this group?",
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
                            type: "list",
                            display: {
                                contentLayout: "vertical",
                                getData: group => group.ids || ["This group does not have users"],
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("group-admin-delete", GroupAdminDelete);
