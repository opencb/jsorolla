import {LitElement, html, nothing} from "lit";
import {CellBaseClient} from "../../../core/clients/cellbase/cellbase-client.js";
import "../../commons/tool-header.js";
import "../../loading-spinner.js";

export default class PharmacogenomicsReport extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            sampleId: {
                type: String,
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.active = true;
        this.isLoading = false;
        this.variants = [];
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("sampleId") || changedProperties.has("opencgaSession") || changedProperties.has("active")) {
            this.sampleIdObserver();
        }
        super.update(changedProperties);
    }

    async sampleIdObserver() {
        this.variants = [];
        if (this.opencgaSession && this.sampleId && this.active) {
            this.isLoading = true;
            this.requestUpdate();
            // 0. Initialize Cellbase client instance
            const cellbaseClient = new CellBaseClient({
                // host: this.opencgaSession?.project?.cellbase?.url || this.opencgaSession?.project?.internal?.cellbase?.url,
                host: "https://ws.zettagenomics.com/cellbase",
                version: "v5.5",
                species: "hsapiens",
            });

            // 1. Import all PGx variants from Cellbase
            const pgxVariantsResponse = await cellbaseClient.get("clinical", "pharmacogenomics", null, "distinct", {
                field: "variants.location",
                assembly: "grch38",
                dataRelease: "5",
            });

            // 2. Get the list of variants available in OpenCGA
            const pgxVariants = pgxVariantsResponse.responses[0].results;
            const chunkSize = 200;
            const promises = [];
            for (let i = 0; i < pgxVariants.length; i = i + chunkSize) {
                const chunk = pgxVariants.slice(i, i + chunkSize);
                const query = {
                    region: chunk.join(","),
                    sample: this.sampleId,
                    include: "id",
                    study: this.opencgaSession.study.fqn,
                };
                promises.push(this.opencgaSession.opencgaClient.clinical().queryVariant(query));
            }
            const variantsResponses = await Promise.all(promises);

            // 3. Generate the list of unique variants to filter
            const variantIds = new Set();
            variantsResponses.forEach(variantResponse => {
                variantResponse.responses[0].results.forEach(variant => {
                    variantIds.add(variant.id);
                });
            });

            // 4. Import variants info from CellBase
            const ids = Array.from(variantIds);
            const variantsPromises = [];
            for (let i = 0; i < ids.length; i = i + 50) {
                const chunk = ids.slice(i, i + 50);
                const query = {
                    assembly: "grch38",
                    dataRelease: "5",
                    include: "pharmacogenomics",
                };
                variantsPromises.push(cellbaseClient.get("genomic", "variant", chunk.join(","), "annotation", query));
            }
            const variantsInfoResponse = await Promise.all(variantsPromises);

            // 5. Save variants and request update
            this.variants = [];
            variantsInfoResponse.forEach(response => {
                response.responses.forEach(res => {
                    this.variants.push(res.results[0]);
                });
            });
            console.log(this.variants);
            this.isLoading = false;
            this.requestUpdate();
        }
    }

    render() {
        if (this.isLoading) {
            return html`
                <div style="padding-top:32px">
                    <loading-spinner></loading-spinner>
                </div>
            `;
        }

        return html`
            <div class="col-md-10 col-md-offset-1">
                ${this.config.showToolTitle ? html`
                    <tool-header class="bg-white" title="${`Pharmacogenomics ${this.sampleId || ""}`}"></tool-header>
                ` : nothing}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            showToolTitle: true,
        };
    }

}

customElements.define("pharmacogenomics-report", PharmacogenomicsReport);
