import {LitElement, html} from "lit";

export default class PharmacogenomicsGrid extends LitElement {

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
        };
    }

    #init() {
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    render() {
        return html`
            <div>Pharmacogenomics Grid</div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("pharmacogenomics-grid", PharmacogenomicsGrid);
