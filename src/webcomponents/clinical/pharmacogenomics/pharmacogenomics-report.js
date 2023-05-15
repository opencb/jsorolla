import {LitElement, html, nothing} from "lit";
import {CellBaseClient} from "../../../core/clients/cellbase/cellbase-client.js";
import "./pharmacogenomics-grid.js";
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
        this.loading = false;
        this.error = false;
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
            this.error = false;
            this.loading = true;
            this.requestUpdate();
            try {
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
                        // include: "id",
                        study: this.opencgaSession.study.fqn,
                        includeSampleId: true,
                    };
                    promises.push(this.opencgaSession.opencgaClient.clinical().queryVariant(query));
                }
                const variantsResponses = await Promise.all(promises);

                // 3. Generate the list of variants
                const variants = new Map();
                variantsResponses.forEach(variantResponse => {
                    variantResponse.responses[0].results.forEach(variant => {
                        variants.set(variant.id, variant);
                    });
                });

                // 4. Import pharmacogenomics annotation from cellbase
                const ids = Array.from(variants.keys());
                const pgxAnnotationPromises = [];
                for (let i = 0; i < ids.length; i = i + 50) {
                    const chunk = ids.slice(i, i + 50);
                    const query = {
                        assembly: "grch38",
                        dataRelease: "5",
                        include: "pharmacogenomics",
                    };
                    pgxAnnotationPromises.push(cellbaseClient.get("genomic", "variant", chunk.join(","), "annotation", query));
                }
                const pgxAnnotationResponses = await Promise.all(pgxAnnotationPromises);

                // 5. Merge pgx annotation with variants
                pgxAnnotationResponses.forEach(pgxAnnotationResponse => {
                    pgxAnnotationResponse.responses.forEach(response => {
                        if (variants.has(response.id)) {
                            variants.get(response.id).annotation.pharmacogenomics = response.results[0].pharmacogenomics;
                        }
                    });
                });

                // 5. Save variants and request update
                this.variants = Array.from(variants.values());
            } catch (error) {
                console.error(error);
                this.error = true;
            }
            this.loading = false;
            this.requestUpdate();
        }
    }

    render() {
        if (this.loading) {
            return html`
                <div style="padding-top:32px">
                    <loading-spinner></loading-spinner>
                </div>
            `;
        }
        if (this.error) {
            return html`
                <div class="col-md-10 col-md-offset-1" style="padding:32px 0px;">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle icon-padding"></i> Error getting Pharmacogenomics info. Plase try again later.
                    </div>
                </div>
            `;
        }

        return html`
            <div class="col-md-10 col-md-offset-1" style="padding-bottom:32px;">
                ${this.config.showToolTitle ? html`
                    <tool-header class="bg-white" title="${`Pharmacogenomics ${this.sampleId || ""}`}"></tool-header>
                ` : nothing}
                <pharmacogenomics-grid
                    .sampleId="${this.sampleId}"
                    .variants="${this.variants}"
                    .opencgaSession="${this.opencgaSession}">
                </pharmacogenomics-grid>
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
