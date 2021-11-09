/*
 * Copyright 2015-2016 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utilsNew.js";
import ClinicalAnalysisManager from "../../clinical/clinical-analysis-manager.js";
import VariantInterpreterGridFormatter from "./variant-interpreter-grid-formatter.js";
import VariantGridFormatter from "../variant-grid-formatter.js";
import GridCommons from "../../commons/grid-commons.js";
import VariantUtils from "../variant-utils.js";
import "./variant-interpreter-grid-config.js";
import "../../clinical/clinical-interpretation-variant-review.js";
import "../../commons/opencb-grid-toolbar.js";
import "../../loading-spinner.js";
// FIXME Temporary fix in IVA, THIS MUST BE FIXED IN CELLBASE ASAP!
import {CellBaseClient} from "../../../core/clients/cellbase/cellbase-client.js";


export default class VariantInterpreterGrid extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            query: {
                type: Object
            },
            clinicalVariants: {
                type: Array
            },
            review: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.gridId = this._prefix + "VariantBrowserGrid";
        this.checkedVariants = new Map();
        this.review = false;

        // FIXME Temporary fix in IVA, THIS MUST BE FIXED IN CELLBASE ASAP!
        this.cellbaseClient = new CellBaseClient({
            host: "https://ws.zettagenomics.com/cellbase",
            version: "v5",
            species: "hsapiens"
        });

        // Set colors
        this.consequenceTypeColors = VariantGridFormatter.assignColors(CONSEQUENCE_TYPES, PROTEIN_SUBSTITUTION_SCORE);
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config, ...this.opencgaSession.user.configs?.IVA?.interpreterGrid};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);
    }

    firstUpdated(_changedProperties) {
        this.downloadRefreshIcon = $("#" + this._prefix + "DownloadRefresh");
        this.downloadIcon = $("#" + this._prefix + "DownloadIcon");
        this.table = $("#" + this.gridId);
        // this.checkedVariants = new Map();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("query")) {
            // this.opencgaSessionObserver();
            this.clinicalAnalysisObserver();
            this.renderVariants();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config, ...this.opencgaSession.user.configs?.IVA?.interpreterGrid};
            this.gridCommons = new GridCommons(this.gridId, this, this._config);
            // Config for the grid toolbar
            // some columns has tooltips in title, we cannot used them for the dropdown
            const visibleColumns = this._createDefaultColumns()[0].map(f => f.id);
            const columns = [
                {id: "id", title: "Variant", field: "id"},
                {id: "gene", title: "Genes", field: "gene"},
                {id: "type", title: "Type", field: "type"},
                {id: "consequenceType", title: "Gene Annotations", field: "consequenceType"}
            ].filter(f => ~visibleColumns.indexOf(f.id));
            this.toolbarConfig = {
                ...this._config.toolbar,
                resource: "VARIANT",
                columns: columns
            };
        }
    }

    opencgaSessionObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config, ...this.opencgaSession.user.configs?.IVA?.interpreterGrid};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);
    }

    clinicalAnalysisObserver() {
        // We need to load server config always.
        this._config = {...this.getDefaultConfig(), ...this.config, ...this.opencgaSession.user.configs?.IVA?.interpreterGrid};
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);

        // Make sure somatic sample is the first one
        if (this.clinicalAnalysis) {
            if (!this.clinicalAnalysis.interpretation) {
                this.clinicalAnalysis.interpretation = {};
            }

            this.checkedVariants = new Map();
            if (this.clinicalAnalysis?.interpretation?.primaryFindings?.length > 0) {
                for (const variant of this.clinicalAnalysis.interpretation.primaryFindings) {
                    this.checkedVariants.set(variant.id, variant);
                }
            } else {
                this.checkedVariants.clear();
            }
            // this.gridCommons.checkedRows = this.checkedVariants;

            if (this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
                if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples &&
                    this.clinicalAnalysis.proband.samples.length === 2 && this.clinicalAnalysis.proband.samples[1].somatic) {
                    this.clinicalAnalysis.proband.samples = this.clinicalAnalysis.proband.samples.reverse();
                }
            }
        }
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    renderVariants() {
        if (this._config.renderLocal) {
            // FIXME remove this ASAP
            this.clinicalVariants = this.clinicalAnalysis.interpretation.primaryFindings;
        }

        if (this.clinicalVariants?.length > 0) {
            this.renderLocalVariants();
        } else {
            this.renderRemoteVariants();
        }
        this.requestUpdate();
    }

    renderRemoteVariants() {
        if (!this.clinicalAnalysis || !this.clinicalAnalysis.interpretation || !this._config) {
            console.warn("clinicalAnalysis or interpretation do not exist");
            return;
        }

        if (!this.query?.sample) {
            console.warn("No sample found, query: ", this.query);
            return;
        }

        this.table = $("#" + this.gridId);
        if (this.opencgaSession && this.opencgaSession.project && this.opencgaSession.study) {
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._createDefaultColumns(),
                method: "get",
                sidePagination: "server",
                // Set table properties, these are read from config property
                uniqueId: "id",
                silentSort: false,
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: (pageFrom, pageTo, totalRows) => this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows, null, this.isApproximateCount),
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this.detailFormatter,
                formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

                // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
                variantGrid: this,

                ajax: params => {
                    // Make a deep clone object to manipulate the query sent to OpenCGA
                    const internalQuery = JSON.parse(JSON.stringify(this.query));

                    // We need to make sure that the proband is the first sample when analysing Families
                    if (this.clinicalAnalysis.type.toUpperCase() === "FAMILY" && this.query?.sample) {
                        // Note:
                        // - sample=A;B;C
                        // - sample=A:0/1,1/1;B:1/1;C:1/1
                        // There is also another param called: 'includeSample'

                        const samples = internalQuery.sample.split(";");
                        const sortedSamples = [];
                        for (const sample of samples) {
                            const sampleFields = sample.split(":");
                            if (sampleFields && sampleFields[0] === this.clinicalAnalysis.proband.samples[0].id) {
                                sortedSamples.unshift(sample);
                            } else {
                                sortedSamples.push(sample);
                            }
                        }

                        // For all non proband samples
                        const newQuerySample = [sortedSamples[0]];
                        for (let i = 1; i < sortedSamples.length; i++) {
                            // Non proband samples must have a genotype filter BUT ir cannot have ALL the genotypes
                            if (sortedSamples[i].includes(":")) {
                                if (!sortedSamples[i].includes("0/0") || !sortedSamples[i].includes("0/1") || !sortedSamples[i].includes("1/1")) {
                                    newQuerySample.push(sortedSamples[i]);
                                }
                            }
                        }
                        internalQuery.sample = newQuerySample.join(";");

                        const sortedSampleIds = [];
                        for (const member of this.clinicalAnalysis.family.members) {
                            if (member && member.id === this.clinicalAnalysis.proband.id) {
                                sortedSampleIds.unshift(member.samples[0].id);
                            } else {
                                if (member.samples?.[0]?.id) {
                                    sortedSampleIds.push(member.samples[0].id);
                                }
                            }
                        }
                        internalQuery.includeSample = sortedSampleIds.join(",");
                    }

                    const tableOptions = $(this.table).bootstrapTable("getOptions");
                    const filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit || tableOptions.pageSize,
                        skip: params.data.offset || 0,
                        count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,
                        includeSampleId: "true",

                        approximateCount: true,
                        approximateCountSamplingSize: 500,

                        ...internalQuery
                        // unknownGenotype: "0/0"
                    };

                    this.opencgaSession.opencgaClient.clinical().queryVariant(filters)
                        .then(res => {
                            this.isApproximateCount = res.responses[0].attributes?.approximateCount ?? false;

                            // FIXME Temporary fix in IVA, THIS MUST BE FIXED IN CELLBASE ASAP!
                            const geneSet = new Set();
                            for (const variant of res.responses[0].results) {
                                variant.annotation.consequenceTypes
                                    .filter(ct => ct.transcriptFlags?.includes("MANE Select"))
                                    .map(ct => geneSet.add(ct.geneName));
                            }
                            // make sure there are some genes to query
                            if (geneSet.size > 0) {
                                const geneNamesString = Array.from(geneSet).join(",");
                                this.cellbaseClient.get("feature", "gene", geneNamesString, "info", {
                                    exclude: "transcripts.exons,transcripts.tfbs,transcripts.annotation,annotation",
                                    source: "ensembl"
                                })
                                    .then(genes => {
                                        const refseqManeSelectSet = new Set();
                                        const refseqManePlusClinicalSet = new Set();
                                        for (const gene of genes.responses) {
                                            const transcripts = gene.results[0].transcripts
                                                .filter(t => t.flags?.includes("MANE Select") || t.flags?.includes("MANE Plus Clinical"));
                                            for (const transcript of transcripts) {
                                                const xref = transcript.xrefs.find(x => x.dbName === "mane_select_refseq");
                                                if (xref) {
                                                    if (transcript.flags.includes("MANE Select")) {
                                                        refseqManeSelectSet.add(xref.id);
                                                    } else {
                                                        refseqManePlusClinicalSet.add(xref.id);
                                                    }
                                                }
                                            }
                                        }
                                        for (const variant of res.responses[0].results) {
                                            for (const ct of variant.annotation.consequenceTypes) {
                                                if (!ct.transcriptFlags) {
                                                    ct.transcriptFlags = [];
                                                }
                                                if (refseqManeSelectSet.has(ct.transcriptId)) {
                                                    ct.transcriptFlags.push("MANE Select");
                                                }
                                                if (refseqManePlusClinicalSet.has(ct.transcriptId)) {
                                                    ct.transcriptFlags.push("MANE Plus Clinical");
                                                }
                                            }
                                        }

                                        params.success(res);
                                    })
                                    .catch(e =>{
                                        console.error(e);
                                    });
                            } else {
                                params.success(res);
                            }
                        })
                        .catch(e => {
                            console.error(e);
                            params.error(e);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onDblClickRow: (row, element, field) => {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (this._config.detailView) {
                        if (element[0].innerHTML.includes("icon-plus")) {
                            $("#" + this.gridId).bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            $("#" + this.gridId).bootstrapTable("collapseRow", element[0].dataset.index);
                        }
                    }
                },
                onLoadSuccess: data => {
                    // We keep the table rows as global variable, needed to fetch the variant object when checked
                    this._rows = data.rows;
                    this.gridCommons.onLoadSuccess(data, 2);
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                onExpandRow: (index, row, $detail) => {
                    // Listen to Show/Hide link in the detail formatter consequence type table
                    // TODO remove this
                    document.getElementById(this._prefix + row.id + "ShowEvidence").addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));
                    document.getElementById(this._prefix + row.id + "HideEvidence").addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));

                    document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));
                    document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));

                    UtilsNew.initTooltip(this);
                }
            });
        }
    }

    renderLocalVariants() {
        if (!this.clinicalAnalysis.interpretation.primaryFindings) {
            return;
        }

        // const _variants = this.clinicalAnalysis.interpretation.primaryFindings;

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.clinicalVariants,
            columns: this._createDefaultColumns(),
            sidePagination: "local",

            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "both",
            formatShowingRows: this.gridCommons.formatShowingRows,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

            // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
            variantGrid: this,

            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onDblClickRow: (row, element, field) => {
                // We detail view is active we expand the row automatically.
                // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                if (this._config.detailView) {
                    if (element[0].innerHTML.includes("icon-plus")) {
                        $("#" + this.gridId).bootstrapTable("expandRow", element[0].dataset.index);
                    } else {
                        $("#" + this.gridId).bootstrapTable("collapseRow", element[0].dataset.index);
                    }
                }
            },
            onExpandRow: (index, row, $detail) => {
                // Listen to Show/Hide link in the detail formatter consequence type table
                document.getElementById(this._prefix + row.id + "ShowEvidence").addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));
                document.getElementById(this._prefix + row.id + "HideEvidence").addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));

                document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));
                document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));

                UtilsNew.initTooltip(this);
            },
            onPostBody: data => {
                // We call onLoadSuccess to select first row, this is only needed when rendering from local
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
            }
        });
    }

    onCheck(e) {
        const variantId = e.currentTarget.dataset.variantId;
        const variant = this._rows.find(e => e.id === variantId);

        if (e.currentTarget.checked) {
            this.checkedVariants.set(variantId, variant);
        } else {
            this.checkedVariants.delete(variantId);
        }

        this.dispatchEvent(new CustomEvent("checkrow", {
            detail: {
                id: variantId,
                row: variant,
                checked: e.currentTarget.checked,
                rows: Array.from(this.checkedVariants.values())
            }
        }));
    }

    onReviewClick(e) {
        if (this.checkedVariants) {
            this.variantReview = this.checkedVariants.get(e.currentTarget.dataset.variantId);
            this.requestUpdate();

            $("#" + this._prefix + "ReviewSampleModal").modal("show");
        }
    }

    onConfigClick(e) {
        $("#" + this._prefix + "ConfigModal").modal("show");
    }

    /*
     *  GRID FORMATTERS
     */
    detailFormatter(value, row, a) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";
        if (row && row.annotation) {
            // if (this.variantGrid.clinicalAnalysis.type.toUpperCase() !== "CANCER") {
            //     detailHtml = "<div style='padding: 10px 0px 5px 25px'><h4>Variant Allele Frequency</h4></div>";
            //     detailHtml += "<div style='padding: 5px 40px'>";
            //     detailHtml += VariantInterpreterGridFormatter.variantAlleleFrequencyDetailFormatter(value, row, this.variantGrid);
            //     detailHtml += "</div>";
            // }

            detailHtml += "<div style='padding: 10px 0px 5px 25px'><h4>Molecular Consequence</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantInterpreterGridFormatter.reportedEventDetailFormatter(value, row, this.variantGrid, this.variantGrid.query, this.variantGrid.review, this.variantGrid._config);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 25px 0px 5px 25px'><h4>Consequence Types</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter.consequenceTypeDetailFormatter(value, row, this.variantGrid, this.variantGrid.query, this.variantGrid._config, this.variantGrid.opencgaSession.project.organism.assembly);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 20px 0px 5px 25px'><h4>Clinical Phenotypes</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter.clinicalTableDetail(value, row);
            detailHtml += "</div>";
        }
        result += detailHtml + "</div>";
        return result;
    }

    vcfDataFormatter(value, row) {
        if (row.studies?.length > 0) {
            let source = "FILE";
            if (this.field.variantCaller?.dataFilters) {
                const dataFilter = this.field.variantCaller.dataFilters.find(filter => filter.id === this.field.key);
                source = dataFilter?.source || "FILE";
            } else {
                // TODO Search in file.attributes to guess eh source
            }

            if (source === "FILE") {
                for (const file of row.studies[0].files) {
                    if (file.data[this.field.key]) {
                        return file.data[this.field.key];
                    }
                }
            } else {
                const sampleIndex = row.studies[0].samples.findIndex(sample => sample.sampleId === this.field.sampleId);
                const index = row.studies[0].sampleDataKeys.findIndex(key => key === this.field.key);
                debugger
                if (index >= 0) {
                    return row.studies[0].samples[sampleIndex].data[index];
                }
            }
        } else {
            console.error("This should never happen: row.studies[] is not valid");
        }
        return "-";
    }

    checkFormatter(value, row) {
        const checked = this.checkedVariants && this.checkedVariants.has(row.id) ? "checked" : "";
        return `<input class="Check check-variant" type="checkbox" data-variant-id="${row.id}" ${checked}>`;
    }

    reviewFormatter(value, row, index) {
        return `<button class="btn btn-link reviewButton" data-variant-id="${row.id}">
                    <i class="fa fa-edit icon-padding reviewButton" aria-hidden="true"></i>&nbsp;Edit
                </button>`;
        // return `
        //     <div>
        //         <button class="btn btn-link reviewButton" data-variant-id="${row.id}">
        //             <i class="fa fa-edit icon-padding reviewButton" aria-hidden="true" ></i>&nbsp;Edit
        //         </button>
        //     </div>
        //     <div>
        //         <opencga-interpretation-variant-review .opencgaSession="${this.opencgaSession}"
        //                                                .variant="${row}"
        //                                                mode="modal">
        //         </opencga-interpretation-variant-review>
        //     </div>`;
    }

    _createDefaultColumns() {
        // This code creates dynamically the columns for the VCF INFO and FORMAT column data.
        // Multiple file callers are supported.
        let vcfDataColumns = [];
        const vcfDataColumnNames = [];
        const fileCallers = this.clinicalAnalysis.files
            .filter(file => file.format === "VCF" && file.software?.name)
            .map(file => file.software.name.toUpperCase());

        if (this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers?.length > 0) {
            // FIXME remove specific code for ASCAT!
            const variantCallers = this.opencgaSession.study.internal.configuration.clinical.interpretation.variantCallers
                .filter(vc => vc.somatic === (this.clinicalAnalysis?.type?.toUpperCase() === "CANCER"))
                .filter(vc => vc.id.toUpperCase() !== "ASCAT")
                .filter(vc => vc.types.includes("SNV") || vc.types.includes("INDEL") || vc.types.includes("COPY_NUMBER") || vc.types.includes("CNV"));

            if (variantCallers?.length > 0) {
                for (const variantCaller of variantCallers) {
                    if (fileCallers.includes(variantCaller.id.toUpperCase())) {
                        // INFO column
                        if (!vcfDataColumnNames.includes(variantCaller.id)) {
                            vcfDataColumnNames.push(variantCaller.id);
                        }
                        if (variantCaller.columns?.length > 0) {
                            for (const column of variantCaller.columns) {
                                vcfDataColumns.push({
                                    title: column,
                                    field: {
                                        key: column,
                                        sampleId: this.clinicalAnalysis?.proband?.samples?.[0]?.id,
                                        variantCaller: variantCaller
                                    },
                                    rowspan: 1,
                                    colspan: 1,
                                    formatter: this.vcfDataFormatter,
                                    halign: "center"
                                });
                            }
                        }
                    }
                }
            }
        }

        // IMPORTANT: empty columns are not supported in boostrap-table,
        // we need to create an empty not visible column when no VCF file data is configured.
        if (!vcfDataColumns || vcfDataColumns.length === 0) {
            vcfDataColumns = [
                {
                    visible: false
                }
            ];
        }

        // Prepare Grid columns
        this._columns = [
            [
                {
                    id: "id",
                    title: "Variant",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.variantFormatter(value, row, index, this.opencgaSession.project.organism.assembly, this._config),
                    halign: "center",
                    // sortable: true
                },
                {
                    id: "gene",
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.geneFormatter(row, index, this.query, this.opencgaSession, this._config),
                    halign: "center"
                },
                {
                    id: "type",
                    title: "Type",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: VariantGridFormatter.typeFormatter.bind(this),
                    halign: "center"
                },
                {
                    id: "consequenceType",
                    title: "Gene Annotation",
                    field: "consequenceType",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.consequenceTypeFormatter(value, row, this?.query?.ct, this._config),
                    halign: "center"
                },
                {
                    id: "evidences",
                    title: "Role in Cancer",
                    field: "evidences",
                    rowspan: 2,
                    colspan: 1,
                    formatter: VariantInterpreterGridFormatter.roleInCancerFormatter.bind(this),
                    halign: "center",
                    visible: this.clinicalAnalysis.type.toUpperCase() === "CANCER"
                },
                {
                    id: "VCF_Data",
                    title: "VCF File Data: " + vcfDataColumnNames.join(", "),
                    rowspan: 1,
                    colspan: vcfDataColumns?.length,
                    halign: "center",
                    visible: vcfDataColumns?.length > 1
                },
                {
                    id: "frequencies",
                    title: `Variant Allele Frequency <a class="pop-preq-info-icon" tooltip-title="Population Frequencies" tooltip-text="${VariantGridFormatter.populationFrequenciesInfoTooltipContent(POPULATION_FREQUENCIES)}" tooltip-position-at="left bottom" tooltip-position-my="right top"><i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                    field: "frequencies",
                    rowspan: 1,
                    colspan: 2,
                    align: "center"
                },
                {
                    id: "clinicalInfo",
                    title: `Clinical Info <a id="phenotypesInfoIcon" tooltip-title="Phenotypes" tooltip-text="
                                <div>
                                    <span style='font-weight: bold'>ClinVar</span> is a freely accessible, public archive of reports of the relationships among human variations
                                    and phenotypes, with supporting evidence.
                                </div>
                                <div style='padding-top: 10px'>
                                    <span style='font-weight: bold'>COSMIC</span> is the world's largest and most comprehensive resource for exploring the impact of somatic mutations in human cancer.
                                </div>"
                            tooltip-position-at="left bottom" tooltip-position-my="right top"><i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                    rowspan: 1,
                    colspan: 2,
                    align: "center"
                },
                {
                    id: "interpretation",
                    title: "Interpretation <a class='interpretation-info-icon' tooltip-title='Interpretation' tooltip-text=\"<span style='font-weight: bold'>Prediction</span> column shows the Clinical Significance prediction and Tier following the ACMG guide recommendations\" tooltip-position-at=\"left bottom\" tooltip-position-my=\"right top\"><i class='fa fa-info-circle' aria-hidden='true'></i></a>",
                    field: "interpretation",
                    rowspan: 1,
                    colspan: this._config.showSelectCheckbox ? 2 : 1,
                    halign: "center"
                },
                {
                    id: "review",
                    title: "Review",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.reviewFormatter.bind(this),
                    align: "center",
                    events: {
                        "click button": this.onReviewClick.bind(this)
                    },
                    // visible: this._config.showReview
                    visible: this.review
                },
                {
                    id: "actions",
                    title: "Actions",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => `
                        <div class="dropdown">
                            <button class="btn btn-default btn-small ripple dropdown-toggle one-line" type="button" data-toggle="dropdown">Select action
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <li>
                                    <a href="javascript: void 0" class="btn force-text-left" data-action="download">
                                        <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download
                                    </a>
                                </li>
                                <li role="separator" class="divider"></li>
                                <li>
                                    <a href="javascript: void 0" class="btn force-text-left reviewButton" data-variant-id="${row.id} data-action="edit">
                                        <i class="fas fa-edit icon-padding reviewButton" aria-hidden="true"></i> Edit
                                    </a>
                                </li>
                                <li>
                                    <a href="javascript: void 0" class="btn disabled force-text-left" data-action="remove">
                                        <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Remove
                                    </a>
                                </li>
                            </ul>
                        </div>`,
                    align: "center",
                    events: {
                        "click a": this.onActionClick.bind(this)
                    },
                    visible: this._config.showActions && !this._config?.columns?.hidden?.includes("actions")
                }
            ],
            [
                ...vcfDataColumns,
                {
                    title: "Cohorts",
                    field: "cohort",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantInterpreterGridFormatter.studyCohortsFormatter.bind(this),
                    visible: this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                },
                {
                    title: "Population Frequencies",
                    field: "populationFrequencies",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantInterpreterGridFormatter.clinicalPopulationFrequenciesFormatter.bind(this)
                },
                {
                    title: "ClinVar",
                    field: "clinvar",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalPhenotypeFormatter,
                    align: "center"
                },
                {
                    title: "Cosmic",
                    field: "cosmic",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalPhenotypeFormatter,
                    align: "center"
                },
                {
                    title: `${this.clinicalAnalysis.type !== "CANCER" ? "ACMG <br> Prediction" : "Prediction"}`,
                    field: "prediction",
                    rowspan: 1,
                    colspan: 1,
                    formatter: VariantInterpreterGridFormatter.predictionFormatter,
                    halign: "center",
                    visible: this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                },
                {
                    title: "Select",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.checkFormatter.bind(this),
                    align: "center",
                    events: {
                        "click input": this.onCheck.bind(this)
                    },
                    visible: this._config.showSelectCheckbox
                }
            ]
        ];

        // update columns dynamically
        this._columns = this._updateTableColumns(this._columns);

        this._columns = UtilsNew.mergeTable(this._columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);

        return this._columns;
    }

    _updateTableColumns(_columns) {
        if (!_columns) {
            return;
        }

        if (this.clinicalAnalysis && (this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY")) {
            // Add Samples
            const samples = [];
            const sampleInfo = {};
            if (this.clinicalAnalysis.family && this.clinicalAnalysis.family.members) {
                for (const member of this.clinicalAnalysis.family.members) {
                    if (member.samples && member.samples.length > 0) {
                        // Proband must tbe the first column
                        if (member.id === this.clinicalAnalysis.proband.id) {
                            samples.unshift(member.samples[0]);
                        } else {
                            samples.push(member.samples[0]);
                        }
                        sampleInfo[member.samples[0].id] = {
                            proband: member.id === this.clinicalAnalysis.proband.id,
                            affected: member.disorders && member.disorders.length > 0 && member.disorders[0].id === this.clinicalAnalysis.disorder.id,
                            role: this.clinicalAnalysis.family?.roles[this.clinicalAnalysis.proband.id][member.id]?.toLowerCase(),
                            sex: member.sex
                        };
                    }
                }
            } else {
                if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples) {
                    samples.push(this.clinicalAnalysis.proband.samples[0]);
                    sampleInfo[this.clinicalAnalysis.proband.samples[0].id] = {
                        proband: true,
                        affected: this.clinicalAnalysis.proband.disorders && this.clinicalAnalysis.proband.disorders.length > 0,
                        role: "proband",
                        sex: this.clinicalAnalysis.proband.sex
                    };
                }
            }

            if (samples.length > 0) {
                _columns[0].splice(4, 0, {
                    id: "zygosity",
                    title: "Sample Genotypes",
                    field: "zygosity",
                    rowspan: 1,
                    colspan: samples.length,
                    align: "center"
                });

                for (let i = 0; i < samples.length; i++) {
                    let color = "black";
                    if (sampleInfo[samples[i].id].proband) {
                        color = "darkred";
                        if (UtilsNew.isEmpty(sampleInfo[samples[i].id].role)) {
                            sampleInfo[samples[i].id].role = "proband";
                        }
                    }

                    let affected = "<span>UnAff.</span>";
                    if (sampleInfo[samples[i].id].affected) {
                        affected = "<span style='color: red'>Aff.</span>";
                    }

                    _columns[1].splice(i, 0, {
                        title: `<span style="color: ${color}">${samples[i].id}</span>
                                <br>
                                <span style="font-style: italic">${sampleInfo[samples[i].id].role}, ${affected}</span>`,
                        field: {
                            memberIdx: i,
                            memberName: samples[i].id,
                            sampleId: samples[i].id,
                            quality: this._config.quality,
                            clinicalAnalysis: this.clinicalAnalysis,
                            config: this._config
                        },
                        rowspan: 1,
                        colspan: 1,
                        formatter: VariantInterpreterGridFormatter.sampleGenotypeFormatter,
                        align: "center",
                        nucleotideGenotype: true
                    });
                }
            }
        }

        if (this.clinicalAnalysis && this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
            // Add sample columns
            let samples = null;
            if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples) {
                // We only render somatic sample
                if (this.query && this.query.sample) {
                    samples = [];
                    const _sampleGenotypes = this.query.sample.split(";");
                    for (const sampleGenotype of _sampleGenotypes) {
                        const sampleId = sampleGenotype.split(":")[0];
                        samples.push(this.clinicalAnalysis.proband.samples.find(s => s.id === sampleId));
                    }
                } else {
                    samples = this.clinicalAnalysis.proband.samples.filter(s => s.somatic);
                }

                _columns[0].splice(5, 0, {
                    id: "sampleGenotypes",
                    title: "Sample Genotypes",
                    rowspan: 1,
                    colspan: samples.length,
                    align: "center"
                });
                for (let i = 0; i < samples.length; i++) {
                    const sample = samples[i];
                    const color = sample?.somatic ? "darkred" : "black";

                    _columns[1].splice(i, 0, {
                        title: `<span>${sample.id}</span><br>
                                <span style="color: ${color};font-style: italic">${sample?.somatic ? "somatic" : "germline"}</span>`,
                        field: {
                            sampleId: sample.id,
                            quality: this._config.quality,
                            config: this._config,
                            clinicalAnalysis: this.clinicalAnalysis
                        },
                        rowspan: 1,
                        colspan: 1,
                        formatter: VariantInterpreterGridFormatter.sampleGenotypeFormatter,
                        align: "center",
                        nucleotideGenotype: true
                    });
                }
            }
        }

        return _columns;
    }

    onActionClick(e, value, row) {
        const {action} = e.target.dataset;
        if (action === "download") {
            UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
        }
    }

    // TODO fix tab jsonToTabConvert isn't working!
    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;
        if (this.clinicalAnalysis.type.toUpperCase() === "FAMILY" && this.query?.sample) {
            const samples = this.query.sample.split(";");
            const sortedSamples = [];
            for (const sample of samples) {
                const sampleFields = sample.split(":");
                if (sampleFields && sampleFields[0] === this.clinicalAnalysis.proband.samples[0].id) {
                    sortedSamples.unshift(sample);
                } else {
                    sortedSamples.push(sample);
                }
            }
            this.query.sample = sortedSamples.join(";");
        }

        const filters = {
            study: this.opencgaSession.study.fqn,
            limit: 1000,
            count: false,
            includeSampleId: "true",
            ...this.query
        };
        this.opencgaSession.opencgaClient.clinical().queryVariant(filters)
            .then(restResponse => {
                const results = restResponse.getResults();
                // Check if user clicked in Tab or JSON format
                if (e.detail.option.toLowerCase() === "tab") {
                    const dataString = VariantUtils.jsonToTabConvert(results, POPULATION_FREQUENCIES.studies, this.samples, this._config.nucleotideGenotype);
                    console.log("dataString", dataString);
                    UtilsNew.downloadData(dataString, "variant_interpreter_" + this.opencgaSession.study.id + ".txt", "text/plain");
                } else {
                    UtilsNew.downloadData(JSON.stringify(results, null, "\t"), this.opencgaSession.study.id + ".json", "application/json");
                }
            })
            .catch(response => {
                console.log(response);
                UtilsNew.notifyError(response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
            });
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            showExport: false,
            detailView: true,
            showReview: true,
            showSelectCheckbox: false,
            showActions: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 10,

            genotype: {
                type: "VAF"
            },
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },

            quality: {
                qual: 30,
                dp: 20
            },
            populationFrequencies: ["1kG_phase3:ALL", "GNOMAD_GENOMES:ALL", "GNOMAD_EXOMES:ALL", "UK10K:ALL", "GONL:ALL", "ESP6500:ALL", "EXAC:ALL"],

            consequenceType: {
                maneTranscript: true,
                gencodeBasicTranscript: true,
                ensemblCanonicalTranscript: true,
                ccdsTranscript: false,
                ensemblTslTranscript: false,
                proteinCodingTranscript: false,
                highImpactConsequenceTypeTranscript: false,

                showNegativeConsequenceTypes: true
            },

            evidences: {
                showSelectCheckbox: true
            }
        };
    }

    showLoading() {
        $("#" + this.gridId).bootstrapTable("showLoading");
    }


    onGridConfigChange(e) {
        this.__config = e.detail.value;
    }

    async onApplySettings(e) {
        try {
            this._config = {...this.getDefaultConfig(), ...this.opencgaSession.user.configs?.IVA?.interpreterGrid, ...this.__config};

            // TODO Delete old config values. Remove this in IVA 2.2
            delete this._config.consequenceType.canonicalTranscript;
            delete this._config.consequenceType.gencodeBasic;
            delete this._config.consequenceType.highQualityTranscripts;
            delete this._config.consequenceType.proteinCodingTranscripts;
            delete this._config.consequenceType.worstConsequenceTypes;
            delete this._config.consequenceType.filterByBiotype;
            delete this._config.consequenceType.filterByConsequenceType;
            delete this._config.consequenceType.highImpactConsequenceTypeTranscripts;

            const userConfig = await this.opencgaSession.opencgaClient.updateUserConfigs({
                ...this.opencgaSession.user.configs.IVA,
                interpreterGrid: this._config
            });
            this.opencgaSession.user.configs.IVA = userConfig.responses[0].results[0];
            this.renderVariants();
        } catch (e) {
            UtilsNew.notifyError(e);
        }
    }


    onVariantChange(e) {
        this._variantChanged = e.detail.value;
        // this._variantUpdates = e.detail.update;
    }

    onSaveVariant(e) {
        if (this._variantChanged) {
            this.clinicalAnalysisManager.updateVariant(this._variantChanged, this.clinicalAnalysis.interpretation);
            this._variantChanged = null;
        }
    }

    onCancelVariant(e) {
        this._variantChanged = null;
    }

    getRightToolbar() {
        return [
            {
                render: () => html`
                    <button type="button" class="btn btn-default btn-sm ripple" aria-haspopup="true" aria-expanded="false" @click="${e => this.onConfigClick(e)}">
                        <i class="fas fa-cog icon-padding"></i> Settings ...
                    </button>`
            }
        ];
    }

    render() {
        return html`
            <style>
                .variant-link-dropdown:hover .dropdown-menu {
                    display: block;
                }
                .qtip-custom-class {
                    font-size: 13px;
                    max-width: none;
                }
                .check-variant {
                    transform: scale(1.2);
                }
            </style>

            <opencb-grid-toolbar
                .config="${this.toolbarConfig}"
                .query="${this.query}"
                .opencgaSession="${this.opencgaSession}"
                .rightToolbar="${this.getRightToolbar()}"
                @columnChange="${this.onColumnChange}"
                @download="${this.onDownload}"
                @export="${this.onDownload}">
            </opencb-grid-toolbar>

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}VariantBrowserGrid"></table>
            </div>

            <div class="modal fade" id="${this._prefix}ReviewSampleModal" tabindex="-1"
                 role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog" style="width: 768px">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <h3>Review Variant</h3>
                        </div>
                        <clinical-interpretation-variant-review
                            .opencgaSession="${this.opencgaSession}"
                            .variant="${this.variantReview}"
                            mode=${"form"}
                            @variantChange="${e => this.onVariantChange(e)}">
                        </clinical-interpretation-variant-review>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${e => this.onSaveVariant(e)}">OK</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="${this._prefix}ConfigModal" tabindex="-1"
                 role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog" style="width: 1024px">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h3>Settings</h3>
                        </div>
                        <div class="modal-body">
                            <div class="container-fluid">
                                <variant-interpreter-grid-config
                                    .config="${this._config}"
                                    @configChange="${this.onGridConfigChange}">
                                </variant-interpreter-grid-config>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${e => this.onApplySettings(e)}">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-grid", VariantInterpreterGrid);
