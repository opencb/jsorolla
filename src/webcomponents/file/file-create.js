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
import "../commons/filters/catalog-search-autocomplete.js";

const FILE_TYPE = "FILE";

export default class FileCreate extends LitElement {

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
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Create File",
            buttonClearText: "Discard Changes",
        };

        this._formats = [];

        this.#initOriginalObjects();
    }

    #initOriginalObjects() {
        this._file = {
            type: FILE_TYPE,
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("path")) {
            this._file.path = `/${this.path}`;
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig,
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this._formats = {
            "formats": {
                endpoint: this.opencgaSession.opencgaClient.files().formats(),
                values: [],
            },
            "bioformats": {
                endpoint: this.opencgaSession.opencgaClient.files().bioformats(),
                values: [],
            },
        };
        // Retrieve from OpenCGA the list of defined formats and bioformats
        const promiseList = Object.keys(this._formats).map(promise => {
            return this._formats[promise]["endpoint"]
                .then(response => this._formats[promise]["values"] = response.getResponse().results)
                .catch( error => NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error))
        });
        Promise.all(promiseList)
            .then(() => {
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            });
    }


    onFieldChange(e) {
        this._file = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear File",
            message: "Are you sure to clear?",
            ok: () => {
                this.#initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        let {name, ...rest} = this._file;
        let data = {
            ...rest,
            path: `${this._file.path}${name}`,
        }
        let params = {
            study: this.opencgaSession.study.fqn,
        };
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.files()
            .create(data, params)
            .then(() => {
                this.#initOriginalObjects();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "File Create",
                    message: "File created correctly",
                });
                LitUtils.dispatchCustomEvent(this, "fileCreate", this._file);
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
                .data="${this._file}"
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
                            title: "Type",
                            field: "type",
                            type: "input-text",
                            required: true,
                            display: {
                                defaultValue: "FILE",
                                disabled: true,
                            },
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
                        {
                            title: "File Name",
                            field: "name",
                            required: true,
                            type: "input-text",
                            /*
                            validation:
                                validate: () => null,
                                message: "",
                            }
                             */
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                        },
                        {
                            title: "Format",
                            field: "format",
                            type: "select",
                            allowedValues: this._formats["formats"]?.values,
                            display: {
                                helpMessage: "Please select a format",
                            },
                        },
                        {
                            title: "Bioformat",
                            field: "bioformat",
                            type: "select",
                            allowedValues: this._formats["bioformats"]?.values,
                            display: {
                                helpMessage: "Please select a bioformat",
                            },
                        },
                        {
                            title: "Job ID",
                            field: "jobId",
                            type: "input-text",
                        },
                        {
                            title: "Sample IDs",
                            field: "sampleIds",
                            type: "custom",
                            display: {
                                render: (samples, dataFormFilterChange) => {
                                    debugger
                                    const handleSampleFilterChange = e => {
                                        debugger
                                        dataFormFilterChange(e.detail.value?.split(",") || []);
                                    };
                                    return html `
                                        <catalog-search-autocomplete
                                            .value="${samples?.join()}"
                                            .resource="${"SAMPLE"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            @filterChange="${e => handleSampleFilterChange(e)}">
                                        </catalog-search-autocomplete>
                                    `;
                                }
                            },
                        },
                        {
                            title: "Content",
                            field: "content",
                            type: "input-text",
                            required: true,
                            display: {
                                rows: 5,
                            }
                        },
                    ],
                },
            ],
        }
    }
}

customElements.define("file-create", FileCreate);
