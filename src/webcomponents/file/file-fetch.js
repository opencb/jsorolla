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
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";


export default class FileFetch extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            path: {
                type: String,
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
        this.JOB_ID = "file-fetch";

        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Fetch File",
            buttonClearText: "Discard Changes",

        };
        this.#initOriginalObjects();
    }

    #initOriginalObjects() {
        this._data = {};
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("path")) {
            this._data.path = `/${this.path}`;
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e) {
        this._data = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear Fetch File",
            message: "Are you sure to clear?",
            ok: () => {
                this.#initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const {jobId, ...data} = this._data;
        const params = {
            study: this.opencgaSession.study.fqn,
            jobId: jobId ?? `${this.JOB_ID}-${UtilsNew.getDatetime()}`,
        };
        debugger
        this.#setLoading(true);
        debugger
        this.opencgaSession.opencgaClient.files()
            .fetch(data, params)
            .then(() => {
                this.#initOriginalObjects();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Fetch File: Job launched",
                    message: `Job ${params.jobId} has been launched successfully`,
                });
                LitUtils.dispatchCustomEvent(this, "fileFetch", data);
            })
            .catch(error => {
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
                .data="${this._data}"
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
                    title: "General Information",
                    elements: [
                        {
                            title: "URL",
                            field: "url",
                            type: "input-text",
                            required: true,
                        },
                        {
                            title: "Path",
                            field: "path",
                            type: "input-text",
                            required: true,
                            display: {
                                defaultValue: `/${this.path}`,
                                disabled: true,
                            },
                        },
                    ],
                },
                /*
                Note 20241210 Vero: It has been discussed and decided not to utilise the analysis-utils component for
                populating the job parameters. It has issues, such as invoking the onClear() method after submitting
                the query or using the button name "Run Analysis".
                If the analysis-tools component is intended to be reusable for endpoints that execute jobs but are not
                true analysis tools, it will need to be refactored.
                */
                {
                    title: "Job Info",
                    elements: [
                        {
                            title: "Job ID",
                            field: "jobId",
                            type: "input-text",
                            display: {
                                placeholder: `${this.JOB_ID}-${UtilsNew.getDatetime()}`,
                                help: {
                                    text: "If empty then it is automatically initialized with the tool ID and current date"
                                }
                            },
                        },
                    ],
                }
            ],
        };
    }
}

customElements.define("file-fetch", FileFetch);
