
import {LitElement, html, nothing} from "lit";
// import ollama from 'ollama/browser';
import OpenAI from 'openai';


export default class InterpreterAi extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            notifications: {
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

    firstUpdated(_changedProperties) {
        // this.ollama();

        this.client = new OpenAI({
            baseURL: 'http://localhost:11434/v1',
            apiKey: "ollama", // This is the default and can be omitted
            dangerouslyAllowBrowser: true
        });
        this.openai();
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

    renderNotification(notification) {
        return html`
            <div class="d-flex gap-3 alert alert-warning mb-0 p-2">
                <div class="flex-grow-0">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="flex-grow-1">
                    <span>${notification.message}</span>
                </div>
            </div>
        `;
    }

    // async ollama() {
    //     this.response = await ollama.chat({
    //         model: 'deepseek-r1:7b',
    //         messages: [{ role: 'user', content: 'Which genes should I look at in the disease ' +  "'diabetes'"}],
    //     })
    //     console.log(this.response.message.content)
    //     this.requestUpdate();
    // }


    async openai() {
        const chatCompletion = await this.client.chat.completions.create({
            messages: [{ role: 'user', content: 'Say this is a test' }],
            model: 'deepseek-r1:7b',
        });
        console.log(chatCompletion)
        console.log(chatCompletion.choices[0].message.content)
        debugger
    }

    render() {
        return html`
            <div class="dropdown d-flex">
                <button class="btn ${this._config.display?.buttonClass}" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                    <i class="fas ${this._config.icon}"></i>
                    ${this.notifications?.length > 0 ? html`
                        <span class="fw-bold text-gray-600"> (${this.notifications?.length ?? 0})</span>
                    ` : nothing}
                </button>
                <div class="dropdown-menu dropdown-menu-end shadow ${this._config?.display?.contentClass}" style="${this._config.display?.contentStyle}">
                    ${this._config.title ? html`
                        <div class="fw-bold fs-5 mb-1">${this._config.title}</div>
                    ` : nothing}
                    <div class="d-flex flex-column gap-2 overflow-y-auto" style="max-height:320px;">
                        ${this.response?.message?.content}
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            icon: "fa-brain",
            title: "AI Interpreter",
            display: {
                buttonClass: "btn-light",
                contentClass: "p-2",
                contentStyle: "width: 400px;",
            },
        };
    }

}

customElements.define("interpreter-ai", InterpreterAi);
