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
        this._term = "";
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
        this._results = null;
        this._term = this.querySelector("input").value.trim();
        if (this._term) {
            this._searchActive = false;
            this.requestUpdate();
            this.searchPubmed(this._term)
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

    onSelectItem(item) {
        LitUtils.dispatchCustomEvent(this, "filterChange", item);
        this.onClear();
    }

    onKeyDown(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            this.onSearch();
        }
    } 

    onClear() {
        this.querySelector("input").value = "";
        this._results = null;
        this.requestUpdate();
    }

    renderResults() {
        if (this._results.length === 0) {
            return html`
                <div class="d-flex flex-column gap-1 justify-content-center align-items-center py-3">
                    <div class="text-center">
                        <i class="fas fa-search fs-3"></i>
                    </div>
                    <div class="fw-bold fs-5">No results found.</div>
                    <div class="text-muted text-center">
                        Your search <b>${this._term}</b> did not match any article in PubMed.<br>Please try with a different PubMed ID or text.
                    </div>
                </div>
            `;
        }
        return this._results.map(item => {
            return html`
                <div class="dropdown-item d-flex flex-column cursor-pointer" @click="${() => this.onSelectItem(item)}">
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
        });
    }

    render() {
        return html`
            <div class="dropdown">
                <div class="input-group">
                    <span class="input-group-text bg-white pe-2">
                        <i class="fa fa-search text-gray-700 py-1 fs-6"></i>
                    </span>
                    <input
                        type="text"
                        class="form-control border-start-0 border-end-0 px-2 lh-1"
                        placeholder="${this._config.placeholder}"
                        @keydown="${event => this.onKeyDown(event)}"
                    />
                    ${this._results ? html`
                        <span class="input-group-text bg-white px-2 cursor-pointer" @click="${() => this.onClear()}">
                            <i class="fa fa-times text-gray-700 py-0 fs-5"></i>
                        </span>
                    ` : nothing}
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
                        ${this.renderResults()}
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
