import {LitElement, html, nothing} from "lit";
import "../../commons/forms/data-form.js";

export default class ClinicalPreprocessingSelectFiles extends LitElement {

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
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <div>Hello world</div>
        `;
    }

    getDefaultConfig() {
        return {
        };
    }

}

customElements.define("clinical-preprocessing-select-files", ClinicalPreprocessingSelectFiles);
