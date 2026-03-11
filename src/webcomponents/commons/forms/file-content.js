import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils.js";
import "../filters/catalog-search-autocomplete.js";

export default class FileContent extends LitElement {

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
            value: {
                type: String,
            },
            disabled: {
                type: Boolean,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._mode = "upload";
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
            <div class="mb-2 d-flex align-items-center gap-2">
                <input type="file"
                    class="form-control"
                    ?disabled="${this.disabled}"
                    @change="${event => this.onFileChange(event)}">
                <button class="btn btn-light ${this.disabled || !this.value ? "disabled" : ""}" @click="${event => this.onFileClear(event)}">
                    <i class="fa fa-trash-alt"></i>
                </button>
            </div>
            <div class="form-control overflow-auto ${this.disabled ? "bg-gray-200" : "bg-gray-100"}" style="min-height:40px; max-height: ${this._config.maxHeight}px;">
                <div class="font-monospace fs-7" style="white-space:pre-wrap;">${this.value}</div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("file-content", FileContent);
