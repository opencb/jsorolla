import {LitElement, html, nothing} from "lit";

export default class EmptyState extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            icon: {
                type: String,
            },
            title: {
                type: String,
            },
            description: {
                type: String,
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
                ...this.config
            };
        }

        super.update(changedProperties);
    }

    render() {
        return html`
            <div class="d-flex flex-column align-items-center justify-content-between py-5 my-5 bg-white rounded-3 border border-1 border-gray-200">
                ${this.icon ? html`
                    <div class="d-flex text-gray-800 mb-2">
                        <i class="fas ${this.icon} display-1"></i>
                    </div>
                ` : nothing}
                ${(this.title || this.description) ? html`
                    <div class="d-flex flex-column align-items-center gap-3" style="max-width:560px;">
                        ${this.title ? html`
                            <h2 class="mb-0 text-center fw-bold">${this.title}</h2> 
                        ` : nothing}
                        ${this.description ? html`
                            <p class="text-center fs-5 text-gray-700">${this.description}</p>
                        ` : nothing}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("empty-state", EmptyState);
