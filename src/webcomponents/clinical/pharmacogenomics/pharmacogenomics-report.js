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
                const variants = new Map();
                for (let i = 0; i < pgxVariants.length; i = i + 200) {
                    const variantsPromises = [];
                    const variantsBatch = pgxVariants.slice(i, i + 200);
                    for (let j = 0; j < variantsBatch.length; j = j + 50) {
                        const chunk = variantsBatch.slice(j, j + 50);
                        const query = {
                            region: chunk.join(","),
                            sample: this.sampleId,
                            // include: "id",
                            study: this.opencgaSession.study.fqn,
                            includeSampleId: true,
                        };
                        variantsPromises.push(this.opencgaSession.opencgaClient.clinical().queryVariant(query));
                    }
                    const variantsResponses = await Promise.all(variantsPromises);
                    variantsResponses.forEach(variantResponse => {
                        variantResponse.responses[0].results.forEach(variant => {
                            variants.set(variant.id, variant);
                        });
                    });
                }

                // 4. Import pharmacogenomics annotation from cellbase
                const ids = Array.from(variants.keys());
                for (let i = 0; i < ids.length; i = i + 200) {
                    const idsBatch = ids.slice(i, i + 200);
                    const promises = [];
                    for (let j = 0; j < idsBatch.length; j = j + 50) {
                        const chunk = idsBatch.slice(j, j + 50);
                        const query = {
                            assembly: "grch38",
                            dataRelease: "5",
                            include: "pharmacogenomics",
                        };
                        promises.push(cellbaseClient.get("genomic", "variant", chunk.join(","), "annotation", query));
                    }
                    const responses = await Promise.all(promises);
                    responses.forEach(pgxAnnotationResponse => {
                        pgxAnnotationResponse.responses.forEach(response => {
                            if (variants.has(response.id)) {
                                variants.get(response.id).annotation.pharmacogenomics = response.results[0].pharmacogenomics;
                            }
                        });
                    });
                }

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
