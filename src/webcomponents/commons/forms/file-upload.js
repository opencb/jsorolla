/**
 * Copyright 2015-2019 OpenCB
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
import UtilsNew from "../../../core/utils-new.js";


export default class FileUpload extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.list = [];
    }

    updated(changedProperties) {
        if (changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    uploadFile(e) {
        const fileInput = document.getElementById("formFile");
        // check if the file exists!
        this.opencgaSession.opencgaClient.files().upload({file: fileInput.files[0]})

    }

    onFilterChange() {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: this.list
            }
        });
        this.dispatchEvent(event);
    }

    toggleCollapse(e) {
        $(`#${this._prefix}file-form`).collapse("toggle");
    }

    onDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        $(e.currentTarget).addClass("dragover");
    }

    onDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        $(e.currentTarget).removeClass("dragover");
    }
    getDefaultConfig() {
        return {
        };
    }

    render() {
        return html`
            <div class="mb-3">
                <label for="formFile" class="form-label">Default file input example</label>
                <input class="form-control" type="file" id="formFile">
                <button type="button" class="btn btn-primary" @click="${this.uploadFile}">Upload</button>
            </div>
        `;
    }

}

customElements.define("file-upload", FileUpload);
