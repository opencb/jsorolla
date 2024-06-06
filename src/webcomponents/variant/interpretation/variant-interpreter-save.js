import {LitElement, html} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";

class VariantInterpreterSave extends LitElement {

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
            clinicalAnalysis: {
                type: Object,
            },
            state: {
                type: Object,
            },
        };
    }

    #init() {
        this._data = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("state")) {
            this._data = {};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onSave() {
        LitUtils.dispatchCustomEvent(this, "saveInterpretationChanges", null, {
            comment: this._data?.comment,
        });
        this._data = {};
    }

    onClear() {
        LitUtils.dispatchCustomEvent(this, "clearInterpretationChanges", null, {});
        this._data = {};
    }

    render() {
        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            icon: "",
            display: {

            },
            sections: [
                {
                    title: "Summary",
                    elements: [
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-interpreter-save", VariantInterpreterSave);
