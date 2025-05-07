/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html, nothing} from "lit";
import {JSONEditor} from "vanilla-jsoneditor";
import UtilsNew from "../../core/utils-new.js";
import "../download-button.js";

export default class JsonViewer extends LitElement {

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
            active: {
                type: Boolean
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.active = true;
        this.jsonView = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if ((changedProperties.has("data") || changedProperties.has("active") || changedProperties.has("config")) && this.active) {
            if (!this.jsonView) {
                this.initJsonView();
            } else {
                this.jsonView.update({json: this.data || {}});
            }
        }
    }

    initJsonView() {
        this.jsonView = new JSONEditor({
            target: this.querySelector(`#${this._prefix}JsonView`),
            props: {
                content: {
                    json: this.data || {},
                },
                mode: this._config?.mode || "tree",
                indentation: this._config?.indentation || 4,
                readOnly: true,
            }
        });
    }

    render() {
        if (!this.data) {
            return html`<h4>No valid data found</h4>`;
        }

        return html`
            ${this.showDownloadButton ? html`
                <div class="d-flex justify-content-end">
                    <download-button .json="${this.data}"></download-button>
                </div>
            ` : nothing}

            <div id="${this._prefix}JsonView" class="pt-2"></div>
        `;
    }

    getDefaultConfig() {
        return {
            showDownloadButton: true,
            indentation: 4,
            mode: "tree",
        };
    }

}

customElements.define("json-viewer", JsonViewer);
