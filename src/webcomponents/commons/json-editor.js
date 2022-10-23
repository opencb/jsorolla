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
        this._config = this.getDefaultConfig();
        this.showDownloadButton = true;
    }

    // firstUpdated() {
    //     console.log("firstUpdated");
    //     if (document.getElementById(this.jsonEditorId)) {
    //         this.initJsonEditor();
    //     }
    // }


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
                readOnly: this._config?.readOnly,
                onChange: (updatedContent, previousContent, {contentErrors, patchResult}) => this.filterChange(updatedContent, previousContent, {contentErrors, patchResult}),
            }
        });
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("data")) {
            console.log("data updated...", this.data);
            if (this.data) {
                if (document.getElementById(this.jsonEditorId) && !this.jsonEditor) {
                    this.initJsonEditor();
                }
                this.jsonEditor.update({json: this.data});
            }
        }
    }

    filterChange(updatedContent, previousContent, {contentErrors, patchResult}) {
        console.log("onChange", {updatedContent, previousContent, contentErrors, patchResult});
        this.data = updatedContent.text? JSON.parse(updatedContent.text) : updatedContent.json;
        LitUtils.dispatchCustomEvent(this, "filterChange", updatedContent, null);
    }

    getDefaultConfig() {
        return {
            readOnly: false,
        };
    }

    render() {
        if (!this.data) {
            return html`<h4>No valid data found</h4>`;
        }

        return html`
         ${this.showDownloadButton ? html`
                <div class="text-right">
                    <download-button
                        .json="${this.data}"
                        class="btn-sm">
                    </download-button>
                </div>
            ` : null
            }

            <div style="padding-top: 10px" id="${this.jsonEditorId}"></div>
        `;
    }

}

customElements.define("json-editor", JsonEditor);
