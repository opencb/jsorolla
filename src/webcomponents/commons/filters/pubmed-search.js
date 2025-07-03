import {LitElement, html, nothing} from "lit";
import LitUtils from "../utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";

export default class PubmedSearch extends LitElement {

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
                type: Object
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this._results = null;
        this._searchActive = true;
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

    async searchPubmed(term) {
        // https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=123456&retmode=json
        // https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=123456,12345&retmode=json
        const termsResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${term}&retmode=json`);
        const termsData = await termsResponse.json();
        if (termsData?.esearchresult?.idlist?.length > 0) {
            const ids = termsData.esearchresult.idlist.slice(0, this._config.limit);
            const summariesResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`);
            const summariesData = await summariesResponse.json();
            if (summariesData?.result) {
                return ids.map(id => {
                    const item = summariesData.result[id];
                    return {
                        id: item.uid,
                        title: item.title || item.shorttitle || "No title available",
                        journal: item.source || "-",
                        volumne: item.volume || "",
                        issue: item.issue || "",
                        pages: item.pages || "",
                        date: item.pubdate || item.sortpubdate || "",
                        authors: (item.authors || []).map(author => author.name),
                    };
                });
            }
        }
        // no ids found, so return an empty array
        return [];
    }

    onSearch() {
        const term = this.querySelector("input").value.trim();
        if (term) {
            this._results = null;
            this._searchActive = false;
            this.requestUpdate();
            this.searchPubmed(term)
                .then(results => {
                    this._results = results;
                }).catch(error => {
                    console.error("Error fetching PubMed data:", error);
                    this._results = null;
                })
                .finally(() => {
                    this._searchActive = true;
                    this.requestUpdate();
                });
        }
    }

    onFilterChange(e) {
        const value = e.detail.value;
        const data = e.detail.data.selected ? e.detail.data : {};
        if (!UtilsNew.isEmpty(data)) {
            // 1. To remove internal keys from select2 that are not part of the data model.
            const internalKeys = ["selected", "text"];
            internalKeys.forEach(key => delete data[key]);
            // 2. To filter out entries with undefined values
            Object.keys(data).forEach(key => typeof data[key] === "undefined" && delete data[key]);
        }
        // 3. To dispatch event with value autocompleted and data filtered
        LitUtils.dispatchCustomEvent(this, "filterChange", value, {
            data: data,
        });
    }

    renderResultItem(item) {
        return html`
            <div class="dropdown-item d-flex flex-column" @click="${() => null}">
                <div class="fw-bold">${item.title}</div>
                <div class="text-secondary">
                    ${item.authors.join(", ")}
                </div>
                <div class="text-muted small">
                    <span>${item.journal}.</span>
                    <span>${item.date};</span>
                    <span>${item.volumne ? `${item.volumne}` : ""}</span>
                    <span>${item.issue ? `(${item.issue})` : ""}</span>
                    <span>${item.pages ? `:${item.pages}` : ""}</span>
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="dropdown">
                <div class="input-group">
                    <!--
                    <span class="input-group-text bg-white pe-2">
                        <i class="fa ${this._config.icon} text-gray-700 py-1 fs-5"></i>
                    </span>
                    -->
                    <input
                        type="text"
                        class="form-control border-start-0 px-2 lh-1"
                        placeholder="${this._config.placeholder}"
                    />
                    <button class="btn btn-primary d-flex align-items-center gap-2 flex-shrink-0 ${!this._searchActive ? "disabled" : ""}" @click="${() => this.onSearch()}">
                        ${this._searchActive ? html`
                            <i class="fa fa-search"></i>
                        ` : html`
                            <span class="spinner-border spinner-border-sm"></span>
                        `}
                        <span>Search</span>
                    </button>
                </div>
                ${this._results ? html`
                    <div class="dropdown-menu show w-full overflow-y-auto shadow" style="max-height:320px;">
                        ${this._results.map((item, index) => this.renderResultItem(item))}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            limit: 20,
            placeholder: "Type to search by PubMed ID or title...",
        };
    }

}

customElements.define("pubmed-search", PubmedSearch);
