import {LitElement, html} from "lit";
import {GoogleGenAI} from "@google/genai";
import LitUtils from "../utils/lit-utils.js";
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
        const prompt = this.querySelector("textarea").value || "";
        if (!this._executing && this._apiKey && !!prompt) {
            this._executing = true;
            this.requestUpdate();
            this.updateComplete
                .then(() => {
                    const client = new GoogleGenAI({
                        apiKey: this._apiKey,
                    });
                    return client.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: typeof this._config.preparePrompt === "function" ? this._config.preparePrompt(prompt) : prompt,
                    });
                })
                .then(response => {
                    LitUtils.dispatchCustomEvent(this, "aiResponse", response.text);
                })
                .catch(error => {
                    console.error(error);
                })
                .finally(() => {
                    this._executing = false;
                    this.requestUpdate();
                });
        }
    }

    render() {
        return html`
            <div class="ai-chat-window">
                <div class="py-4 fs-1">
                    <span class="fw-bold">XetaBase</span>
                    <span class="fw-bolder ai-text">AI</span>
                </div>
                ${this._config.greeting ? html`
                    <div class="fs-5 mb-2">${this._config.greeting}</div>
                ` : nothing}
                <textarea class="form-control mb-2" rows="5" placeholder="${this._config.placeholder || ""}"></textarea>
                <button class="btn ai-btn d-flex align-items-center justify-content-center gap-2 w-full ${this._executing ? "active disabled" : ""}" @click="${() => this.onExecute()}">
                    <i class="fas fa-paper-plane"></i>
                    <span>${this._executing ? "Running..." : "Execute"}</span>
                </button>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            greeting: "How can I help you?",
            placeholder: "Type your question here...",
            preparePrompt: (inputText) => inputText,
        };
    }

}

customElements.define("ai-chat", AIChat);
