import {LitElement, html, nothing} from "lit";
import "../../commons/tool-header.js";

export default class PharmacogenomicsReport extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            sampleId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        super.update(changedProperties);
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId) {
            // TODO
        }
    }

    render() {
        return html`
            <div class="col-md-10 col-md-offset-1">
                ${this.config.showToolTitle ? html`
                    <tool-header class="bg-white" title="${"Pharmacogenomics"}"></tool-header>
                ` : nothing}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            showToolTitle: true,
        };
    }

}

customElements.define("pharmacogenomics-report", PharmacogenomicsReport);
