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
import UtilsNew from "../../../core/utils-new.js";
import AIUtils from "../utils/ai-utils.js";


export default class TextFieldFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
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
            classes: {
                type: String,
            },
            separator: {
                type: String,
            },
            type: {
                type: String,
            },
            min: {
                type: Number,
            },
            max: {
                type: Number,
            },
            step: {
                type: Number,
            },
            showAiButton: {
                type: Boolean,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(9);
        this.rows = 1;
        this.type = "text";
        this.min = undefined;
        this.max = undefined;
        this.step = 1;
        this.separator = ",";
        this.classes = "";
        this.showAiButton = false; // default to hidden for backward compatibility
        this._aiProcessing = false; // track AI processing state
        this._previousValue = null; // store previous value for undo
        this._canUndo = false; // track if undo is available
    }

    updated(changedProperties) {
        if (changedProperties.has("value")) {
            this.querySelector("#" + this._prefix + "-input").value = this.value ?? "";
        }
    }

    applySeparator(e) {
        let value;
        if (this.separator) {
            value = e.target.value ?
                e.target.value.trim()
                    // .replace(/\s/g, "") // this prevents using values with more than 1 word (e.g. "Cardiovascular disorders")
                    .split((new RegExp(`[${this.separator}]`)))
                    .filter(Boolean)
                    .join(this.separator) :
                null;
        } else {
            value = e.target.value ?? null;
        }

        return value;
    }

    filterChange(e) {
        let value = e.target.value || "";
        if (this.separator) {
            value = value.trim()
                // .replace(/\s/g, "") // this prevents using values with more than 1 word (e.g. "Cardiovascular disorders")
                .split((new RegExp(`[${this.separator}]`)))
                .filter(Boolean)
                .join(this.separator);
        }

        // Clear undo state on manual edit (not from AI transformation)
        if (!e.fromAi && this._canUndo) {
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

    blurChange(e) {
        const value = this.applySeparator(e);
        const event = new CustomEvent("blurChange", {
            detail: {
                value: value
            },
            bubbles: false,
            composed: true
        });
        this.dispatchEvent(event);
    }

    onUndoAi() {
        if (!this._canUndo || this._previousValue === null) {
            return;
        }

        const inputElement = this.querySelector(`#${this._prefix}-input`);
        if (inputElement) {
            // Restore previous value
            inputElement.value = this._previousValue;
            // Trigger change event (mark as from AI to prevent clearing undo state again)
            this.filterChange({target: inputElement, fromAi: true});
            // Clear undo state
            this._canUndo = false;
            this._previousValue = null;
            this.requestUpdate();
        }
    }

    onAiAction(action) {
        const inputElement = this.querySelector(`#${this._prefix}-input`);
        const currentText = inputElement?.value || "";

        if (!currentText && action !== "custom") {
            console.warn("No text to transform");
            return;
        }

        // Build prompt based on action
        let prompt = "";
        switch (action) {
            case "make-longer":
                prompt = `Expand and elaborate on the following text, making it longer and more detailed while preserving the original meaning:\n\n${currentText}`;
                break;
            case "make-shorter":
                prompt = `Condense the following text, making it shorter and more concise while keeping the key points:\n\n${currentText}`;
                break;
            case "more-formal":
                prompt = `Rewrite the following text in a more formal and professional tone:\n\n${currentText}`;
                break;
            case "more-casual":
                prompt = `Rewrite the following text in a more casual and conversational tone:\n\n${currentText}`;
                break;
            case "elaborate":
                prompt = `Elaborate on the following text, adding more details and explanations:\n\n${currentText}`;
                break;
            case "improve":
                prompt = `Improve the following text, fixing grammar, clarity, and style:\n\n${currentText}`;
                break;
            case "custom":
                const customTextarea = this.querySelector(`#${this._prefix}-custom-prompt`);
                const customPrompt = customTextarea?.value?.trim() || "";
                if (!customPrompt) {
                    alert("Please enter a custom instruction in the text area.");
                    return;
                }
                prompt = `${customPrompt}\n\nText to transform:\n${currentText}`;
                break;
            default:
                return;
        }

        // Store previous value for undo
        this._previousValue = currentText;

        // Call AI
        this._aiProcessing = true;
        this.requestUpdate();

        AIUtils.callGeminiAI(prompt)
            .then(responseText => {
                // Update input value
                inputElement.value = responseText;
                // Trigger change event (mark as from AI to prevent clearing undo state)
                this.filterChange({target: inputElement, fromAi: true});
                // Enable undo
                this._canUndo = true;
                // Clear custom prompt textarea if it was a custom action
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

    render() {
        const rows = this.rows ? this.rows : 1;
        const placeholder = (this.placeholder && this.placeholder !== "undefined") ? this.placeholder : "";

        return html`
            <div id="${this._prefix}-wrapper" class="position-relative">
                ${rows === 1 ? html`
                    <input
                        type="${this.type || "text"}"
                        id="${this._prefix}-input"
                        class="form-control ${this.classes}"
                        min="${this.min}"
                        max="${this.max}"
                        step="${this.step}"
                        ?disabled="${this.disabled || this._aiProcessing}"
                        ?required="${this.required}"
                        placeholder="${placeholder}"
                        @blur="${this.blurChange}"
                        @input="${this.filterChange}">
                ` : html`
                    <textarea
                        id="${this._prefix}-input"
                        rows="${rows}"
                        class="form-control ${this.classes}"
                        ?disabled="${this.disabled || this._aiProcessing}"
                        ?required="${this.required}"
                        placeholder="${placeholder}"
                        @blur="${this.blurChange}"
                        @input="${this.filterChange}">
                    </textarea>
                `}

                ${this.showAiButton ? html`
                    <div class="position-absolute d-flex gap-1" style="top: 8px; right: 8px; z-index: 10;">
                        ${this._canUndo ? html`
                            <button
                                class="btn btn-sm btn-light"
                                type="button"
                                @click="${() => this.onUndoAi()}"
                                title="Undo AI transformation">
                                <i class="fas fa-undo"></i>
                            </button>
                        ` : nothing}
                        <div class="dropdown">
                            <button
                                class="btn btn-sm ai-btn"
                                type="button"
                                data-bs-toggle="dropdown"
                                ?disabled="${this.disabled || this._aiProcessing}"
                                title="AI Text Options">
                                ${this._aiProcessing ? html`
                                    <i class="fas fa-spinner fa-spin"></i>
                                ` : html`
                                    <i class="fas fa-brain"></i>
                                `}
                            </button>
                        <div class="dropdown-menu dropdown-menu-end p-3" style="min-width: 300px;">
                            <div class="mb-2">
                                <label class="form-label small fw-bold mb-1">Custom Prompt</label>
                                <textarea
                                    id="${this._prefix}-custom-prompt"
                                    class="form-control form-control-sm mb-2"
                                    rows="2"
                                    placeholder="Enter your custom instruction..."
                                    @click="${e => e.stopPropagation()}"></textarea>
                                <button
                                    class="btn btn-sm btn-primary w-100"
                                    @click="${() => this.onAiAction('custom')}">
                                    <i class="fas fa-wand-magic-sparkles me-1"></i> Transform
                                </button>
                            </div>
                            <hr class="dropdown-divider my-2">
                            <div class="small text-muted mb-1">Quick Actions:</div>
                            <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction('make-longer')}">
                                <i class="fas fa-expand me-2"></i> Make longer
                            </a>
                            <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction('make-shorter')}">
                                <i class="fas fa-compress me-2"></i> Make shorter
                            </a>
                            <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction('more-formal')}">
                                <i class="fas fa-graduation-cap me-2"></i> More formal
                            </a>
                            <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction('more-casual')}">
                                <i class="fas fa-smile me-2"></i> More casual
                            </a>
                            <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction('elaborate')}">
                                <i class="fas fa-align-left me-2"></i> Elaborate
                            </a>
                            <a class="dropdown-item" href="javascript:void(0)" @click="${() => this.onAiAction('improve')}">
                                <i class="fas fa-star me-2"></i> AI Improve
                            </a>
                        </div>
                        </div>
                    </div>
                ` : nothing}
            </div>
        `;
    }

}

customElements.define("text-field-filter", TextFieldFilter);
