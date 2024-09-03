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

import {LitElement, html} from "lit";
import {JSONEditor} from "vanilla-jsoneditor";
import UtilsNew from "../../core/utils-new.js";
import "../download-button.js";

export default class JsonViewer extends LitElement {

    constructor() {
        super();
        this._init();
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

    _init() {
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
            ${this._config?.showDownloadButton ? html`
                <div class="text-right" style="margin-bottom:8px;">
                    <download-button
                        .json="${this.data}"
                        .class="${"btn-sm"}">
                    </download-button>
                </div>
            ` : null}
            <div id="${this._prefix}JsonView"></div>
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
