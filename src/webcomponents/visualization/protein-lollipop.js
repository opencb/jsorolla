import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client.js";
import ProteinLollipopViz from "../../core/visualisation/protein-lollipop.js";
import "../loading-spinner.js";

export default class ProteinLollipop extends LitElement {

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
            active: {
                type: Boolean,
            },
            geneId: {
                type: String,
            },
            query: {
                type: Object,
            },
            highlights: {
                type: Object,
            },
            tracks: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();

        this.cellbaseClient = null;
        this.active = true;
        this.geneId = null;
        this.tracks = [];

        // We need to save if the protein lollipop has been rendered
        this.rendered = false;
        this.loading = false;
        this.error = null;
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this.rendered = false;
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
            this.rendered = false;
        }

        if (changedProperties.has("geneId") || changedProperties.has("query") || changedProperties.has("tracks") || changedProperties.has("highlights")) {
            this.rendered = false;
        }

        super.update(changedProperties);
    }

    updated() {
        this.drawProteinLollipop();
    }

    opencgaSessionObserver() {
        this.cellbaseClient = null;
        if (this.opencgaSession?.project && this.opencgaSession?.project?.cellbase?.url) {
            this.cellbaseClient = new CellBaseClient({
                host: this.opencgaSession.project.cellbase.url.replace(/\/$/, ""),
                version: this.opencgaSession.project.cellbase.version,
                species: this.opencgaSession.project.organism.scientificName,
            });
        }
    }

    // This is a terrible hack to find the correct protein ID and the transcript ID
    getProtein() {
        return this.cellbaseClient
            .getProteinClient(null, "search", {
                gene: this.geneId,
            })
            .then(response => {
                return response.responses[0].results[0] || null;
            })
            .catch(() => null);
    }

    getTranscript(protein) {
        return this.cellbaseClient
            .getGeneClient(this.geneId, "transcript", {})
            .then(response => {
                // We need to find the transcript using the proteinSequence
                return (response.responses[0]?.results || []).find(item => {
                    return item.proteinSequence === protein?.sequence?.value;
                });
            })
            .catch(() => null);
    }

    getVariants() {
        const params = {
            study: this.opencgaSession.study.fqn,
            xref: this.geneId,
            ct: ProteinLollipopViz.CONSEQUENCE_TYPES.join(","),
            ...this.query,
        };

        return this.opencgaSession.opencgaClient
            .clinical()
            .queryVariant(params)
            .then(response => {
                return response.responses?.[0]?.results || [];
            });
    }

    async getTracks() {
        const tracks = [];
        if (this.tracks?.length > 0) {
            const tracksLength = this.tracks.length;
            for (let i = 0; i < tracksLength; i++) {
                const track = this.tracks[i];
                let data = [];
                switch (track.type) {
                    case ProteinLollipopViz.TRACK_TYPES.OPENCGA_VARIANTS:
                        // Not implemented yet
                        break;
                    case ProteinLollipopViz.TRACK_TYPES.CELLBASE_VARIANTS:
                        try {
                            const response = await this.cellbaseClient.get("clinical", "variant", null, "search", {
                                feature: this.geneId,
                                // source: "clinvar",
                                consequenceType: ProteinLollipopViz.CONSEQUENCE_TYPES.join(","),
                                exclude: "annotation.populationFrequencies,annotation.conservation,annotation.constraints,annotation.functionalScore",
                                limit: 5000,
                                ...track.query,
                            });
                            data = response?.responses?.[0]?.results || [];
                        } catch (error) {
                            console.error(error);
                        }
                        break;
                    case ProteinLollipopViz.TRACK_TYPES.VARIANTS:
                    default:
                        data = track.data || [];
                }

                // Save this track data
                tracks.push({
                    ...track,
                    title: track.title || "",
                    type: track.type || ProteinLollipopViz.TRACK_TYPES.VARIANTS,
                    data: data,
                });
            }
        }

        return tracks;
    }

    async drawProteinLollipop() {
        if (this.active && this.opencgaSession && this.geneId && !this.rendered) {
            this.error = null;
            this.rendered = true;
            const target = this.querySelector(`div#${this._prefix}ProteinLollipop`);

            // Remove all DOM elements from previous renders
            while (target.firstChild) {
                target.removeChild(target.firstChild);
            }
            this.loading = true;
            this.requestUpdate();
            await this.updateComplete;

            // Import protein and transcript data
            const protein = await this.getProtein();
            const transcript = await this.getTranscript(protein);

            if (!protein || !transcript) {
                this.loading = false;
                this.error = `Unable to find protein for gene '${this.geneId}'.`;
                return this.requestUpdate();
            }

            // Get variants data
            const variants = await this.getVariants();
            const tracks = await this.getTracks();

            // Render protein lollipop
            ProteinLollipopViz.draw(target, transcript, protein, variants, {
                title: this._config.title,
                tracks: tracks,
                highlights: this.highlights || [],
            });

            this.loading = false;
            this.requestUpdate();
        }
    }

    render() {
        return html`
            <div>
                ${!this.error && this.loading ? html`
                    <div style="margin-top:32px">
                        <loading-spinner></loading-spinner>
                    </div>
                ` : null}
                ${this.error ? html`
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle icon-padding"></i> ${this.error}
                    </div>
                ` : null}
                <div id="${this._prefix}ProteinLollipop" style="width:100%;"></div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Variants"
        };
    }

}

customElements.define("protein-lollipop", ProteinLollipop);
