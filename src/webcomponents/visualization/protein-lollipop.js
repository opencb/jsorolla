import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client.js";
import ProteinLollipopViz from "../../core/visualisation/protein-lollipop.js";

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
        this.error = null;

        // We need to save if the protein lollipop has been rendered
        this.rendered = false;
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this.rendered = false;
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        if (changedProperties.has("geneId") || changedProperties.has("query")) {
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
        return this.cellbaseClient.getProteinClient(null, "search", {
            gene: this.geneId,
        })
            .then(response => {
                return response.responses[0].results[0] || null;
            });
    }

    getTranscript(protein) {
        return this.cellbaseClient.getGeneClient(this.geneId, "transcript", {})
            .then(response => {
                // We need to find the transcript using the proteinSequence
                return (response.responses[0]?.results || []).find(item => {
                    return item.proteinSequence === protein?.sequence?.value;
                });
            });
    }

    async drawProteinLollipop() {
        if (this.active && this.opencgaSession && this.geneId && !this.rendered) {
            this.error = null;
            this.rendered = true;
            const protein = await this.getProtein();
            const transcript = await this.getTranscript(protein);

            if (!protein || !transcript) {
                this.error = `Unable to find protein for gene '${this.geneId}'.`;
                return this.requestUpdate();
            }
        }
    }

    render() {
        if (this.error) {
            return html`
                <div class="">${this.error}</div>
            `;
        }

        return html`
            <div id="${this._prefix}ProteinLollipop" style="width:100%;"></div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("protein-lollipop", ProteinLollipop);
