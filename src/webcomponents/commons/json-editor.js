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
import {JSONEditor} from "vanilla-jsoneditor";
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
        this.jsonEditor = null;
        this.jsonEditorId = this._prefix + "jsoneditor";
        this._data = {};
        this._config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("config")) {
            console.log("init data...");
            this._data = this._config?.initAsArray ? [] : {};
        }
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("data")) {
            // If element exist and the jsonEditor Obj not exist
            if (document.getElementById(this.jsonEditorId) && !this.jsonEditor) {
                this.initJsonEditor();
            }

            // We need to check if the current JSON displayed is the same that the one being passed.
            // This avoids the cursor to move to the beginning.
            if (this.jsonEditor && !UtilsNew.isEqual(JSON.stringify(this._data), JSON.stringify(this.data))) {
                this.jsonEditor.update({json: this.data});
            }
        }
    }

    initJsonEditor() {
        const content = {
            json: this.data ? this.data : {}
        };

        const editorElm = document.getElementById(this.jsonEditorId);
        // Create Editor
        this.jsonEditor = new JSONEditor({
            target: editorElm,
            props: {
                content,
                mode: this._config?.mode || "text",
                indentation: this._config?.indentation || 4,
                readOnly: this._config?.readOnly ?? false,
                onChange: (updatedContent, previousContent, {contentErrors, patchResult}) =>
                    this.onFilterChange(updatedContent, previousContent, {contentErrors, patchResult}),
                onError: err => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                        message: err
                    });
                },
                onRenderMenu: (mode, items) => {
                    // Remove transforms we don't need for the moment
                    return items.filter(item => item.className !== "jse-transform");
                },
            }
        });
    }

    onFilterChange(updatedContent, previousContent, {contentErrors, patchResult}) {
        try {
            // updatedContent is an object which content 2 props (text & json)
            this.data = updatedContent.text ? JSON.parse(updatedContent.text) : updatedContent.json;
            // Copy the updated content
            this._data = UtilsNew.objectClone(this.data);
        } catch {}
        LitUtils.dispatchCustomEvent(this, "fieldChange", {
            json: {...this.data},
            text: updatedContent?.text
        }, null);
    }

    render() {
        if (!this.data && !this.jsonEditor) {
            return html`<h4>No valid data found</h4>`;
        }

        return html`
            ${this._config.showDownloadButton ? html`
                <div class="float-end">
                    <download-button
                        .json="${this.data}"
                        classes="${"btn btn-light my-2"}">
                    </download-button>
                </div>
            ` : nothing}
            <div class="pt-2" id="${this.jsonEditorId}"></div>
        `;
    }

    getDefaultConfig() {
        return {
            mode: "text", // Two accepted values: text, tree.
            indentation: 4,
            readOnly: false,
            initAsArray: false,
            showDownloadButton: true
        };
    }

}

customElements.define("json-editor", JsonEditor);
