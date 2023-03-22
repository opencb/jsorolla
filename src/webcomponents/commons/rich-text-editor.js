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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import Editor from "@toast-ui/editor";
import LitUtils from "./utils/lit-utils.js";
import "@toast-ui/editor/dist/toastui-editor.css";

export default class RichTextEditor extends LitElement {

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
        if (changedProperties.has("data") && changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.isViewer = this._config.viewer;
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

    fieldChange() {
        this.updateContent = this.textEditor.getHTML();
        LitUtils.dispatchCustomEvent(this, "contentChange", this.updateContent, null);
    }

    textEditorObserver() {
        if (this.textEditor) {
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
        if (this.isViewer || this._config.disabled) {
            this.textEditor = Editor.factory({
                el: textEditorElm,
                viewer: this.isViewer,
                initialValue: this.data || "",
                height: this._config.height,
            });
        } else {
            this.textEditor = Editor.factory({
                el: textEditorElm,
                viewer: this.isViewer,
                height: this._config.height,
                initialEditType: this._config.editMode, // "wysiwyg or markdown",
                toolbarItems: this._config.toolbarItems,
                hideModeSwitch: this._config.hideModeSwitch,
                previewStyle: this._config.previewStyle,
            });
        }
        this.textEditor.on("change", e => this.fieldChange());
    }

    // Allow to show or hide

    onChangeMode() {
        this.isViewer = !this.textEditor.isViewer();
        this.btnName = this.isViewer ? "Edit" : "Preview";
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
            height: "400px",
            previewStyle: "vertical",
            usageStatistics: false,
            disabled: false
        };
    }

    render() {
        const styleContent = this.isViewer ? "overflow-y: scroll; padding:1%; height:400px; border:1px solid #dadde6": "height:400px;";
        if (this._config?.preview) {
            return html `<div id="${this.textEditorId}" style="${styleContent}"></div>`;
        }

        return html`
            ${this._config?.viewer ? html`
                <button class="btn btn-default" style="margin-bottom:8px" ?disabled="${this._config.disabled}" @click="${e => this.onChangeMode()}">
                    <i class="fa fa-edit" aria-hidden="true"></i> ${this.btnName}
                </button>` : nothing }
            <div id="${this.textEditorId}" style="${styleContent}"></div>`;
    }

}

customElements.define("rich-text-editor", RichTextEditor);
