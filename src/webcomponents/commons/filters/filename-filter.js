import {LitElement, html} from "lit";
import LitUtils from "../utils/lit-utils.js";
import "../forms/select-token-filter.js";

export default class FilenameFilter extends LitElement {

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
            query: {
                type: Object,
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    onNameFilterChange(event) {
        event.stopPropagation(); // prevent the event from bubbling up to the parent component
        event.stopImmediatePropagation(); // prevent other listeners of the same event from being called
        LitUtils.dispatchCustomEvent(this, "filterChange", null, {
            field: field,
            value: event.detail.value,
        });
    }

    onPathFilterChange(event) {
        LitUtils.dispatchCustomEvent(this, "filterChange", null, {
            field: "path",
            value: event.target?.value ? `~${event.target.value}` : null,
        });
    }

    render() {
        return html`
            <div class="mb-2">
                <div class="form-label">Filter by specific files:</div>
                <catalog-search-autocomplete
                    .value="${this.query?.["name"]}"
                    .resource="${"FILE"}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${{}}"
                    @filterChange="${event => this.onNameFilterChange(event)}">
                </catalog-search-autocomplete>
            </div>
            <div class="">
                <div class="form-label">Or filter by files that contains your pattern in the name:</div>
                <input
                    type="text"
                    class="form-control w-full"
                    placeholder=""
                    @input="${event => this.onPathFilterChange(event)}"
                />
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("filename-filter", FilenameFilter);
