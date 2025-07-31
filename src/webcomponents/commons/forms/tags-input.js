import {LitElement, html, nothing} from "lit";
import LitUtils from "../utils/lit-utils.js";

export default class TagsInput extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            value: {
                type: Array,
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
        this.value = [];
        this._config = this.getDefaultConfig();
    }

    onKeyUp(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            this.onSubmit();
        }
    }

    onSubmit() {
        const tag = this.querySelector("input").value.trim();

        // if the tag is not empty and not already in the value array, add it
        if (tag && this.value.indexOf(tag) === -1) {
            this.value = [...this.value, tag];
            LitUtils.dispatchCustomEvent(this, "filterChange", this.value);
        }

        // after submitting, we have to clear the input
        this.querySelector("input").value = "";
        this.requestUpdate();
    }

    onRemoveTag(tag) {
        this.value = this.value.filter(t => t !== tag);
        LitUtils.dispatchCustomEvent(this, "filterChange", this.value);
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="d-flex gap-2">
                <div class="flex-grow-1">
                    <input
                        type="text"
                        class="form-control"
                        placeholder="${this._config?.placeholder || "Add a tag..."}"
                        ?disabled="${this.disabled}"
                        @keyup="${event => this.onKeyUp(event)}" />
                </div>
                <div class="shrink-0">
                    <button class="btn btn-primary" @click="${() => this.onSubmit()}" ?disabled="${this.disabled}">
                        <span>Add Tag</span>
                    </button>
                </div>
            </div>
            ${this.value?.length > 0 ? html`
                <div class="mt-3 d-flex flex-wrap gap-2">
                    ${this.value.map(tag => html`
                        <span class="badge bg-secondary d-flex align-items-center gap-2 hover:text-decoration-line-through cursor-pointer" @click="${() => this.onRemoveTag(tag)}">
                            <span>${tag}</span>
                            <span class="text-white">
                                <i class="fa fa-times"></i>
                            </span>
                        </span>
                    `)}
                </div>
            ` : nothing}
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("tags-input", TagsInput);
