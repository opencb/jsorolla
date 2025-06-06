import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
import GridCommons from "../../commons/grid-commons.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import VariantGridFormatter from "../variant-grid-formatter.js";
import "../../clinical/interpretation/clinical-interpretation-variant-evidence-review.js";

export default class VariantCurateEvidencesGrid extends LitElement {

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
            clinicalAnalysis: {
                type: Object,
            },
            variant: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this.active = true;
        this.table = null;
        this.gridCommons = null;

        this._prefix = UtilsNew.randomString(8);
        this._gridId = this._prefix + "EvidencesGrid";
        this._selectedEvidence = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("variant")) {
            this.renderLocalEvidences();
        }
    }

    renderLocalEvidences() {
        this.table = $("#" + this._gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            classes: "table table-borderless table-hover table-grid",
            buttonsClass: "light",
            data: this.variant?.evidences || [],
            columns: this.getDefaultColumns(),
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "bottom",
            onPostBody: data => {
                // this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
            },
        });
    }

    geneFormatter(evidence) {
        if (evidence?.genomicFeature?.geneName) {
            return `
                <div>
                    <a class="text-decoration-none" href="${BioinfoUtils.getGeneNameLink(evidence.genomicFeature.geneName)}" target="_blank">
                        ${evidence.genomicFeature.geneName}
                    </a>
                </div>
                ${evidence?.genomicFeature?.id ? `
                    <div class="">
                        <a class="text-decoration-none" href="${BioinfoUtils.getGeneLink(evidence.genomicFeature.id)}" target="_blank">
                            ${evidence.genomicFeature.id || ""}
                        </a>
                    </div>
                ` : ""}
            `;
        }
        return "-";
    }

    transcriptFormatter(evidence) {
        const ct = (this.variant.annotation?.consequenceTypes || []).find(ct => {
            return ct.ensemblTranscriptId === evidence?.genomicFeature?.transcriptId || ct.transcriptId === evidence?.genomicFeature?.transcriptId;
        });
        return `
            <div class="">${ct?.biotype || "-"}</div>
            ${evidence?.genomicFeature?.transcriptId ? `
                <div class="">
                    <div class="">
                        ${VariantGridFormatter.getHgvsLink(evidence.genomicFeature.transcriptId, this.variant.annotation.hgvs) || ""}
                    </div>
                    <div class="">
                        ${VariantGridFormatter.getHgvsLink(ct?.proteinVariantAnnotation?.proteinId, this.variant.annotation.hgvs) || ""}
                    </div>
                </div>
            ` : ""}
        `;
    }

    consequenceTypeFormatter(evidence) {
        const items = (evidence?.genomicFeature?.consequenceTypes || []).map(so => {
            const color = CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so.name]] || "black";
            return `
                <div class="" style="color:${color};">
                    <span>${so.name}</span>
                    <a class="" href="${BioinfoUtils.getSequenceOntologyLink(so.accession)}" target="_blank">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `;
        });
        return items.join("") || "-";
    }

    transcriptFlagsFormatter(evidence) {
        const ct = (this.variant.annotation?.consequenceTypes || []).find(ct => {
            return ct.ensemblTranscriptId === evidence?.genomicFeature?.transcriptId || ct.transcriptId === evidence?.genomicFeature?.transcriptId;
        });
        if (ct?.transcriptId || ct?.ensemblTranscriptId) {
            if (ct?.transcriptFlags?.length > 0) {
                return ct.transcriptFlags.map(flag => `<div class="my-1">${flag}</div>`).join("");
            }
            if (ct?.transcriptAnnotationFlags?.length > 0) {
                return ct.transcriptAnnotationFlags.map(flag => `<div class="my-1">${flag}</div>`).join("");
            }
        }
        return "-";
    }

    panelFormatter(evidence) {
        if (evidence.panelId) {
            const panel = this.opencgaSession.study?.panels?.find(panel => panel.id === evidence.panelId);
            if (panel) {
                const gene = panel.genes.find(gene => gene.id === evidence.genomicFeature.geneName || gene.name === evidence.genomicFeature.geneName);
                const confidenceColor = gene?.confidence === "HIGH" ? "green" : gene?.confidence === "MEDIUM" ? "darkorange" : "red";
                return `
                    ${CatalogGridFormatter.panelFormatter([panel])}
                    ${gene.modesOfInheritance ? `
                        <div class="text-body-secondary" style="margin: 5px 0" title="Panel Mode of Inheritance of gene ${gene.name}">
                            ${gene.modesOfInheritance.join(", ")}
                        </div>
                    ` : ""}
                    ${gene.confidence ? `
                        <div style="color: ${confidenceColor}" title="Panel Confidence of gene ${gene.name}">
                            <span>${gene.confidence}</span>
                        </div>
                    ` : ""}
                `;
            }
            // no panel found in the study??
            return evidence.panelId;
        }
        return "-";
    }

    predictionFormatter(classification) {
        if (classification?.clinicalSignificance || classification?.acmg?.length > 0) {
            return `
                ${classification?.clinicalSignificance ? `
                    <div class="my-1" style="color: ${CLINICAL_SIGNIFICANCE_SETTINGS[classification.clinicalSignificance].color}">
                        ${CLINICAL_SIGNIFICANCE_SETTINGS[classification.clinicalSignificance].id}
                    </div>
                ` : ""}
                ${classification?.acmg?.length > 0 ? `
                    <div class="text-secondary">
                        ${classification.acmg.map(acmg => acmg.classification || acmg).join(", ")}
                    </div>
                ` : ""}
            `;
        }
        return "-";
    }

    tierFormatter(evidence) {
        if (evidence.review?.tier) {
            let color = "black";
            const tierClassification = evidence.review.tier?.toUpperCase();
            color = (tierClassification === "TIER1" || tierClassification === "TIER 1") ? "red" : color;
            color = (tierClassification === "TIER2" || tierClassification === "TIER 2") ? "darkorange" : color;
            color = (tierClassification === "TIER3" || tierClassification === "TIER 3") ? "blue" : color;
            return `
                <span style="color:${color}">${evidence.review.tier}</span>
            `;
        }
        return "-";
    }

    onEvidenceSelect(event, evidence) {
        this._selectedEvidence = evidence;
        this.requestUpdate();
    }

    onEvidenceUnselect() {
        this._selectedEvidence = null;
        this.requestUpdate();
    }

    onEvidenceReviewChange(event) {
        // TODO
    }

    render() {
        if (!this.opencgaSession || !this.variant) {
            return nothing;
        }

        return html`
            <div class="d-flex flex-row gap-4" style="min-width:0px;">
                <div class="w-full overflow-y-auto">
                    <table id="${this._gridId}"></table>
                </div>
                ${this._selectedEvidence ? html`
                    <div class="border-start border-secondary opacity-25"></div>
                    <div class="flex-shrink-0" style="width:480px;">
                        <div class="d-flex flex-row align-items-center justify-content-between mb-4">
                            <h4 class="mb-0">Evidence Review</h4>
                            <button class="btn-close" @click="${() => this.onEvidenceUnselect()}"></button>
                        </div>    
                        <clinical-interpretation-variant-evidence-review
                            .opencgaSession="${this.opencgaSession}"
                            .review="${this._selectedEvidence}"
                            .somatic="${this.clinicalAnalysis.type === "CANCER"}"
                            @evidenceReviewChange="${e => this.onEvidenceReviewChange(e)}">
                        </clinical-interpretation-variant-evidence-review>
                    </div>    
                ` : nothing}
            </div>
        `;
    }

    getDefaultColumns() {
        return [
            [
                {
                    id: "gene",
                    title: "Gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => this.geneFormatter(row),
                },
                {
                    id: "transcript",
                    title: "Transcript",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => this.transcriptFormatter(row),
                },
                {
                    id: "consequence-type",
                    title: "Consequence Type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => this.consequenceTypeFormatter(row),
                },
                {
                    id: "transcript-flags",
                    title: "Transcript Flags",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => this.transcriptFlagsFormatter(row),
                },
                {
                    id: "disease-panel",
                    title: "Disease Panel",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => this.panelFormatter(row),
                },
                {
                    id: "roleInCancer",
                    title: "Role in Cancer",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        if (row.rolesInCancer) {
                            return row.rolesInCancer
                                .map(v => v.match(/^TUMOR_SUP{1,2}RESSOR_GENE$/) ? "TSG" : v)
                                .join(", ");
                        }
                        return "-";
                    },
                    visible: this.clinicalAnalysis?.type?.toUpperCase() == "CANCER",
                },
                {
                    id: "prediction",
                    title: "Automatic Prediction",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => this.predictionFormatter(row.classification),
                },
                {
                    id: "classification",
                    title: "User Classification",
                    align: "center",
                    rowspan: 1,
                    colspan: 2,
                },
                {
                    id: "review",
                    title: "Review",
                    align: "right",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        return `
                            <button class="btn">
                                <i class="fa fa-edit"></i>
                            </button>
                        `;
                    },
                    events: {
                        "click button": (event, value, row) => this.onEvidenceSelect(event, row),
                    },
                },
            ],
            [
                {
                    id: "acmg",
                    title: "ACMG",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => this.predictionFormatter(row.review),
                },
                {
                    id: "tier",
                    title: "Tier",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => this.tierFormatter(row),
                },
            ],
        ];
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
        };
    }

}

customElements.define("variant-curate-evidences-grid", VariantCurateEvidencesGrid);
