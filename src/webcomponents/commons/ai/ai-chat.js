import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";

export default class AIChat extends LitElement {

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

    render() {
        return html`
            <div class="ai-chat-window">
                <div class="py-4 fs-1">
                    <span class="fw-bold">XetaBase</span>
                    <span class="fw-bolder ai-text">AI</span>
                </div>
                <div class="fs-5 mb-2">How cal I help you today?</div>
                <textarea class="form-control mb-2" rows="3"></textarea>
                <button class="btn ai-btn d-flex align-items-center justify-content-center gap-2 w-full">
                    <i class="fas fa-paper-plane"></i>
                    <span>Execute with AI</span>
                </button>
            </div>
        `;
    }

    getDefaultConfig() {
        return {

        };
    }

}

customElements.define("ai-chat", AIChat);
