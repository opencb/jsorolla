import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import GridCommons from "../../commons/grid-commons.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import VariantGridFormatter from "../variant-grid-formatter.js";
import VariantInterpreterGridFormatter from "../interpretation/variant-interpreter-grid-formatter.js";
import "../../clinical/interpretation/clinical-interpretation-variant-evidence-review.js";

export default class VariantReviewEvidencesGrid extends LitElement {

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
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this.active = true;
        this.table = null;
        this.gridCommons = null;

        this._evidences = [];
        this._visibleEvidencesIndex = [];
        this._updatedEvidences = new Set();
        this._applyTranscriptFilters = true;

        this._prefix = UtilsNew.randomString(8);
        this._gridId = this._prefix + "EvidencesGrid";
        this._selectedEvidence = null;
        this._selectedEvidenceIndex = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("variant") || changedProperties.has("config")) {
            this.filterEvidences();
            this.renderLocalEvidences();
        }
    }

    variantObserver() {
        this._updatedEvidences = new Set(); // reset the updated evidences
        // we need to prepare evidences to be filtered properly,
        // the easiest way is to recycle the existing function 'consequenceTypeDetailFormatterFilter',
        // so we need to add consequenceType information
        this._evidences = [];
        const transcriptMap = new Map();
        this.variant.annotation.consequenceTypes.forEach(consequenceType => {
            transcriptMap.set(consequenceType.transcriptId, consequenceType);
        });
        (this.variant?.evidences || []).map((evidence, index) => {
            // we are missing regulatory variants
            if (evidence.genomicFeature?.transcriptId) {
                this._evidences.push({
                    index: index,
                    ...evidence,
                    ...transcriptMap.get(evidence.genomicFeature.transcriptId)
                });
            }
        });
        // we need to sort the evidences by gene name
        BioinfoUtils.sort(this._evidences, evidence => evidence.genomicFeature?.geneName);
    }

    filterEvidences() {
        this._visibleEvidencesIndex = [];
        if (this._applyTranscriptFilters) {
            this._visibleEvidencesIndex = VariantGridFormatter._consequenceTypeDetailFormatterFilter(this._evidences, this._config).indexes;
        } else {
            // if we are not applying the filters, we just return all the evidences
            this._visibleEvidencesIndex = this._evidences.map((evidence, index) => index);
        }
    }

    renderLocalEvidences() {
        this.querySelector(`#${this._gridId}Filters`).innerHTML = ""; // reset the filters bar
        this.table = $("#" + this._gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            classes: "table table-borderless table-hover table-grid",
            buttonsClass: "light",
            columns: this.getDefaultColumns(),
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            sidePagination: "server",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "bottom",
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this._visibleEvidencesIndex.slice(skip, skip + limit).map(index => {
                    return this._evidences[index];
                });

                return params.success(rows);
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this._visibleEvidencesIndex.length,
                    rows: response,
                };
            },
            onPostBody: () => {
                // mark the selected evidence row
                if (this._selectedEvidence) {
                    this.querySelector(`#${this._gridId} tbody tr[data-index="${this._selectedEvidenceIndex}"]`)?.classList.add("selected");
                }
                // display the filters bar
                this.querySelector(`#${this._gridId}Filters`).innerHTML = `
                    <div class="">
                        <span>Showing </span>
                        <span class="fw-bold" style="color:red;">${this._visibleEvidencesIndex.length}</span>
                        <span> of </span>
                        <span class="fw-bold" style="color:red">${this._evidences.length}</span>
                        <span> clinical evidences. </span>
                        <a class="link-primary cursor-pointer">
                            ${this._visibleEvidencesIndex.length !== this._evidences.length ? "Show all..." : "Apply filters..."}
                        </a>
                    </div>
                `;
                // add the click event to the filters bar
                this.querySelector(`#${this._gridId}Filters a`).addEventListener("click", () => {
                    this._applyTranscriptFilters = !this._applyTranscriptFilters;
                    this.filterEvidences();
                    this.renderLocalEvidences();
                });
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

    onEvidenceSelect(event, evidence, index) {
        this._selectedEvidence = UtilsNew.objectClone(evidence);
        this._selectedEvidenceIndex = index;
        this.requestUpdate();
        this.renderLocalEvidences();
    }

    onEvidenceReviewChange(event) {
        event.stopPropagation();
        this._selectedEvidence.review = event.detail.review;
    }

    onEvidenceReviewSave() {
        // note: we can not use _selectedEvidenceIndex as the evidences may have been filtered
        // so we need to find the correct index in the _visibleEvidencesIndex array
        const index = this._visibleEvidencesIndex[this._selectedEvidenceIndex];
        this._evidences[index].review = this._selectedEvidence.review;
        this._updatedEvidences.add(this._selectedEvidence.index);
        // Emit the evidence change event
        LitUtils.dispatchCustomEvent(this, "evidenceReviewChange", null, {
            review: this._selectedEvidence.review,
            index: this._selectedEvidence.index,
        });
        // reset the selected evidence
        this._selectedEvidence = null;
        this._selectedEvidenceIndex = null;
        this.requestUpdate();
        this.renderLocalEvidences();
    }

    onEvidenceReviewCancel() {
        this._selectedEvidence = null;
        this._selectedEvidenceIndex = null;
        this.requestUpdate();
        this.renderLocalEvidences();
    }

    render() {
        if (!this.opencgaSession || !this.variant) {
            return nothing;
        }

        return html`
            <div class="d-flex flex-row gap-4" style="min-width:0px;">
                <div class="w-full overflow-y-auto">
                    <div id="${this._gridId}Filters" class="mb-0"></div>
                    <div class="w-full">
                        <table id="${this._gridId}"></table>
                    </div>
                </div>
                ${this._config.review && this._selectedEvidence ? html`
                    <div class="border-start border-secondary opacity-25"></div>
                    <div class="flex-shrink-0" style="width:400px;">
                        <div class="d-flex flex-row align-items-center justify-content-between mb-4">
                            <h4 class="mb-0">Evidence Review</h4>
                        </div>    
                        <clinical-interpretation-variant-evidence-review
                            .opencgaSession="${this.opencgaSession}"
                            .review="${this._selectedEvidence?.review}"
                            .displayConfig="${{
                                defaultLayout: "vertical",
                                buttonClearText: "Cancel",
                                buttonOkText: "Save Evidence",
                            }}"
                            @evidenceReviewChange="${e => this.onEvidenceReviewChange(e)}"
                            @evidenceReviewSubmit="${e => this.onEvidenceReviewSave(e)}"
                            @evidenceReviewClear="${e => this.onEvidenceReviewCancel(e)}">
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
                    title: "Automatic<br>Prediction",
                    rowspan: 2,
                    colspan: 1,
                    align: "center",
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
                    align: "center",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        const buttonColor = this._updatedEvidences.has(row.index) ? "btn-warning" : (row?.review?.select ? "btn-primary" : "btn-light");
                        return `
                            <button class="mx-auto btn ${buttonColor} d-flex align-items-center gap-1 ${!this._config.review || this._selectedEvidence ? "disabled" : ""}">
                                <i class="fa fa-edit"></i>
                                <span>Review</span>
                            </button>
                        `;
                    },
                    events: {
                        "click button": (event, value, row, index) => this.onEvidenceSelect(event, row, index),
                    },
                },
            ],
            [
                {
                    id: "acmg",
                    title: "ACMG",
                    rowspan: 1,
                    colspan: 1,
                    align: "center",
                    formatter: (value, row) => this.predictionFormatter(row.review),
                },
                {
                    id: "tier",
                    title: "Tier",
                    rowspan: 1,
                    colspan: 1,
                    align: "center",
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

            review: true,

            geneSet: {
                ensembl: true,
                refseq: true,
            },
            consequenceType: {
                // all: false,
                maneTranscript: true,
                gencodeBasicTranscript: false,
                ensemblCanonicalTranscript: true,
                refseqTranscript: true,
                ccdsTranscript: false,
                ensemblTslTranscript: false,
                proteinCodingTranscript: false,
                highImpactConsequenceTypeTranscript: false,

                showNegativeConsequenceTypes: true
            },
        };
    }

}

customElements.define("variant-review-evidences-grid", VariantReviewEvidencesGrid);
