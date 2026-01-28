import {LitElement, html, nothing} from "lit";
import {GoogleGenAI} from "@google/genai";
import LitUtils from "../utils/lit-utils.js";
import AIUtils from "../utils/ai-utils.js";
import UtilsNew from "../../../core/utils-new.js";

export default class AIChat extends LitElement {

    static STORAGE_GEMINI_API_KEY = "IVA_GEMINI_API_KEY";

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._executing = false;
        this._apiKey = window.localStorage.getItem(AIChat.STORAGE_GEMINI_API_KEY) || null;
        this._client = null;

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

    onExecute() {
        // In "input" mode, get the prompt from the textarea
        // In "summary" mode, use an empty string (preparePrompt will generate the full prompt)
        const prompt = this._config.mode === "summary" ? "" : (this.querySelector("textarea")?.value || "");

        // For input mode, require a prompt; for summary mode, always proceed
        const canExecute = this._config.mode === "summary" || !!prompt;

        if (!this._executing && this._apiKey && canExecute) {
            this._executing = true;
            this.requestUpdate();

            const finalPrompt = typeof this._config.preparePrompt === "function"
                ? this._config.preparePrompt(prompt)
                : prompt;

            this.updateComplete
                .then(() => AIUtils.callGeminiAI(finalPrompt))
                .then(responseText => {
                    LitUtils.dispatchCustomEvent(this, "aiResponse", responseText);
                })
                .catch(error => {
                    console.error(error);
                    LitUtils.dispatchCustomEvent(this, "aiError", error.message || "An error occurred");
                })
                .finally(() => {
                    this._executing = false;
                    this.requestUpdate();
                });
        }
    }

    renderInputMode() {
        return html`
            ${this._config.greeting ? html`
                <div class="fs-5 mb-2">${this._config.greeting}</div>
            ` : nothing}
            <textarea class="form-control mb-2" rows="5" placeholder="${this._config.placeholder || ""}"></textarea>
            <button class="btn ai-btn d-flex align-items-center justify-content-center gap-2 w-100 ${this._executing ? "active disabled" : ""}" @click="${() => this.onExecute()}">
                <i class="fas fa-paper-plane"></i>
                <span>${this._executing ? "Running..." : "Execute"}</span>
            </button>
        `;
    }

    renderSummaryMode() {
        // Get summary from config - can be a string or a function
        const summary = typeof this._config.summary === "function" ? this._config.summary() : this._config.summary;

        return html`
            ${summary ? html`
                <div class="fs-6 mb-3">${summary}</div>
            ` : nothing}
            <button class="btn ai-btn d-flex align-items-center justify-content-center gap-2 w-100 ${this._executing ? "active disabled" : ""}" @click="${() => this.onExecute()}">
                <i class="fas fa-wand-magic-sparkles"></i>
                <span>${this._executing ? "Generating..." : "Generate"}</span>
            </button>
        `;
    }

    render() {
        return html`
            <div class="ai-chat-window">
                <div class="py-4 fs-1">
                    <span class="fw-bold">XetaBase</span>
                    <span class="fw-bolder ai-text">AI</span>
                </div>
                ${!this._apiKey ? html`
                    <div class="alert alert-warning mb-2">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        <span>Gemini API key not configured. Please set <code>IVA_GEMINI_API_KEY</code> in localStorage.</span>
                    </div>
                ` : nothing}
                ${this._config.mode === "summary" ? this.renderSummaryMode() : this.renderInputMode()}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            mode: "input", // "input" or "summary"
            greeting: "How can I help you?",
            placeholder: "Type your question here...",
            summary: "", // Used in summary mode - can be a string or a function returning a string
            preparePrompt: (inputText) => inputText,
        };
    }

}

customElements.define("ai-chat", AIChat);
