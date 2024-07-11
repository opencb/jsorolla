/**
 * Copyright 2015-2023 OpenCB
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
import FormUtils from "../../commons/forms/form-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";

export default class StudyUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            studyId: {
                type: String
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
        this.study = {}; // Original object
        this._study = {}; // Updated object
        this.updatedFields = {};
        this.isLoading = false;
        this.updatedFields = {};
        this.displayConfig = {};
        this.displayConfigDefault = {
            style: "margin: 10px",
            defaultLayout: "horizontal",
            labelAlign: "right",
            buttonOkText: "Update",
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
        this._study = UtilsNew.objectClone(this.study);
        this.updatedFields = {};
        this.displayConfigObserver();
    }

    update(changedProperties) {
        if (changedProperties.has("studyId")) {
            this.studyIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfigObserver();
        }
        super.update(changedProperties);
    }

    studyIdObserver() {
        if (this.studyId && this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.studies()
                .info(this.studyId)
                .then(response => {
                    this.study = UtilsNew.objectClone(response.responses[0].results[0]);
                    this.#initOriginalObjects();
                })
                .catch(reason => {
                    error = reason;
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
                })
                .finally(() => {
                    LitUtils.dispatchCustomEvent(this, "studyInfo", this.user, {}, error);
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

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        this.updatedFields = FormUtils.getUpdatedFields(
            this.study,
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
                LitUtils.dispatchCustomEvent(this, "studyClear", null, {
                    study: this.study,
                });
            },
        });
    }

    onSubmit() {
        const params = {
            includeResult: true
        };
        const updateParams = FormUtils.getUpdateParams(this._study, this.updatedFields);

        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.studies()
            .update(this.study?.fqn, updateParams, params)
            .then(res => {
                this.study = UtilsNew.objectClone(res.responses[0].results[0]);
                this.updatedFields = {};
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Study Update",
                    message: `Study ${this.study.id} updated correctly`
                });
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest", this._study, {}, error);
                LitUtils.dispatchCustomEvent(this, "studyUpdate", this._study, {}, error);
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
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
                .data="${this._study}"
                .config="${this._config}"
                .updateParams="${this.updatedFields}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: this.displayConfig,
            sections: [
                {
                    elements: [
                        {
                            name: "Id",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                disabled: true,
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Study name...",
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Study description...",
                            }
                        },
                    ]
                },
            ],
        };
    }

}

customElements.define("study-update", StudyUpdate);
