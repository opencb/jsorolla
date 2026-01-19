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

import {html, LitElement, nothing} from "lit";
import {createJSONEditor} from "vanilla-jsoneditor";
import NotificationUtils from "./utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "./utils/lit-utils.js";
import "../download-button.js";

export default class JsonEditor extends LitElement {

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
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._data = {}; // internal copy of the data to avoid performing additional updates
        this._editor = null;
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
        if (changedProperties.has("data")) {
            if (!this._editor) {
                this.initEditor();
                this._data = UtilsNew.objectClone(this.data);
            }

            // We need to check if the current JSON displayed is the same that the one being passed.
            // This avoids the cursor to move to the beginning.
            if (this._editor && JSON.stringify(this._data) !== JSON.stringify(this.data)) {
                this._editor.update({
                    json: this.data,
                });
            }
        }
    }

    initEditor() {
        this._editor = createJSONEditor({
            target: this.querySelector(`#${this._prefix}-editor`),
            props: {
                content: {
                    json: this.data || {},
                },
                mode: this._config?.mode || "text",
                indentation: this._config?.indentation || 4,
                readOnly: this._config?.readOnly ?? false,
                onChange: (updatedContent, previousContent, {contentErrors, patchResult}) => {
                    this.onFilterChange(updatedContent, previousContent, {contentErrors, patchResult});
                },
                onError: errorMessage => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                        message: errorMessage,
                    });
                },
            }
        });
    }

    onFilterChange(updatedContent) {
        try {
            // internally copy the updated content to avoid performing additional updates
            this._data = updatedContent.text ? JSON.parse(updatedContent.text) : UtilsNew.objectClone(updatedContent.json);

            // dispatch the fieldChange event with the updated JSON 
            LitUtils.dispatchCustomEvent(this, "fieldChange", {
                json: this._data,
                text: updatedContent?.text
            });
        } catch (error) {
            // If the JSON is not valid, we can ignore the error, as the editor will handle it and the event won't be dispatched.
            // console.error("Error parsing JSON:", error);
        }
    }

    render() {
        if (!this.data) {
            return nothing;
        }

        return html`
            ${this._config.showDownloadButton ? html`
                <div class="d-flex justify-content-end">
                    <download-button
                        .json="${this._data}"
                        classes="${"btn btn-light my-2"}">
                    </download-button>
                </div>
            ` : nothing}
            <div class="pt-2" id="${this._prefix}-editor"></div>
        `;
    }

    getDefaultConfig() {
        return {
            mode: "text", // Two accepted values: text, tree.
            indentation: 4,
            readOnly: false,
            showDownloadButton: true
        };
    }

}

customElements.define("json-editor", JsonEditor);
