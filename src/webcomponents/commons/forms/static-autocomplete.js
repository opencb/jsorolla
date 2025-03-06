import {LitElement, html, nothing} from "lit";
import LitUtils from "../utils/lit-utils.js";

export default class StaticAutocomplete extends LitElement {

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
                type: Object,
            },
        };
    }

    #init() {
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
                // check if there is a custom filter function
                if (typeof this._config.filter === "function") {
                    return this._config.filter(item, this._value);
                } else {
                    // fallback: use a basic filter that checks if the value is included in the item
                    // note that this assumes that the item is a string
                    return (item || "").toLowerCase().includes(this._value.toLowerCase());
                }
            });
        }

        this.requestUpdate();
    }

    onClear(event) {
        event.target.value = "";
        this._value = "";
        this._filteredValues = [];
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

        // note: using mousedown instead of click event as the click event is not fired when the input loses focus
        // the order of events are: onMouseDown -> onMouseUp -> onBlur -> onClick
        // see https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
        return this._filteredValues.map((item, index) => {
            return html`
                <div class="dropdown-item cursor-pointer" @mousedown="${() => this.onSelect(item)}">
                    ${typeof this._config.renderItem === "function" ? this._config.renderItem(item, index) : item}
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
                        @blur="${event => this.onClear(event)}"
                        @input="${event => this.onSearch(event)}">
                </div>
                ${this._value ? html`
                    <div class="dropdown-menu show w-full overflow-y-auto" style="max-height:320px;">
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
            filter: null,
            renderItem: null,
        };
    }

}

customElements.define("static-autocomplete", StaticAutocomplete);
