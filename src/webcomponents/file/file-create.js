/**
 * Copyright 2015-2022 OpenCB
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
import Types from "../commons/types.js";
import "../commons/filters/catalog-search-autocomplete.js";
import UtilsNew from "../../core/utils-new.js";

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
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.file = {};
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Create"
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e) {
        e.stopPropagation();
        this.file = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear file",
            message: "Are you sure to clear?",
            ok: () => {
                this.file = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    //

    async onSubmit(e) {
        e.stopPropagation();
        const params = {
            study: this.opencgaSession.study.fqn,
            parents: true,
        };
        let error;
        this.#setLoading(true);

        try {
            console.log("Comming Soon!");
            // const dataContent = await UtilsNew.toBase64(this.file.fileUpload);
            // this.file.content = dataContent.split("base64,")[1].trim();
            // this.file.path = `/${params.study}/variants_file/${this.file.fileUpload.name}`;
            // this.file.parents = true;
            // this.file.format = "UNKNOWN";
            // delete this.file.fileUpload;

            // const response = this.opencgaSession.opencgaClient.files().create(this.file, params);
            // if (response.ok) {
            //     this.file = {};
            //     NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            //         title: "File Create",
            //         message: "File created correctly"
            //     });
            // }
            // return response;
        } catch (reason) {
            error = reason;
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
        } finally {
            LitUtils.dispatchCustomEvent(this, "fileCreate", this.file, {}, error);
            this.#setLoading(false);
        }
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this.file}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>`;
    }

    getDefaultConfig() {
        // content, path, type
        return Types.dataFormConfig({
            type: "form",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => Object?.keys(this.file).length > 0,
                                notificationType: "warning",
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description...",
                            },
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "object",
                            elements: [
                                {
                                    title: "ID",
                                    field: "status.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add an ID",
                                    }
                                },
                                {
                                    title: "Name",
                                    field: "status.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add source name"
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "status.description",
                                    type: "input-text",
                                    display: {
                                        rows: 2,
                                        placeholder: "Add a description..."
                                    }
                                },
                            ]
                        },
                        {
                            title: "Notes",
                            field: "attributes.notes",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description...",
                            },
                        },
                        {
                            title: "File Upload",
                            field: "fileUpload",
                            type: "custom",
                            save: value => value.target.files[0],
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: (file, dataFormFilterChange) => html`
                                    <span class="control-fileupload">
                                        <label for="file">Choose a file :</label>
                                        <input type="file" id="file" @change=${e => dataFormFilterChange(e)}>
                                    </span>`
                            },
                        },
                    ],
                }
            ],
        });
    }

}

customElements.define("file-create", FileCreate);
