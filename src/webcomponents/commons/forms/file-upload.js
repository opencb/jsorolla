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
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
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

    readFile(e) {
        const reader = new FileReader();
        reader.onload = () => {
            const plain = reader.result;
            // it handles split on ",", ";", "CR", "LF" and "CRLF"
            this.list.push(...plain.split(/\r\n|\r|\n|,|;/).filter(Boolean));
            this.requestUpdate();
            $(`#${this._prefix}file-form`).collapse("toggle");
            this.onFilterChange();
            // this.filterChange();
        };
        reader.readAsText(e.target.files[0] /* || e.dataTransfer.files[0]*/);
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
            <!--<div class="btn-group columns-toggle-wrapper">
                <button type="button" class="btn btn-light btn-small ripple btn-sm" aria-expanded="false" @click="\${this.toggleCollapse}">
                    <i class="fas fa-upload icon-padding" aria-hidden="true" id=""></i> Upload list
                </button>
            </div>-->

            <div class="collapse file-drop-area" id="${this._prefix}file-form">
                <form action="" method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <div class="d-flex align-items-center justify-content-center mt-2 border border-light-subtle text-body-tertiary"
                            style="cursor:pointer;border-style: dashed !important;border-width: 2px !important;height:100px;"
                            @change="${this.readFile}" @drop="${this.readFile}" @dragover="${this.onDragOver}" @dragleave="${this.onDragLeave}">
                            <div class="text-center">
                                <i class="fas fa-upload"></i>
                                <div>Choose an text file or drag it here.</div>
                            </div>
                            <input type="file" class="position-absolute opacity-0" />
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

}

customElements.define("file-upload", FileUpload);
