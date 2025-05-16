import {LitElement, html} from "lit";
import LitUtils from "../utils/lit-utils.js";
import "../forms/select-token-filter.js";

export default class FileNameFilter extends LitElement {

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

    onNameFilterChange(event) {
        event.stopPropagation(); // prevent the event from bubbling up to the parent component
        event.stopImmediatePropagation(); // prevent other listeners of the same event from being called
        LitUtils.dispatchCustomEvent(this, "filterChange", null, {
            field: "name",
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
            <div class="mb-3">
                <div class="form-label mb-1">Filter by specific files:</div>
                <catalog-search-autocomplete
                    .value="${this.query?.name}"
                    .resource="${"FILE"}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${{
                        disabled: !!this.query?.path,
                    }}"
                    @filterChange="${event => this.onNameFilterChange(event)}">
                </catalog-search-autocomplete>
            </div>
            <div class="">
                <div class="form-label mb-1">Or filter by files that contains the following pattern (regexp) in the name:</div>
                <input
                    type="text"
                    .value="${(this.query?.path || "").slice(1)}"
                    class="form-control w-full"
                    ?disabled="${!!this.query?.name}"
                    placeholder=".*\\.vcf$"
                    @input="${event => this.onPathFilterChange(event)}"
                />
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("file-name-filter", FileNameFilter);
