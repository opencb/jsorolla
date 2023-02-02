import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import ProteinLollipopViz from "../../core/visualisation/protein-lollipop.js";
import "./protein-lollipop.js";

export default class ProteinLollipopVariantView extends LitElement {

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
            variant: {
                type: String,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
        this.active = false;
        this.genes = [];
        this.activeGene = null;
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        this.genes = [];
        this.activeGene = null;
        if (this.variant) {
            const genesList = new Set();
            (this.variant.evidences || []).forEach(evidence => {
                if (evidence?.genomicFeature?.type === "GENE" && evidence.genomicFeature.geneName) {
                    genesList.add(evidence.genomicFeature.geneName);
                }
            });

            this.genes = Array.from(genesList);
            this.activeGene = this.genes[0];
        }
    }

    onGeneChange(gene) {
        if (this.activeGene !== gene) {
            this.activeGene = gene;
            this.requestUpdate();
        }
    }

    render() {
        if (!this.variant || this.genes.length === 0) {
            return html`
                <div class="">No protein info available.</div>
            `;
        }

        return html`
            <div class="row" style="margin-top:16px;margin-bottom:32px;">
                <div class="col-md-2">
                    <ul class="nav nav-pills nav-stacked">
                        ${this.genes.map(gene => html`
                            <li
                                class="${gene === this.activeGene ? "active" : ""}"
                                style="cursor:pointer;"
                                @click="${() => this.onGeneChange(gene)}"
                            >
                                <a>${gene}</a>
                            </li>
                        `)}
                    </ul>
                </div>
                <div class="col-md-10">
                    ${this.activeGene ? html`
                        <protein-lollipop
                            .opencgaSession="${this.opencgaSession}"
                            .geneId="${this.activeGene}"
                            .tracks="${this._config.proteinTracks || []}"
                            .active="${this.active}">
                        </protein-lollipop>
                    ` : null}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            proteinTracks: [
                {
                    title: "Clinvar",
                    type: ProteinLollipopViz.TRACK_TYPES.CELLBASE_VARIANTS,
                    query: {
                        source: "clinvar",
                    },
                },
                {
                    title: "Cosmic",
                    type: ProteinLollipopViz.TRACK_TYPES.CELLBASE_VARIANTS,
                    query: {
                        source: "cosmic",
                    },
                },
            ],
        };
    }

}

customElements.define("protein-lollipop-variant-view", ProteinLollipopVariantView);
