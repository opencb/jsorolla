import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import GridCommons from "../../commons/grid-commons.js";
import VariantGridFormatter from "../../variant/variant-grid-formatter.js";
import VariantInterpreterGridFormatter from "../../variant/interpretation/variant-interpreter-grid-formatter.js";
import "../../commons/opencb-grid-toolbar.js";
import "../../loading-spinner.js";

export default class PharmacogenomicsGrid extends LitElement {

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
            sampleId: {
                type: String,
            },
            variants: {
                type: Array,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.gridCommons = new GridCommons(this._prefix + "PgxTable", this, this._config);
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("variants") || changedProperties.has("config") || changedProperties.has("opencgaSession")) {
            this.renderTable();
        }
    }

    renderTable() {
        return this.renderLocalTable();
    }

    renderLocalTable() {
        this.table = $(`#${this._prefix}PgxTable`);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.variants,
            columns: this.getDefaultColumns(),
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            detailView: this._config.detailView,
            detailFormatter: (value, row) => this.detailFormatter(value, row),

            // This has been added to make the grid properties in all bootstrap table formatters, as some grid formattes needs them
            variantGrid: this,

            // onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onDblClickRow: (row, element) => {
                if (this._config.detailView) {
                    if (element[0].innerHTML.includes("fa-plus")) {
                        $("#" + this.gridId).bootstrapTable("expandRow", element[0].dataset.index);
                    } else {
                        $("#" + this.gridId).bootstrapTable("collapseRow", element[0].dataset.index);
                    }
                }
            },
            // onExpandRow: (index, row) => {
            //     this.gridCommons.onClickRow(row.id, row, this.querySelector(`tr[data-index="${index}"]`));
            // },
            onPostBody: data => {
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
            },
        });
    }

    detailFormatter(value, row) {
        let result = "<div style='padding-bottom:24px'>";
        let detailHtml = "";
        if (row?.annotation?.pharmacogenomics) {
            // detailHtml += "<div style='padding: 10px 0px 5px 25px'><h4>Drugs</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += this.drugsTableFormatter(row);
            detailHtml += "</div>";
        }
        result += detailHtml + "</div>";
        return result;
    }

    drugsTableFormatter(variant) {
        const allele = this.getAlleles(variant).join("");
        const drugsRows = variant.annotation.pharmacogenomics
            // .filter(item => item.types.includes("Drug"))
            .map(item => {
                return item.annotations.map(annotation => {
                    return `
                        <tr>
                            <td>
                                <div style="font-weight:bold;">${item.name}</div>
                                <div style="font-size:12px;color:#737373;width:120px;">
                                    ${(annotation.phenotypes || []).join(", ")}
                                </div>
                            </td>
                            <td>${annotation.phenotypeType || "-"}</td>
                            <td>${annotation.geneName || "-"}</td>
                            <td>${annotation.alleles.find(a => a.allele === allele)?.annotation || "-"}</td>
                        </tr>
                    `;
                });
            });

        return `
            <table id="DrugsTable" class="table table-hover table-no-bordered">
                <thead>
                    <tr>
                        <th style="padding:8px;">Drug</th>
                        <th style="padding:8px;">Phenotype Type</th>
                        <th style="padding:8px;">Gene</th>
                        <th style="padding:8px;">Annotation</th>
                    </tr>
                </thead>
                <tbody>
                    ${drugsRows.flat().join("")}
                </tbody>
            </table>
        `;
    }

    getAlleles(variant) {
        if (variant && variant.studies?.length > 0 && variant.studies[0].samples?.length > 0) {
            const sample = variant.studies[0].samples.find(s => s.sampleId === this.sampleId);
            if (!sample || sample?.data?.length === 0) {
                return [];
            }
            // Check if there are any DISCREPANCY issue for this sample and add it to the calls to be displayed
            // if (row.studies[0]?.issues?.length > 0) {
            //     const sampleIssues = row.studies[0].issues.filter(e => e.sample.sampleId === sampleId && e.type === "DISCREPANCY");
            //     sampleEntries = sampleEntries.concat(sampleIssues.map(e => e.sample));
            // }

            const genotypeIndex = variant.studies[0].sampleDataKeys.findIndex(key => key === "GT");
            const genotype = sample.data[genotypeIndex];

            // Check special cases
            if (genotype === "NA" || genotype === "./." || genotype === ".|.") {
                return [];
            }

            const alleles = [];
            const allelesArray = genotype.split(new RegExp("[/|]"));
            for (const allele of allelesArray) {
                switch (allele) {
                    case ".":
                        alleles.push(".");
                        break;
                    case "0":
                        alleles.push(variant.reference ? variant.reference : "-");
                        break;
                    case "1":
                        alleles.push(variant.alternate ? variant.alternate : "-");
                        break;
                    case "2":
                        alleles.push("*");
                        break;
                    case "?":
                        alleles.push(variant.reference ? variant.reference : "-");
                        break;
                }
            }
            return alleles;
        }
        return [];
    }

    render() {
        return html`
            <div class="force-overflow">
                <table id="${this._prefix}PgxTable"></table>
            </div>
        `;
    }

    getDefaultColumns() {
        return [
            [
                {
                    id: "id",
                    title: "Variant",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => {
                        return VariantGridFormatter.variantFormatter(value, row, index, this.opencgaSession.project.organism.assembly, this._config);
                    },
                },
                {
                    id: "genotype",
                    title: "Genotype",
                    rowspan: 2,
                    colspan: 1,
                    field: {
                        sampleId: this.sampleId,
                        quality: this._config.quality,
                        config: this._config,
                    },
                    formatter: VariantInterpreterGridFormatter.sampleGenotypeFormatter,
                    align: "center",
                    nucleotideGenotype: true,
                    visible: !!this.sampleId,
                },
                {
                    id: "gene",
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.geneFormatter(row, index, {}, this.opencgaSession, this._config),
                },
                {
                    id: "drugs",
                    title: "Drugs",
                    field: "annotation",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        return row.annotation.pharmacogenomics.map(item => item.name).join(", ") || "-";
                    },
                },
                {
                    id: "phenotypeType",
                    title: "Phenotype Type",
                    field: "annotation",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        const phenotypeTypes = new Set();
                        row.annotation.pharmacogenomics.forEach(item => {
                            item.annotations.forEach(annotation => {
                                phenotypeTypes.add(annotation.phenotypeType);
                            });
                        });
                        return Array.from(phenotypeTypes).join(", ") || "-";
                    },
                },
                {
                    id: "phenotypes",
                    title: "Phenotypes",
                    field: "annotation",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        const phenotypes = new Set();
                        row.annotation.pharmacogenomics.forEach(item => {
                            item.annotations.forEach(annotation => {
                                annotation.phenotypes.forEach(phenotype => phenotypes.add(phenotype));
                            });
                        });
                        return Array.from(phenotypes).join(", ") || "-";
                    },
                },
                {
                    id: "consequenceType",
                    title: "Consequence Type",
                    field: "consequenceType",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.consequenceTypeFormatter(value, row, null, this._config),
                },
                {
                    id: "populationFrequencies",
                    title: "Reference Population Frequencies",
                    field: "populationFrequencies",
                    rowspan: 2,
                    colspan: 1,
                    formatter: VariantInterpreterGridFormatter.clinicalPopulationFrequenciesFormatter.bind(this),
                },
                {
                    id: "clinicalInfo",
                    title: "Clinical Info",
                    rowspan: 1,
                    colspan: 3,
                    align: "center"
                },
            ],
            [
                {
                    id: "clinvar",
                    title: "ClinVar",
                    field: "clinvar",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalTraitAssociationFormatter,
                    align: "center",
                },
                {
                    id: "cosmic",
                    title: "Cosmic",
                    field: "cosmic",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalTraitAssociationFormatter,
                    align: "center",
                },
                {
                    id: "hotspots",
                    title: "Cancer <br> Hotspots",
                    field: "hotspots",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalCancerHotspotsFormatter,
                    align: "center",
                },
            ],
        ];
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            detailView: true,
            quality: {
                qual: 30,
                dp: 20
            },
            populationFrequencies: [
                "1000G:ALL",
                "GNOMAD_GENOMES:ALL",
                "GNOMAD_EXOMES:ALL",
            ],
            populationFrequenciesConfig: {
                displayMode: "FREQUENCY_BOX"
            },
            genotype: {
                type: "ALLELES"
            },
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

customElements.define("pharmacogenomics-grid", PharmacogenomicsGrid);
