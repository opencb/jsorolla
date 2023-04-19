import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import ProteinLollipopViz from "../../core/visualisation/protein-lollipop.js";
import "../commons/view/detail-tabs.js";
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
            query: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._genes = [];
        this._config = this.getDefaultConfig();
        this.active = false;
    }

    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        if (changedProperties.has("config") || changedProperties.has("variant")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    variantObserver() {
        this._genes = [];
        if (this.variant) {
            const genesList = new Set();
            (this.variant.annotation?.consequenceTypes || []).forEach(ct => {
                if (ct.geneName) {
                    genesList.add(ct.geneName);
                }
            });

            this._genes = Array.from(genesList);
        }
    }

    render() {
        if (!this.variant || !this.opencgaSession) {
            return html`
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle icon-padding"></i> No variant provided.
                </div>
            `;
        }

        if (this._genes.length === 0) {
            return html`
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle icon-padding"></i> No genes available for variant '${this.variant.id}'.
                </div>
            `;
        }

        return html`
            <div style="margin-top:16px;margin-bottom:32px;">
                <detail-tabs
                    .mode="${"pills"}"
                    .data="${this.variant}"
                    .config="${this._config}"
                    .opencgaSession="${this.opencgaSession}">
                </detail-tabs>
            </div>
        `;
    }

    getDefaultConfig() {
        const proteinTracks = [
            {
                title: "Clinvar",
                type: ProteinLollipopViz.TRACK_TYPES.CELLBASE_VARIANTS,
                tooltip: ProteinLollipopViz.clinvarTooltipFormatter,
                tooltipWidth: "360px",
                tooltipHeight: "150px",
                query: {
                    source: "clinvar",
                },
            },
            {
                title: "Cosmic",
                type: ProteinLollipopViz.TRACK_TYPES.CELLBASE_VARIANTS,
                tooltip: ProteinLollipopViz.cosmicTooltipFormatter,
                tooltipWidth: "280px",
                tooltipHeight: "150px",
                query: {
                    source: "cosmic",
                },
            },
        ];

        return {
            title: "",
            items: this._genes.map((geneId, index) => ({
                id: geneId,
                name: geneId,
                active: index === 0,
                render: (variant, active, opencgaSession) => {
                    const highlights = [
                        {
                            variants: [variant?.id],
                            style: {
                                strokeColor: "#fd984399",
                                strokeWidth: "4px",
                            },
                        },
                    ];

                    return html`
                        <h3 style="font-weight:bold">${geneId}</h3>
                        <hr/>
                        <protein-lollipop
                            .opencgaSession="${opencgaSession}"
                            .geneId="${geneId}"
                            .query="${this.query}"
                            .tracks="${proteinTracks}"
                            .highlights="${highlights}"
                            .active="${active}">
                        </protein-lollipop>
                    `;
                },
            })),
        };
    }

}

customElements.define("protein-lollipop-variant-view", ProteinLollipopVariantView);
