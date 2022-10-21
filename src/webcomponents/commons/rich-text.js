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
import LitUtils from "./utils/lit-utils.js";
import "@toast-ui/editor/dist/toastui-editor.css";

export default class RichText extends LitElement {

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
        this.btnName = "Edit";
        this.updateContent = "";
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("data")) {
            this.initTextEditor();
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
            // Check if exist the element and not the textEditor Object
            if (this.data && document.getElementById(this.textEditorId) && !this.textEditor) {
                this.initTextEditor();
                // this.textEditor.initialValue = this.data;
            }

            // Check if exist the element and data
            if (this.data && document.getElementById(this.textEditorId)) {
                this.textEditorObserver();
            }
        }
    }

    filterChange() {
        this.updateContent = this.textEditor.getMarkdown();
        LitUtils.dispatchCustomEvent(this, "filterChange", this.updateContent, null);
    }

    textEditorObserver() {
        if (this.textEditor) {
            this.textEditor.setMarkdown(this.data, false);
            this.updateContent = this.data;
        }
    }

    /**
    * list of toolbarItems[] from textEditor
    * split by array
    * ["heading","bold","italic","strike"],
    * ["hr","quote"],
    * ["ul","ol","task","indent","outdent"],
    * ["table","image","link"],
    * ["code","codeblock"],
    *  ["scrollSync"]
    */

    initTextEditor() {
        const textEditorElm = document.getElementById(this.textEditorId);
        if (this._config.viewer || this._config.disabled) {
            this.textEditor = Editor.factory({
                el: textEditorElm,
                viewer: this._config.viewer,
                initialValue: this.data || "",
                height: this._config.height,
            });
        } else {
            this.textEditor = Editor.factory({
                el: textEditorElm,
                viewer: this._config.viewer,
                height: this._config.height,
                initialEditType: this._config.editMode, // "wysiwyg or markdown",
                toolbarItems: this._config.toolbarItems,
                hideModeSwitch: this._config.hideModeSwitch,
                previewStyle: this._config.previewStyle,
            });
            this.textEditor.on("change", e => this.filterChange());
        }
    }

    // Allow to show or hide

    onChangeMode() {
        this._config.viewer = !this.textEditor.isViewer();
        this.btnName = this._config.viewer ? "Edit" : "Preview";
        this.data = this.updateContent;
        this.textEditor.destroy();
        this.initTextEditor();
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            editMode: "wysiwyg", // "wysiwyg or markdown"
            toolbarItems: [
                ["heading", "bold", "italic", "strike"],
                ["hr", "quote"],
                ["ul", "ol", "indent", "outdent"],
            ],
            hideModeSwitch: true,
            viewer: true,
            height: "300px",
            previewStyle: "vertical",
            usageStatistics: false,
            disabled: false
        };
    }

    render() {
        return html`
            <button class="btn btn-default" style="margin-bottom:8px" @click="${e => this.onChangeMode()}">
                <i class="fa fa-edit" aria-hidden="true"></i> ${this.btnName}
            </button>
            <div id="${this.textEditorId}"></div>
        `;
    }

}

customElements.define("rich-text", RichText);
