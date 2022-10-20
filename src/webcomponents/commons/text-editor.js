/*
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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

export default class TextEditor extends LitElement {

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
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.textEditor = null;
        this.textEditorId = this._prefix + "TextEditor";
        this.active = true;
        this._config = this.getDefaultConfig();
    }

    // firstUpdated(changedProperties) {
    //     if (changedProperties.has("data")) {
    //         this.initTextEditor();
    //     }
    // }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("data")) {
            if (this.data) {
                if (document.getElementById(this.textEditorId) && !this.textEditor) {
                    this.initTextEditor();
                    // this.textEditor.initialValue = this.data;
                }
                this.textEditorObserver();
            }
        }
    }

    textEditorObserver() {
        if (this.textEditor) {
            this.textEditor.setMarkdown(this.data, false);
        }
    }

    initTextEditor() {
        const textEditorElm = document.getElementById(this.textEditorId);
        this.textEditor = new Editor({
            el: textEditorElm,
            height: "500px",
            initialEditType: this._config.editMode, // "wysiwyg or markdown",
            previewStyle: "vertical"
        });
        this.textEditor.on("change", e => {
            console.log("getMarkdown", this.textEditor.getMarkdown());
        });
    }

    getDefaultConfig() {
        return {
            editMode: "wysiwyg"
        };
    }

    render() {
        if (!this.data) {
            return html`<h4>No valid data found</h4>`;
        }

        return html`
            <div id="${this.textEditorId}"></div>
        `;
    }

}

customElements.define("text-editor", TextEditor);
