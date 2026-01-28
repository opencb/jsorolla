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

import {LitElement, html, nothing} from "lit";
import {marked} from "marked";
import UtilsNew from "../../../core/utils-new.js";
import AIUtils from "../utils/ai-utils.js";


export default class MarkdownEditor extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this; // Use light DOM for Bootstrap styling
    }

    static get properties() {
        return {
            value: {
                type: String,
            },
            placeholder: {
                type: String,
            },
            disabled: {
                type: Boolean,
            },
            required: {
                type: Boolean,
            },
            rows: {
                type: Number,
            },
            showAiButton: {
                type: Boolean,
            },
            classes: {
                type: String,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(9);
        this.rows = 10;
        this._mode = "edit"; // "edit" or "preview"
        this._aiProcessing = false;
        this._previousValue = null;
        this._canUndo = false;
        this._originalValue = null; // Store original value for reset
        this.showAiButton = false;
        this.classes = "";

        // Configure marked for safe rendering
        marked.setOptions({
            breaks: true,        // Convert \n to <br>
            gfm: true,          // GitHub Flavored Markdown
            headerIds: false,    // Don't add IDs to headers
            mangle: false,       // Don't mangle email addresses
        });
    }

    updated(changedProperties) {
        if (changedProperties.has("value")) {
            const textarea = this.querySelector(`#${this._prefix}-textarea`);
            if (textarea && this._mode === "edit") {
                textarea.value = this.value ?? "";
            }
            // Store original value on first load (when value is actually set from outside)
            if (this._originalValue === null && changedProperties.get("value") === undefined) {
                this._originalValue = this.value ?? "";
            }
        }
    }

    // Event dispatching (same as text-field-filter)
    filterChange(e) {
        // Use explicit check to handle empty string correctly
        let value = e?.target ? e.target.value : (this.value || "");

        // Clear undo state on manual edit (not from AI transformation)
        if (!e?.fromAi && this._canUndo) {
            this._canUndo = false;
            this._previousValue = null;
            this.requestUpdate();
        }

        const event = new CustomEvent("filterChange", {
            detail: {
                value: value
            },
            bubbles: false,
            composed: true
        });
        this.dispatchEvent(event);
    }

    // Mode switching
    onModeChange(mode) {
        this._mode = mode;
        this.requestUpdate();
    }

    // Markdown formatting actions
    onFormat(action) {
        const textarea = this.querySelector(`#${this._prefix}-textarea`);
        if (!textarea) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const beforeText = textarea.value.substring(0, start);
        const afterText = textarea.value.substring(end);

        let newText = "";
        let newCursorPos = start;

        switch (action) {
            case "bold":
                newText = `${beforeText}**${selectedText || "bold text"}**${afterText}`;
                newCursorPos = selectedText ? end + 4 : start + 2;
                break;
            case "italic":
                newText = `${beforeText}_${selectedText || "italic text"}_${afterText}`;
                newCursorPos = selectedText ? end + 2 : start + 1;
                break;
            case "heading":
                newText = `${beforeText}## ${selectedText || "Heading"}${afterText}`;
                newCursorPos = selectedText ? end + 3 : start + 3;
                break;
            case "link":
                const url = selectedText.startsWith("http") ? selectedText : "https://";
                const linkText = selectedText.startsWith("http") ? "link text" : selectedText || "link text";
                newText = `${beforeText}[${linkText}](${url})${afterText}`;
                newCursorPos = start + 1;
                break;
            case "list":
                newText = `${beforeText}- ${selectedText || "List item"}${afterText}`;
                newCursorPos = selectedText ? end + 2 : start + 2;
                break;
            case "code":
                newText = `${beforeText}\`${selectedText || "code"}\`${afterText}`;
                newCursorPos = selectedText ? end + 2 : start + 1;
                break;
            case "quote":
                newText = `${beforeText}> ${selectedText || "Quote"}${afterText}`;
                newCursorPos = selectedText ? end + 2 : start + 2;
                break;
            default:
                return;
        }

        textarea.value = newText;
        this.value = newText;

        // Set cursor position
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();

        // Trigger change event
        this.filterChange({target: textarea});
    }

    // AI Integration (same pattern as text-field-filter)
    onAiAction(action) {
        const textarea = this.querySelector(`#${this._prefix}-textarea`);
        const currentText = textarea?.value || "";

        if (!currentText && action !== "custom") {
            console.warn("No text to transform");
            return;
        }

        let prompt = "";
        switch (action) {
            case "make-longer":
                prompt = `Expand and elaborate on the following markdown text, making it longer and more detailed while preserving the original meaning and markdown formatting:\n\n${currentText}`;
                break;
            case "make-shorter":
                prompt = `Condense the following markdown text, making it shorter and more concise while keeping the key points and markdown formatting:\n\n${currentText}`;
                break;
            case "more-formal":
                prompt = `Rewrite the following markdown text in a more formal and professional tone while maintaining markdown formatting:\n\n${currentText}`;
                break;
            case "more-casual":
                prompt = `Rewrite the following markdown text in a more casual and conversational tone while maintaining markdown formatting:\n\n${currentText}`;
                break;
            case "elaborate":
                prompt = `Elaborate on the following markdown text, adding more details and explanations while maintaining markdown formatting:\n\n${currentText}`;
                break;
            case "improve":
                prompt = `Improve the following markdown text, fixing grammar, clarity, and style while maintaining markdown formatting:\n\n${currentText}`;
                break;
            case "custom":
                const customTextarea = this.querySelector(`#${this._prefix}-custom-prompt`);
                const customPrompt = customTextarea?.value?.trim() || "";
                if (!customPrompt) {
                    alert("Please enter a custom instruction in the text area.");
                    return;
                }
                prompt = `${customPrompt}\n\nMarkdown text to transform:\n${currentText}`;
                break;
            default:
                return;
        }

        this._previousValue = currentText;
        this._aiProcessing = true;
        this.requestUpdate();

        AIUtils.callGeminiAI(prompt)
            .then(responseText => {
                textarea.value = responseText;
                this.value = responseText;
                this.filterChange({target: textarea, fromAi: true});
                this._canUndo = true;

                if (action === "custom") {
                    const customTextarea = this.querySelector(`#${this._prefix}-custom-prompt`);
                    if (customTextarea) {
                        customTextarea.value = "";
                    }
                }
            })
            .catch(error => {
                console.error("AI transformation error:", error);
                alert("AI transformation failed: " + (error.message || "Unknown error"));
            })
            .finally(() => {
                this._aiProcessing = false;
                this.requestUpdate();
            });
    }

    onUndoAi() {
        if (!this._canUndo || this._previousValue === null) {
            return;
        }

        const textarea = this.querySelector(`#${this._prefix}-textarea`);
        if (textarea) {
            textarea.value = this._previousValue;
            this.value = this._previousValue;
            // Trigger change event (mark as from AI to prevent clearing undo state again)
            this.filterChange({target: textarea, fromAi: true});
            // Clear undo state
            this._canUndo = false;
            this._previousValue = null;
            this.requestUpdate();
        }
    }

    onReset() {
        if (this._originalValue === null) {
            return;
        }

        const textarea = this.querySelector(`#${this._prefix}-textarea`);
        if (textarea) {
            textarea.value = this._originalValue;
            this.value = this._originalValue;
            // Trigger change event
            this.filterChange({target: textarea});
            // Clear undo state
            this._canUndo = false;
            this._previousValue = null;
            this.requestUpdate();
        }
    }

    // Render toolbar
    renderToolbar() {
        return html`
            <div class="d-flex align-items-center gap-2 mb-2 border-bottom pb-2">
                <!-- Text formatting -->
                <div class="btn-group" role="group">
                    <button
                        type="button"
                        class="btn btn-sm btn-light"
                        @click="${() => this.onFormat("bold")}"
                        ?disabled="${this.disabled || this._aiProcessing}"
                        title="Bold">
                        <i class="fas fa-bold"></i>
                    </button>
                    <button
                        type="button"
                        class="btn btn-sm btn-light"
                        @click="${() => this.onFormat("italic")}"
                        ?disabled="${this.disabled || this._aiProcessing}"
                        title="Italic">
                        <i class="fas fa-italic"></i>
                    </button>
                </div>

                <div style="width: 1px; height: 24px; background-color: #dee2e6;"></div>

                <!-- Structure -->
                <div class="btn-group" role="group">
                    <button
                        type="button"
                        class="btn btn-sm btn-light"
                        @click="${() => this.onFormat("heading")}"
                        ?disabled="${this.disabled || this._aiProcessing}"
                        title="Heading">
                        <i class="fas fa-heading"></i>
                    </button>
                    <button
                        type="button"
                        class="btn btn-sm btn-light"
                        @click="${() => this.onFormat("list")}"
                        ?disabled="${this.disabled || this._aiProcessing}"
                        title="List">
                        <i class="fas fa-list"></i>
                    </button>
                    <button
                        type="button"
                        class="btn btn-sm btn-light"
                        @click="${() => this.onFormat("quote")}"
                        ?disabled="${this.disabled || this._aiProcessing}"
                        title="Quote">
                        <i class="fas fa-quote-right"></i>
                    </button>
                </div>

                <div style="width: 1px; height: 24px; background-color: #dee2e6;"></div>

                <!-- Insert -->
                <div class="btn-group" role="group">
                    <button
                        type="button"
                        class="btn btn-sm btn-light"
                        @click="${() => this.onFormat("link")}"
                        ?disabled="${this.disabled || this._aiProcessing}"
                        title="Link">
                        <i class="fas fa-link"></i>
                    </button>
                    <button
                        type="button"
                        class="btn btn-sm btn-light"
                        @click="${() => this.onFormat("code")}"
                        ?disabled="${this.disabled || this._aiProcessing}"
                        title="Inline Code">
                        <i class="fas fa-code"></i>
                    </button>
                </div>

                <!-- Action buttons (right side) -->
                <div class="ms-auto d-flex gap-1">
                    ${this._canUndo ? html`
                        <button
                            type="button"
                            class="btn btn-sm btn-light"
                            @click="${() => this.onUndoAi()}"
                            title="Undo AI transformation">
                            <i class="fas fa-undo"></i>
                        </button>
                    ` : nothing}
                    ${this._originalValue !== null && this.value !== this._originalValue ? html`
                        <button
                            type="button"
                            class="btn btn-sm btn-light"
                            @click="${() => this.onReset()}"
                            title="Reset to original value">
                            <i class="fas fa-sync"></i>
                        </button>
                    ` : nothing}
                    ${this.showAiButton ? html`
                        <div class="dropdown">
                            <button
                                type="button"
                                class="btn btn-sm ai-btn"
                                data-bs-toggle="dropdown"
                                ?disabled="${this.disabled || this._aiProcessing}"
                                title="AI Text Options">
                                ${this._aiProcessing ? html`
                                    <i class="fas fa-spinner fa-spin"></i>
                                ` : html`
                                    <i class="fas fa-brain"></i>
                                `}
                            </button>
                            <div class="dropdown-menu dropdown-menu-end p-3" style="min-width: 320px;">
                                <div class="mb-2">
                                    <label class="form-label small fw-bold mb-1">Custom Prompt</label>
                                    <textarea
                                        id="${this._prefix}-custom-prompt"
                                        class="form-control form-control-sm mb-2"
                                        rows="3"
                                        placeholder="Enter your custom instruction..."
                                        @click="${e => e.stopPropagation()}"></textarea>
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-primary w-100"
                                        @click="${() => this.onAiAction("custom")}">
                                        <i class="fas fa-wand-magic-sparkles me-1"></i> Transform
                                    </button>
                                </div>
                                <hr class="dropdown-divider my-2">
                                <div class="small text-muted mb-1">Quick Actions:</div>
                                <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction("make-longer")}">
                                    <i class="fas fa-expand me-2"></i> Make longer
                                </a>
                                <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction("make-shorter")}">
                                    <i class="fas fa-compress me-2"></i> Make shorter
                                </a>
                                <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction("more-formal")}">
                                    <i class="fas fa-graduation-cap me-2"></i> More formal
                                </a>
                                <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction("more-casual")}">
                                    <i class="fas fa-smile me-2"></i> More casual
                                </a>
                                <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction("elaborate")}">
                                    <i class="fas fa-align-left me-2"></i> Elaborate
                                </a>
                                <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction("improve")}">
                                    <i class="fas fa-star me-2"></i> AI Improve
                                </a>
                            </div>
                        </div>
                    ` : nothing}
                </div>
            </div>
        `;
    }

    // Render Edit mode
    renderEditMode() {
        const placeholder = (this.placeholder && this.placeholder !== "undefined") ? this.placeholder : "";

        return html`
            ${this.renderToolbar()}
            <textarea
                id="${this._prefix}-textarea"
                class="form-control ${this.classes}"
                rows="${this.rows}"
                placeholder="${placeholder}"
                ?disabled="${this.disabled || this._aiProcessing}"
                ?required="${this.required}"
                .value="${this.value || ""}"
                @input="${e => this.filterChange(e)}"
                @blur="${e => this.filterChange(e)}"></textarea>
        `;
    }

    // Render Preview mode
    renderPreviewMode() {
        const markdown = this.value || "";
        let htmlContent = "";

        try {
            htmlContent = marked.parse(markdown);
        } catch (error) {
            console.error("Markdown parsing error:", error);
            htmlContent = "<p class='text-danger'>Error rendering markdown</p>";
        }

        return html`
            <div class="markdown-preview border rounded p-3 bg-light" style="min-height: ${this.rows * 24}px;">
                ${markdown ? html`
                    <div class="markdown-body" .innerHTML="${htmlContent}"></div>
                ` : html`
                    <p class="text-muted fst-italic">No content to preview</p>
                `}
            </div>
        `;
    }

    render() {
        return html`
            <div id="${this._prefix}-wrapper" class="markdown-editor">
                <!-- Mode tabs -->
                <ul class="nav nav-tabs mb-2" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button
                            class="nav-link ${this._mode === "edit" ? "active" : ""}"
                            type="button"
                            ?disabled="${this.disabled}"
                            @click="${() => this.onModeChange("edit")}">
                            <i class="fas fa-edit me-1"></i> Edit
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button
                            class="nav-link ${this._mode === "preview" ? "active" : ""}"
                            type="button"
                            @click="${() => this.onModeChange("preview")}">
                            <i class="fas fa-eye me-1"></i> Preview
                        </button>
                    </li>
                </ul>

                <!-- Content area -->
                <div class="tab-content">
                    ${this._mode === "edit" ? this.renderEditMode() : this.renderPreviewMode()}
                </div>
            </div>
        `;
    }

}

customElements.define("markdown-editor", MarkdownEditor);
