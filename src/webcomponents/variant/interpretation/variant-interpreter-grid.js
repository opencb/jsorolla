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
import "../../clinical/interpretation/clinical-interpretation-variant-review.js";
import "../../clinical/interpretation/clinical-interpretation-variant-evidence-review.js";
import "../../commons/opencb-grid-toolbar.js";
import "../../loading-spinner.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

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

        // Set colors
        this.consequenceTypeColors = VariantGridFormatter.assignColors(CONSEQUENCE_TYPES, PROTEIN_SUBSTITUTION_SCORE);
    }

    connectedCallback() {
        super.connectedCallback();

        // this._config = {...this.getDefaultConfig(), ...this.config, ...this.opencgaSession.user.configs?.IVA?.interpreterGrid};
        // this.gridCommons = new GridCommons(this.gridId, this, this._config);
        // this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
    }

    firstUpdated(_changedProperties) {
        this.table = $("#" + this.gridId);
        this.downloadRefreshIcon = $("#" + this._prefix + "DownloadRefresh");
        this.downloadIcon = $("#" + this._prefix + "DownloadIcon");
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("query")) {
            this.renderVariants();
        }

        if (changedProperties.has("clinicalVariants")) {
            this.renderVariants();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.gridCommons = new GridCommons(this.gridId, this, this._config);

            // Config for the grid toolbar
            // some columns have tooltips in title, we cannot used them for the dropdown
            this.toolbarConfig = {
                ...this._config,
                ...this._config.toolbar, // it comes from external settings
                resource: "CLINICAL_VARIANT",
                // showExport: true,
                columns: this._getDefaultColumns()[0].filter(col => col.rowspan === 2 && col.colspan === 1 && col.visible !== false),
                gridColumns: this._getDefaultColumns() // original column structure
            };
            this.requestUpdate();
            this.renderVariants();
        }
    }

    opencgaSessionObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
    }

    clinicalAnalysisObserver() {
        // We need to load server config always.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);

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
        if (this.opencgaSession && this.opencgaSession.project && this.opencgaSession.study) {
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._getDefaultColumns(),
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
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
                detailFormatter: (value, row) => this.detailFormatter(value, row),
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
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit || tableOptions.pageSize,
                        skip: params.data.offset || 0,
                        count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,
                        includeSampleId: "true",

                        approximateCount: true,
                        approximateCountSamplingSize: 500,

                        ...internalQuery,
                        unknownGenotype: "0/0"
                    };

                    this.opencgaSession.opencgaClient.clinical().queryVariant(this.filters)
                        .then(res => {
                            this.isApproximateCount = res.responses[0].attributes?.approximateCount ?? false;
                            params.success(res);
                        })
                        .catch(e => params.error(e))
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));

                    // Merge response rows with user information (comments, status, ...) stored in primaryFindings
                    if (this.clinicalAnalysis?.interpretation?.primaryFindings?.length > 0) {
                        result.response.rows = result.response.rows.map(row => {
                            if (!this.checkedVariants.has(row.id)) {
                                return row;
                            }

                            // Merge row with comments and other user properties
                            const savedVariant = this.checkedVariants.get(row.id);
                            return {
                                ...row,
                                comments: savedVariant.comments,
                                status: savedVariant.status,
                                attributes: savedVariant.attributes,
                                discussion: savedVariant.discussion,
                                evidences: row.evidences.map((evidence, index) => ({
                                    ...evidence,
                                    review: savedVariant.evidences[index],
                                })),
                            };
                        });
                    }

                    return result.response;
                },
                onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onDblClickRow: (row, element) => {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (this._config.detailView) {
                        if (element[0].innerHTML.includes("fa-plus")) {
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

                    // Add events for displaying genes list
                    const gridElement = document.querySelector(`#${this.gridId}`);
                    if (gridElement) {
                        Array.from(gridElement.querySelectorAll("div[data-role='genes-list']")).forEach(el => {
                            const genesList = el.querySelector("span[data-role='genes-list-extra']");
                            const genesShowLink = el.querySelector("a[data-role='genes-list-show']");
                            const genesHideLink = el.querySelector("a[data-role='genes-list-hide']");

                            // Click on show more genes link
                            genesShowLink.addEventListener("click", () => {
                                genesShowLink.style.display = "none";
                                genesHideLink.style.display = "block";
                                genesList.style.display = "inline-block";
                            });

                            // Click on show less genes link
                            genesHideLink.addEventListener("click", () => {
                                genesHideLink.style.display = "none";
                                genesShowLink.style.display = "block";
                                genesList.style.display = "none";
                            });
                        });
                    }
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                onExpandRow: (index, row) => {
                    // Automatically select this row after clicking on "+" icons
                    this.gridCommons.onClickRow(row.id, row, this.querySelector(`tr[data-index="${index}"]`));

                    // Listen to Show/Hide link in the detail formatter consequence type table
                    // TODO remove this
                    document.getElementById(this._prefix + row.id + "ShowEvidence").addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));
                    document.getElementById(this._prefix + row.id + "HideEvidence").addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));

                    document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));
                    document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));

                    // Enable or disable evidence select
                    Array.from(document.getElementsByClassName(`${this._prefix}EvidenceReviewCheckbox`)).forEach(element => {
                        if (row.id === element.dataset.variantId) {
                            // eslint-disable-next-line no-param-reassign
                            element.disabled = !this.checkedVariants.has(row.id) || this.clinicalAnalysis.locked;
                            element.addEventListener("change", e => this.onEvidenceCheck(e));
                        }
                    });

                    // Enable or disable evidence edit and register event listeners
                    Array.from(document.getElementsByClassName(this._prefix + "EvidenceReviewButton")).forEach(element => {
                        if (row.id === element.dataset.variantId) {
                            let isEvidenceSelected = false;
                            if (this.checkedVariants.has(row.id)) {
                                const evidenceIndex = parseInt(element.dataset.clinicalEvidenceIndex);
                                const evidence = this.checkedVariants.get(row.id).evidences[evidenceIndex];

                                isEvidenceSelected = evidence.review?.select || false;
                            }

                            // Prevent editing evidences of not selected variants
                            // eslint-disable-next-line no-param-reassign
                            element.disabled = !isEvidenceSelected || this.clinicalAnalysis.locked;
                            element.addEventListener("click", e => this.onVariantEvidenceReview(e));
                        }
                    });

                    UtilsNew.initTooltip(this);
                },
                rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
            });
        }
    }

    renderLocalVariants() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.clinicalVariants,
            columns: this._getDefaultColumns(),
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "both",
            formatShowingRows: this.gridCommons.formatShowingRows,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: (value, row) => this.detailFormatter(value, row),
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

            // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
            variantGrid: this,

            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onDblClickRow: (row, element) => {
                // We detail view is active we expand the row automatically.
                // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                if (this._config.detailView) {
                    if (element[0].innerHTML.includes("fa-plus")) {
                        $("#" + this.gridId).bootstrapTable("expandRow", element[0].dataset.index);
                    } else {
                        $("#" + this.gridId).bootstrapTable("collapseRow", element[0].dataset.index);
                    }
                }
            },
            onExpandRow: (index, row) => {
                // Automatically select this row after clicking on "+" icons
                this.gridCommons.onClickRow(row.id, row, this.querySelector(`tr[data-index="${index}"]`));

                // Listen to Show/Hide link in the detail formatter consequence type table
                document.getElementById(this._prefix + row.id + "ShowEvidence").addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));
                document.getElementById(this._prefix + row.id + "HideEvidence").addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));

                document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));
                document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));

                // Enable or disable evidence select
                Array.from(document.getElementsByClassName(`${this._prefix}EvidenceReviewCheckbox`)).forEach(element => {
                    if (row.id === element.dataset.variantId) {
                        // eslint-disable-next-line no-param-reassign
                        element.disabled = !this.checkedVariants.has(row.id) || this.clinicalAnalysis.locked;
                        element.addEventListener("change", e => this.onEvidenceCheck(e));
                    }
                });

                // Enable or disable evidence edit and register event listeners
                Array.from(document.getElementsByClassName(this._prefix + "EvidenceReviewButton")).forEach(element => {
                    if (row.id === element.dataset.variantId) {
                        let isEvidenceSelected = false;
                        if (this.checkedVariants.has(row.id)) {
                            const evidenceIndex = parseInt(element.dataset.clinicalEvidenceIndex);
                            const evidence = this.checkedVariants.get(row.id).evidences[evidenceIndex];

                            isEvidenceSelected = evidence.review?.select || false;
                        }

                        // Prevent editing evidences of not selected variants
                        // eslint-disable-next-line no-param-reassign
                        element.disabled = !isEvidenceSelected || this.clinicalAnalysis.locked;
                        element.addEventListener("click", e => this.onVariantEvidenceReview(e));
                    }
                });

                UtilsNew.initTooltip(this);
            },
            onPostBody: data => {
                // We call onLoadSuccess to select first row, this is only needed when rendering from local
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
            },
            onLoadSuccess: () => {
                // Add events for displaying genes list
                const gridElement = document.querySelector(`#${this.gridId}`);
                if (gridElement) {
                    Array.from(gridElement.querySelectorAll("div[data-role='genes-list']")).forEach(el => {
                        const genesList = el.querySelector("span[data-role='genes-list-extra']");
                        const genesShowLink = el.querySelector("a[data-role='genes-list-show']");
                        const genesHideLink = el.querySelector("a[data-role='genes-list-hide']");

                        // Click on show more genes link
                        genesShowLink.addEventListener("click", () => {
                            genesShowLink.style.display = "none";
                            genesHideLink.style.display = "block";
                            genesList.style.display = "inline-block";
                        });

                        // Click on show less genes link
                        genesHideLink.addEventListener("click", () => {
                            genesHideLink.style.display = "none";
                            genesShowLink.style.display = "block";
                            genesList.style.display = "none";
                        });
                    });
                }
            },
            rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
        });
    }

    /*
     *  GRID FORMATTERS
     */
    detailFormatter(value, row, a) {
        let variant = row;
        if (this.checkedVariants && this.checkedVariants.has(variant.id)) {
            variant = this.checkedVariants.get(variant.id);
        }
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";
        if (row?.annotation) {
            detailHtml += "<div style='padding: 10px 0px 5px 25px'><h4>Clinical Evidences</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantInterpreterGridFormatter.reportedEventDetailFormatter(value, variant, this, this.query, this.review, this._config);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 25px 0px 5px 25px'><h4>Consequence Types</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter.consequenceTypeDetailFormatter(value, row, this, this.query, this._config, this.opencgaSession.project.organism.assembly);
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
                // debugger;
                if (index >= 0) {
                    return row.studies[0].samples[sampleIndex].data[index];
                }
            }
        } else {
            console.error("This should never happen: row.studies[] is not valid");
        }
        return "-";
    }

    _getDefaultColumns() {
        // This code creates dynamically the columns for the VCF INFO and FORMAT column data.
        // Multiple file callers are supported.
        let vcfDataColumns = [];
        const vcfDataColumnNames = [];
        const variantTypes = new Set(this._config.variantTypes || []);
        const fileCallers = (this.clinicalAnalysis?.files || [])
            .filter(file => file.format === "VCF" && file.software?.name)
            .map(file => file.software.name.toUpperCase());

        if (this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers?.length > 0) {
            // FIXME remove specific code for ASCAT!
            const variantCallers = this.opencgaSession.study.internal.configuration.clinical.interpretation.variantCallers
                .filter(vc => vc.somatic === this._config.somatic)
                .filter(vc => vc.types.some(type => variantTypes.has(type)));

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
                                    id: column.replace("EXT_", ""),
                                    title: column.replace("EXT_", ""),
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
                    id: "type",
                    title: "Type",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: VariantGridFormatter.typeFormatter.bind(this),
                    halign: "center",
                    visible: !this._config.hideType,
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
                    id: "hgvs",
                    title: "HGVS",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.hgvsFormatter(row, this._config),
                    halign: "center",
                    visible: !!this._config.showHgvs,
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
                    title: `Variant Allele Frequency
                        <a class="pop-preq-info-icon"
                            tooltip-title="Population Frequencies"
                            tooltip-text="${VariantGridFormatter.populationFrequenciesInfoTooltipContent(POPULATION_FREQUENCIES)}"
                            tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                        </a>`,
                    field: "frequencies",
                    rowspan: 1,
                    colspan: 2,
                    align: "center",
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
                    title: `Interpretation
                        <a class='interpretation-info-icon'
                            tooltip-title='Interpretation'
                            tooltip-text="<span style='font-weight: bold'>Prediction</span> column shows the Clinical Significance prediction and Tier following the ACMG guide recommendations"
                            tooltip-position-at="left bottom"
                            tooltip-position-my="right top">
                            <i class='fa fa-info-circle' aria-hidden='true'></i>
                        </a>`,
                    field: "interpretation",
                    rowspan: 1,
                    colspan: 3,
                    halign: "center"
                },
                {
                    id: "actions",
                    title: "Actions",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        let copiesHtml = "";
                        if (this._config.copies) {
                            for (const copy of this._config.copies) {
                                copiesHtml = `
                                    <li>
                                        <a href="javascript: void 0" class="btn force-text-left" data-action="${copy.id}">
                                            <i class="fas fa-copy icon-padding" aria-hidden="true" alt="${copy.description}"></i> ${copy.name}
                                        </a>
                                    </li>
                                `;
                            }
                        }

                        const reviewId = `${this._prefix}${row.id}VariantReviewActionButton`;
                        const reviewDisabled = !this.checkedVariants.has(row.id) || this.clinicalAnalysis.locked ? "disabled" : "";

                        return `
                            <div class="dropdown">
                                <button class="btn btn-default btn-sm dropdown-toggle one-line" type="button" data-toggle="dropdown">Actions
                                    <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-right">
                                    <li>
                                        <a id="${reviewId}" href="javascript: void 0" class="btn force-text-left reviewButton" data-action="edit" ${reviewDisabled}>
                                            <i class="fas fa-edit icon-padding reviewButton" aria-hidden="true"></i> Edit ...
                                        </a>
                                    </li>
                                    <li role="separator" class="divider"></li>
                                    <li class="dropdown-header">Genome Browser</li>
                                    <li>
                                        <a class="btn force-text-left" data-action="genome-browser">
                                            <i class="fas fa-dna icon-padding" aria-hidden="true"></i>Genome Browser
                                        </a>
                                    </li>
                                    <li class="dropdown-header">External Genome Browsers</li>
                                    <li>
                                        <a target="_blank" class="btn force-text-left"
                                                href="${BioinfoUtils.getVariantLink(row.id, row.chromosome + ":" + row.start + "-" + row.end, "ensembl_genome_browser")}">
                                            <i class="fas fa-external-link-alt icon-padding" aria-hidden="true"></i> Ensembl Genome Browser
                                        </a>
                                    </li>
                                    <li>
                                        <a target="_blank" class="btn force-text-left"
                                                href="${BioinfoUtils.getVariantLink(row.id, row.chromosome + ":" + row.start + "-" + row.end, "ucsc_genome_browser")}">
                                            <i class="fas fa-external-link-alt icon-padding" aria-hidden="true"></i> UCSC Genome Browser
                                        </a>
                                    </li>
                                    <li role="separator" class="divider"></li>
                                    <li class="dropdown-header">Fetch Variant</li>
                                    <li>
                                        <a href="javascript: void 0" class="btn force-text-left" data-action="copy-json">
                                            <i class="fas fa-copy icon-padding" aria-hidden="true"></i> Copy JSON
                                        </a>
                                    </li>
                                    <li>
                                        <a href="javascript: void 0" class="btn force-text-left" data-action="download">
                                            <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download JSON
                                        </a>
                                    </li>
                                    ${copiesHtml ? `
                                        <li role="separator" class="divider"></li>
                                        <li class="dropdown-header">Custom Copy</li>
                                        ${copiesHtml}
                                    ` : ""}
                                </ul>
                            </div>`;
                    },
                    align: "center",
                    visible: this._config?.showActions,
                    events: {
                        "click a": (e, value, row) => this.onActionClick(e, value, row)
                    },
                    excludeFromExport: true // this is used in opencga-export
                    // visible: this._config.showActions && !this._config?.columns?.hidden?.includes("actions")
                },
            ],
            [
                ...vcfDataColumns,
                {
                    id: "cohort",
                    title: "Cohorts",
                    field: "cohort",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantInterpreterGridFormatter.studyCohortsFormatter.bind(this),
                    visible: this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                },
                {
                    id: "populationFrequencies",
                    title: "Population Frequencies",
                    field: "populationFrequencies",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantInterpreterGridFormatter.clinicalPopulationFrequenciesFormatter.bind(this),
                    visible: !this._config.hidePopulationFrequencies,
                },
                {
                    id: "clinvar",
                    title: "ClinVar",
                    field: "clinvar",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalPhenotypeFormatter,
                    align: "center",
                    visible: !this._config.hideClinicalInfo,
                },
                {
                    id: "cosmic",
                    title: "Cosmic",
                    field: "cosmic",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalPhenotypeFormatter,
                    align: "center",
                    visible: !this._config.hideClinicalInfo,
                },
                // Interpretation Column
                {
                    id: "prediction",
                    title: `${this.clinicalAnalysis.type !== "CANCER" ? "ACMG <br> Prediction" : "Prediction"}`,
                    field: "prediction",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => {
                        const checkedVariant = this.checkedVariants?.has(row.id) ? this.checkedVariants.get(row.id) : row;
                        return VariantInterpreterGridFormatter.predictionFormatter(value, checkedVariant);
                    },
                    align: "center",
                    visible: this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                },
                {
                    id: "Select",
                    title: "Select",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => {
                        const checked = this.checkedVariants?.has(row.id) ? "checked" : "";
                        const disabled = this.clinicalAnalysis.locked ? "disabled" : "";
                        return `<input class="check check-variant" type="checkbox" data-variant-id="${row.id}" ${checked} ${disabled}>`;
                    },
                    align: "center",
                    events: {
                        "click input": e => this.onVariantCheck(e)
                    },
                    visible: this._config.showSelectCheckbox,
                    excludeFromExport: true // this is used in opencga-export
                },
                {
                    id: "review",
                    title: "Review",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => {
                        const disabled = !this.checkedVariants?.has(row.id) || this.clinicalAnalysis.locked ? "disabled" : "";
                        return `
                        ${this._config?.showEditReview ? `
                            <button id="${this._prefix}${row.id}VariantReviewButton" class="btn btn-link" data-variant-id="${row.id}" ${disabled}>
                                <i class="fa fa-edit icon-padding" aria-hidden="true"></i>&nbsp;Edit ...
                            </button>`: ""
                        }
                            ${this.checkedVariants?.has(row.id) ? `
                                <div class="help-block" style="margin: 5px 0">${this.checkedVariants.get(row.id).status}</div>
                            ` : ""
                        }
                        `;
                    },
                    align: "center",
                    events: {
                        "click button": e => this.onVariantReview(e)
                    },
                    visible: this.review,
                    excludeFromExport: true // this is used in opencga-export
                },
            ]
        ];

        // update columns dynamically
        this._columns = this._updateTableColumns(this._columns);

        this._columns = UtilsNew.mergeTable(this._columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);

        return this._columns;
    }

    _updateTableColumns(_columns) {
        let samples = [];
        if (!_columns) {
            return;
        }

        if (this.clinicalAnalysis && (this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY")) {
            // Add Samples
            // const samples = [];
            const sampleInfo = {};
            if (this.clinicalAnalysis.family && this.clinicalAnalysis.family.members) {
                for (const member of this.clinicalAnalysis.family.members) {
                    if (member.samples && member.samples.length > 0) {
                        // Proband must be the first column
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
                _columns[0].splice(5, 0, {
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
                        id: samples[i].id,
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
            // let samples = null;
            if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples) {
                // We only render somatic sample
                if (this.query && this.query.sample) {
                    const _sampleGenotypes = this.query.sample.split(";");
                    for (const sampleGenotype of _sampleGenotypes) {
                        const sampleId = sampleGenotype.split(":")[0];
                        samples.push(this.clinicalAnalysis.proband.samples.find(s => s.id === sampleId));
                    }
                } else {
                    samples = this.clinicalAnalysis.proband.samples.filter(s => s.somatic);
                }

                _columns[0].splice(6, 0, {
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
                        id: sample.id,
                        title: `
                            <div style="word-break:break-all;max-width:192px;white-space:break-spaces;">${sample.id}</div>
                            <div style="color:${color};font-style:italic;">${sample?.somatic ? "somatic" : "germline"}</div>
                        `,
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
        const action = e.target.dataset.action?.toLowerCase();
        switch (action) {
            case "edit":
                if (this.checkedVariants) {
                    // Generate a clone of the variant review to prevent changing original values
                    this.variantReview = UtilsNew.objectClone(this.checkedVariants.get(row.id));
                    this.requestUpdate();

                    $("#" + this._prefix + "ReviewSampleModal").modal("show");
                }
                break;
            case "genome-browser":
                LitUtils.dispatchCustomEvent(this, "genomeBrowserRegionChange", null, {
                    region: row.chromosome + ":" + row.start + "-" + row.end,
                });
                break;
            case "copy-json":
                navigator.clipboard.writeText(JSON.stringify(row, null, "\t"));
                break;
            case "download":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
            default:
                const copy = this._config.copies.find(copy => copy.id === action);
                if (copy) {
                    BioinfoUtils.sort(row.annotation?.consequenceTypes, v => v.geneName);
                    const showArrayIndexes = VariantGridFormatter._consequenceTypeDetailFormatterFilter(row.annotation?.consequenceTypes, this._config).indexes;

                    navigator.clipboard.writeText(copy.execute(row, showArrayIndexes));
                }
                break;
        }
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;

        // exportFilename is a way to override the default filename. Atm it is used in variant-interpreter-review-primary only.
        // variant-interpreter-browser uses the default name (which doesn't include the interpretation id).
        const date = UtilsNew.dateFormatter(new Date(), "YYYYMMDDhhmm");
        const filename = this._config?.exportFilename ?? `variant_interpreter_${this.opencgaSession.study.id}_${this.clinicalAnalysis.id}_${this.clinicalAnalysis?.interpretation?.id ?? ""}_${date}`;
        if (this.clinicalVariants?.length > 0) {
            // Check if user clicked in Tab or JSON format
            if (e.detail.option.toLowerCase() === "tab") {
                // List of samples for generating the TSV file
                const samples = this.clinicalVariants[0].studies[0].samples.map(sample => sample.sampleId);
                const dataString = VariantUtils.jsonToTabConvert(this.clinicalVariants, POPULATION_FREQUENCIES.studies, samples, this._config.nucleotideGenotype, e.detail.exportFields);
                UtilsNew.downloadData(dataString, filename + ".tsv", "text/plain");
            } else {
                UtilsNew.downloadData(JSON.stringify(this.clinicalVariants, null, "\t"), filename + ".json", "application/json");
            }
            this.toolbarConfig = {...this.toolbarConfig, downloading: false};
            this.requestUpdate();
        } else {
            const filters = {
                ...this.filters,
                limit: e.detail?.exportLimit ?? 1000,
                count: false,
            };
            this.opencgaSession.opencgaClient.clinical().queryVariant(filters)
                .then(restResponse => {
                    const results = restResponse.getResults();
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        // List of samples for generating the TSV file
                        const samples = this.query.sample.split(";").map(sample => ({
                            id: sample.split(":")[0],
                        }));
                        const dataString = VariantUtils.jsonToTabConvert(results, POPULATION_FREQUENCIES.studies, samples, this._config.nucleotideGenotype, e.detail.exportFields);
                        UtilsNew.downloadData(dataString, filename + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), filename + ".json", "application/json");
                    }
                })
                .catch(response => {
                    console.error(response);
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                })
                .finally(() => {
                    this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                    this.requestUpdate();
                });
        }
    }

    showLoading() {
        $("#" + this.gridId).bootstrapTable("showLoading");
    }

    onGridConfigChange(e) {
        this.__config = e.detail.value;
    }

    onGridConfigSave() {
        LitUtils.dispatchCustomEvent(this, "gridconfigsave", this.__config || {});
    }

    onConfigClick(e) {
        $("#" + this._prefix + "ConfigModal").modal("show");
    }

    onVariantCheck(e) {
        const variantId = e.currentTarget.dataset.variantId;
        const variant = this._rows.find(e => e.id === variantId);

        if (e.currentTarget.checked) {
            this.checkedVariants.set(variantId, variant);
        } else {
            this.checkedVariants.delete(variantId);
        }

        // Set 'Edit' button as enabled/disabled
        document.getElementById(this._prefix + variantId + "VariantReviewButton").disabled = !e.currentTarget.checked;
        const reviewActionButton = document.getElementById(`${this._prefix}${variantId}VariantReviewActionButton`);
        if (e.currentTarget.checked) {
            reviewActionButton.removeAttribute("disabled");
        } else {
            reviewActionButton.setAttribute("disabled", "true");
        }

        // Enable or disable evidences select
        Array.from(document.getElementsByClassName(`${this._prefix}EvidenceReviewCheckbox`)).forEach(element => {
            if (variant.id === element.dataset.variantId) {
                // eslint-disable-next-line no-param-reassign
                element.disabled = !this.checkedVariants.has(variant.id);
            }
        });

        // Set 'Edit' button of evidences review as enabled/disabled
        Array.from(document.getElementsByClassName(this._prefix + "EvidenceReviewButton")).forEach(element => {
            if (variant.id === element.dataset.variantId) {
                const evidenceIndex = parseInt(element.dataset.clinicalEvidenceIndex);
                const isEvidenceSelected = variant.evidences[evidenceIndex]?.review?.select || false;
                // eslint-disable-next-line no-param-reassign
                element.disabled = !this.checkedVariants.has(variant.id) || !isEvidenceSelected;
            }
        });

        this.dispatchEvent(new CustomEvent("checkrow", {
            detail: {
                id: variantId,
                row: variant,
                checked: e.currentTarget.checked,
                rows: Array.from(this.checkedVariants.values())
            }
        }));
    }

    onVariantReview(e) {
        if (this.checkedVariants) {
            // Generate a clone of the variant review to prevent changing original values
            this.variantReview = UtilsNew.objectClone(this.checkedVariants.get(e.currentTarget.dataset.variantId));
            this.requestUpdate();

            $("#" + this._prefix + "ReviewSampleModal").modal("show");
        }
    }

    onVariantReviewChange(e) {
        this.variantReview = e.detail.value;
        // this.checkedVariants?.set(e.detail.value.id, e.detail.value);
    }

    onVariantReviewOk() {
        this.checkedVariants?.set(this.variantReview.id, this.variantReview);

        // Dispatch variant update
        LitUtils.dispatchCustomEvent(this, "updaterow", null, {
            id: this.variantReview.id,
            row: this.variantReview,
            rows: Array.from(this.checkedVariants.values()),
        });

        // Clear selected variant to review
        this.variantReview = null;
        this.requestUpdate();
    }

    onVariantReviewCancel() {
        this.variantReview = null;
        this.requestUpdate();
    }

    onEvidenceCheck(e) {
        const variantId = e.currentTarget.dataset.variantId;
        const evidenceIndex = parseInt(e.currentTarget.dataset.clinicalEvidenceIndex);

        // Update clinical evidence review data
        const evidence = this.checkedVariants.get(variantId).evidences[evidenceIndex];
        // TODO: remove this check when the evidence review is implemented in OpenCGA
        if (typeof evidence.review === "undefined") {
            evidence.review = {};
        }
        evidence.review.select = e.currentTarget.checked;

        // Enable or disable evidence review edit
        Array.from(document.getElementsByClassName(this._prefix + "EvidenceReviewButton")).forEach(element => {
            const dataset = element.dataset;
            if (variantId === dataset.variantId && parseInt(dataset.clinicalEvidenceIndex) === evidenceIndex) {
                // eslint-disable-next-line no-param-reassign
                element.disabled = !evidence.review.select;
            }
        });

        LitUtils.dispatchCustomEvent(this, "updaterow", null, {
            id: variantId,
            row: this.checkedVariants.get(variantId),
            rows: Array.from(this.checkedVariants.values()),
        });
    }

    onVariantEvidenceReview(e) {
        if (this.checkedVariants) {
            this.variantReview = this.checkedVariants.get(e.currentTarget.dataset.variantId);
            this.evidenceReviewIndex = parseInt(e.currentTarget.dataset.clinicalEvidenceIndex);

            // Generate a clone of the evidence review to prevent changing original values
            this.evidenceReview = UtilsNew.objectClone(this.variantReview.evidences[this.evidenceReviewIndex]?.review || {});
            this.requestUpdate();

            $("#" + this._prefix + "EvidenceReviewModal").modal("show");
        }
    }

    onEvidenceReviewChange(e) {
        // Update evidence review object
        this.evidenceReview = e.detail.value;
    }

    onEvidenceReviewOk() {
        // Update review object of the current variant
        this.variantReview.evidences[this.evidenceReviewIndex].review = this.evidenceReview;

        // Dispatch variant update
        LitUtils.dispatchCustomEvent(this, "updaterow", null, {
            id: this.variantReview.id,
            row: this.variantReview,
            rows: Array.from(this.checkedVariants.values()),
        });

        // Clear evidence and variant review
        this.variantReview = null;
        this.evidenceReview = null;
    }

    getRightToolbar() {
        if (this._config?.showSettings) {
            return [
                {
                    render: () => html`
                    <button type="button" class="btn btn-default btn-sm" aria-haspopup="true" aria-expanded="false" @click="${e => this.onConfigClick(e)}">
                        <i class="fas fa-cog icon-padding"></i> Settings ...
                    </button>`
                }
            ];
        }
        return [];
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
                        ${this.variantReview ? html`
                            <clinical-interpretation-variant-review
                                .opencgaSession="${this.opencgaSession}"
                                .variant="${this.variantReview}"
                                .mode="${"form"}"
                                @variantChange="${e => this.onVariantReviewChange(e)}">
                            </clinical-interpretation-variant-review>
                        ` : null}
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal" @click="${() => this.onVariantReviewCancel()}">Cancel</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${() => this.onVariantReviewOk()}">Ok</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="${this._prefix}EvidenceReviewModal" tabindex="-1"
                role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog" style="width: 768px">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <h3>Review Variant Evidence</h3>
                        </div>
                        ${this.evidenceReview ? html`
                            <clinical-interpretation-variant-evidence-review
                                .opencgaSession="${this.opencgaSession}"
                                .review="${this.evidenceReview}"
                                .mode="${"form"}"
                                .somatic="${this.clinicalAnalysis.type === "CANCER"}"
                                @evidenceReviewChange="${e => this.onEvidenceReviewChange(e)}">
                            </clinical-interpretation-variant-evidence-review>
                        ` : null}
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${() => this.onEvidenceReviewOk()}">Ok</button>
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
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${this._config}"
                                    @configChange="${this.onGridConfigChange}">
                                </variant-interpreter-grid-config>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${e => this.onGridConfigSave(e)}">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            showExport: false,
            detailView: true,
            showReview: true,
            showSettings: true,
            showSelectCheckbox: false,
            showActions: true,
            showEditReview: true,
            showType: true,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 10,

            hideType: false,
            hidePopulationFrequencies: false,
            hideClinicalInfo: false,
            showHgvs: false,

            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },

            quality: {
                qual: 30,
                dp: 20
            },
            populationFrequencies: ["1kG_phase3:ALL", "GNOMAD_GENOMES:ALL", "GNOMAD_EXOMES:ALL", "UK10K:ALL", "GONL:ALL", "ESP6500:ALL", "EXAC:ALL"],

            genotype: {
                type: "VAF"
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

            evidences: {
                showSelectCheckbox: true
            },

            somatic: false,
            variantTypes: [],
        };
    }

}

customElements.define("variant-interpreter-grid", VariantInterpreterGrid);
