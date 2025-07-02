import {LitElement, html, nothing} from "lit";
import LitUtils from "../utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new";
import "../forms/select-token-filter.js";

export default class PubmedSearchAutocomplete extends LitElement {

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
            const ids = termsData.esearchresult.idlist;
            const summariesResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`);
            const summariesData = await summariesResponse.json();
            if (summariesData?.result) {
                return ids.map(id => {
                    return summariesData.result[id];
                });
            }
        }
        // no ids found, so return an empty array
        return [];
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

    render() {
        return html`
            <select-token-filter
                .keyObject="${"id"}"
                .config="${this._config}"
                @filterChange="${e => this.onFilterChange(e)}">
            </select-token-filter>
        `;
    }

    getDefaultConfig() {
        return {
            disabled: false,
            multiple: false,
            freeTag: false,
            limit: 10,
            maxItems: 0, // No limit set
            minimumInputLength: 3, // Only start searching when the user has input 3 or more characters
            // filterResults: this.#filterResults,
            // viewResultStyle: this.#viewResultStyle,
            // viewResult: this.#viewResult,
            // viewSelection: result => result[this.searchField],
            source: async (params, success, failure) => {
                // const page = params?.data?.page || 1;
                // const queryParams = {
                //     ...this.defaultQueryParams,
                //     ...this.RESOURCES[this.resource].queryParams,
                //     skip: (page - 1) * this._config.limit,
                // };
                if (params?.data?.term) {
                    return this.searchPubmed(params.data.term)
                        .then(response => {
                            success(response);
                        })
                        .catch(error => {
                            console.error(error);
                            failure(error);
                        });
                }
            },
            processResults: (results, params) => {
                return {
                    results: results.map(item => {
                        return {
                            id: item.uid,
                            title: item.title || item.shorttitle || "No title available",
                            journal: item.fulljournalname || item.source || "No journal available",
                            date: item.sortpubdate || item.pubdate || "",
                            authors: (item.authors || []).map(author => author.name),
                        };
                    }),
                };
            },
        };
    }

}

customElements.define("pubmed-search-autocomplete", PubmedSearchAutocomplete);
