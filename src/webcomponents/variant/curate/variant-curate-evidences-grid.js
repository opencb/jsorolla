import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
import GridCommons from "../../commons/grid-commons.js";
import VariantGridFormatter from "../variant-grid-formatter.js";

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

    render() {
        if (!this.opencgaSession || !this.variant) {
            return nothing;
        }

        return html`
            <div class="force-overflow">
                <table id="${this._gridId}"></table>
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
                    formatter: (value, row) => {
                        return "-";
                    },
                },
                {
                    id: "transcript-flags",
                    title: "Transcript Flags",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        return "-";
                    },
                },
                {
                    id: "disease-panel",
                    title: "Disease Panel",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        return "-";
                    },
                },
                {
                    id: "prediction",
                    title: "Automatic Prediction",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        return "-";
                    },
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
                            <div class="dropdown">
                                <button class="btn" data-bs-toggle="dropdown">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <div class="dropdown-menu dropdown-menu-end">
                                    <div>Add your review here</div>
                                </div>
                            </div>
                        `;
                    },
                },
            ],
            [
                {
                    id: "acmg",
                    title: "ACMG",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => {
                        return "-";
                    },
                },
                {
                    id: "tier",
                    title: "Tier",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => {
                        return "-";
                    },
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
