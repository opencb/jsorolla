import {LitElement, html, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";

export default class SimpleStaticAutocomplete extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            values: {
                type: Array,
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._value = "";
        this._filteredValues = [];
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

    onSearch(event) {
        this._filteredValues = [];
        this._value = event.target.value || "";

        if (this._value) {
            this._filteredValues = this.values.filter(item => {
                return item.name.toLowerCase().includes(this._value.toLowerCase());
            });
        }

        this.requestUpdate();
    }

    onSelect(item) {
        LitUtils.dispatchCustomEvent(this, "filterChange", item);
    }

    renderValues() {
        if (this._filteredValues.length === 0) {
            return html`
                <div class="d-flex flex-column gap-1 justify-content-center align-items-center py-3">
                    <div class="text-center">
                        <i class="fas fa-search fs-3"></i>
                    </div>
                    <div class="fw-bold fs-5">No results found.</div>
                    <div class="text-muted text-center">
                        Your search <b>${this._value}</b> did not match any item.<br>Please try with a different keyword.
                    </div>
                </div>
            `;
        }

        // render a maximum of 'config.limit' items
        return this._filteredValues
            .slice(0, this._config.limit)
            .map(item => {
                return html`
                    <div class="dropdown-item cursor-pointer" @click="${() => this.onSelect(item)}">
                        ${item.name || item.id || item}
                    </div>
                `;
            });
    }

    render() {
        return html`
            <div class="dropdown">
                <div class="input-group">
                    <span class="input-group-text bg-white pe-2">
                        <i class="fa ${this._config.icon} text-gray-700 py-1 fs-5"></i>
                    </span>
                    <input
                        type="text"
                        class="form-control border-start-0 px-2 lh-1"
                        placeholder="${this._config.placeholder}"
                        @input="${event => this.onSearch(event)}"
                    >
                </div>
                ${this._value ? html`
                    <div class="dropdown-menu show w-full">
                        ${this.renderValues()}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            icon: "fa-search",
            placeholder: "Type to search...",
            limit: 10,
        };
    }

}

customElements.define("simple-static-autocomplete", SimpleStaticAutocomplete);
