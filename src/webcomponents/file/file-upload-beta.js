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

export default class FileUploadBeta extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            data: {
                type: Object
            },
            openModal: {
                type: Boolean,
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
        this.file = {};
        this.isLoading = false;
        this._prefix = UtilsNew.randomString(8);
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Save",

        };
        this.openModal = false,
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    // update(changedProperties) {
    //     if (changedProperties.has("isModal")) {
    //         this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
    //         this._config = this.getDefaultConfig();
    //         console.log("Data...", this.data);
    //     }
    //     super.update(changedProperties);
    // }

    updated(changedProperties) {
        /**
        * It has been moved here so that the first click works.
        */
        if (changedProperties.has("openModal")) {
            if (this.openModal) {
                console.log("should be open");
                this.openModalReport();
            }
        }

        $(`#${this._prefix}FileUploadBeta`).on("hide.bs.modal", e => {
            this.data = {};
            LitUtils.dispatchCustomEvent(this, "onCloseModal");
            this.openModal = false;
            console.log("Closed Modal");
        });
    }

    openModalReport() {
        $(`#${this._prefix}FileUploadBeta`).modal("show");
    }

    onFieldChange(e) {
        e.stopPropagation();
        this.file = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onClear() {
        $(`#${this._prefix}FileUploadBeta`).modal("hide");
    }

    async onSubmit(e) {
        e.stopPropagation();
        // reports/case/document.pdf
        this.file.path = `/reports/${this.data.id}/${this.data.interpretation.id}.pdf`;
        this.file.name = `${this.data.interpretation.id}-${Date.now()}-tmp.pdf`;
        this.file.fileformat = "UNKNOWN";
        this.file.bioformat = "NONE";
        this.file.type = "FILE";
        this.file.study = this.opencgaSession.study.fqn;
        this.file.parents = true;
        LitUtils.dispatchCustomEvent(this, "onUploadFile", this.file);
        this.onClear();
    }

    renderDataForm() {
        return html`
            <data-form
                .data="${this.file}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>`;
    }

    renderModalDataForm() {
        return html`
            <div class="modal fade" id="${this._prefix}FileUploadBeta" tabindex="-1"
                role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog" style="width: 768px;">
                    <div class="modal-content" style="padding: 12px;">
                        <div class="modal-header" style="padding: 5px 15px">
                            <h3>Save Report (Beta)</h3>
                        </div>
                        ${this.renderDataForm()}
                    </div>
                </div>
            </div>`;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return this.renderModalDataForm();

        // TODO render if this is not modal

    }

    getDefaultConfig() {
        // content, path, type
        // file, filename,fileformat,bioformat,study,description.parents
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
                    ],
                }
            ],
        });
    }

}

customElements.define("file-upload-beta", FileUploadBeta);
