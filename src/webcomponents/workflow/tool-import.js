import { html, LitElement } from "lit";

export default class ToolImport extends LitElement {

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
                type: Object
            },
        };
    }

    #init() {
        // Initialize component state
    }

    render() {
        return html`
            <div class="p-4">
                <h3>Hello World</h3>
                <p>Tool Import component - Coming soon!</p>
            </div>
        `;
    }
}

customElements.define("tool-import", ToolImport);
