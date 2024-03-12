import {LitElement, html} from "lit";

export default class PharmacogenomicsSummary extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variant: {
                type: String,
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.active = true;
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    render() {
        return html`
            <div>Pharmacogenomics Summary</div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("pharmacogenomics-summary", PharmacogenomicsSummary);
