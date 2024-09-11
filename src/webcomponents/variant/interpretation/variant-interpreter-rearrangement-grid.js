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
import UtilsNew from "../../../core/utils-new.js";
import ClinicalAnalysisManager from "../../clinical/clinical-analysis-manager.js";
import VariantInterpreterGridFormatter from "./variant-interpreter-grid-formatter.js";
import VariantGridFormatter from "../variant-grid-formatter.js";
import GridCommons from "../../commons/grid-commons.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "./variant-interpreter-grid-config.js";
import "../../clinical/interpretation/clinical-interpretation-variant-review.js";
import "../../commons/opencb-grid-toolbar.js";
import "../../loading-spinner.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class VariantInterpreterRearrangementGrid extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            clinicalVariants: {
                type: Array,
            },
            query: {
                type: Object
            },
            review: {
                type: Boolean
            },
            config: {
                type: Object
            },
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "";
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
        this._rows = [];

        this.toolbarConfig = {};
        this.toolbarSetting = {};

        this.gridId = this._prefix + "VariantBrowserGrid";
        this.checkedVariants = new Map();
        this.review = false;
        this.active = true;
        this.variantsReview = null;

        this.gridCommons = null;
        this.clinicalAnalysisManager = null;

        // OpenCGA returns the same genes in both variants of the rearrangement
        // This map is used to assign the correct genes to each variant
        this.genesByVariant = {};

        // Set colors
        // consequenceTypesImpact;
        // eslint-disable-next-line no-undef
        this.consequenceTypeColors = VariantGridFormatter.assignColors(CONSEQUENCE_TYPES, PROTEIN_SUBSTITUTION_SCORE);
    }

    update(changedProperties) {
        if (changedProperties.has("toolId")) {
            this.COMPONENT_ID = this.toolId + "-grid";
        }

        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("opencgaSession")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("config")) {
            this.configObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        // We ned to perform an update of the table only when any of the properties of this grid has changed
        // This means that we only need to check if the changedProperties set is not empty
        if (changedProperties.size > 0) {
            this.renderVariants();
        }
    }

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis) {
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);

            if (!this.clinicalAnalysis.interpretation) {
                this.clinicalAnalysis.interpretation = {};
            }

            // Update checked variants
            this.checkedVariants = new Map();
            (this.clinicalAnalysis.interpretation?.primaryFindings || []).forEach(variant => {
                this.checkedVariants.set(variant.id, variant);
            });
            // this.gridCommons.checkedRows = this.checkedVariants;

            if (this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
                if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples &&
                    this.clinicalAnalysis.proband.samples.length === 2 && this.clinicalAnalysis.proband.samples[1].somatic) {
                    this.clinicalAnalysis.proband.samples = this.clinicalAnalysis.proband.samples.reverse();
                }
            }
        }
    }

    configObserver() {
        // 1. Merge default configuration with the configuration provided via props
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        // 2. Initialize grid commons with the new configutation
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // 3. Set toolbar settings
        this.toolbarSetting = {
            ...this._config,
        };

        // 4. Set toolbar configuration
        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "CLINICAL_VARIANT",
            showInterpreterConfig: true,
            columns: this._getDefaultColumns()
        };
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    generateRowsFromVariants(variants) {
        const pairs = []; // pairs = [[v1, v2], [v3, v4], [v5, v6]];
        (variants || []).forEach(variant => {
            const mateId = variant.studies[0].files[0].data.MATEID;
            let found = false;
            pairs.forEach(pair => {
                if (pair[0].studies[0].files[0].data.VCF_ID === mateId) {
                    pair.push(variant);
                    found = true;
                }
            });

            // If not pair has been found --> inser this single variant
            if (!found) {
                pairs.push([variant]);
            }
        });

        return pairs;
    }

    generateGenesMapFromVariants(variants, offset = 5000) {
        this.genesByVariant = {};
        const genesList = new Set();
        (variants || []).forEach(variant => {
            if (variant?.annotation?.consequenceTypes) {
                variant.annotation.consequenceTypes.forEach(ct => {
                    if (ct.geneName || ct.geneId) {
                        genesList.add(ct.geneName || ct.geneId);
                    }
                });
            }
        });

        // Request gene info to cellbase
        if (genesList.size > 0) {
            const genesIds = Array.from(genesList);
            return this.opencgaSession.cellbaseClient
                .getGeneClient(genesIds.join(","), "info", {
                    "include": "id,name,chromosome,start,end",
                })
                .then(response => {
                    // 1. Map each gene with it's correct position
                    const genes = new Map();
                    genesIds.forEach((geneId, index) => {
                        if (response?.responses?.[index]?.results?.[0]) {
                            genes.set(geneId, response.responses[index].results[0]);
                        }
                    });

                    // 2. Assign genes to each variant
                    variants.forEach(variant => {
                        const id = variant.id;
                        this.genesByVariant[id] = new Set();
                        (variant?.annotation?.consequenceTypes || []).forEach(ct => {
                            const gene = genes.get(ct.geneName || ct.geneId);

                            // Check if this gene exists and overlaps this variant
                            if (gene) {
                                const start = gene.start - offset;
                                const end = gene.end + offset;
                                const variantStart = Math.min(variant.start, variant.end);
                                const variantEnd = Math.max(variant.start, variant.end);
                                if (variant.chromosome === gene.chromosome && variantStart <= end && start <= variantEnd) {
                                    this.genesByVariant[id].add(ct.geneName || ct.geneId);
                                }
                            }
                        });
                    });
                });
        }

        // In other case, we will return a dummy promise
        return Promise.resolve(null);
    }

    renderVariants() {
        if (this.active) {
            if (this.clinicalVariants && this.clinicalVariants.length > 0) {
                this.renderLocalVariants();
            } else {
                this.renderRemoteVariants();
            }
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

        this.table = $("#" + this.gridId);
        if (this.opencgaSession && this.opencgaSession.project && this.opencgaSession.study) {
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                theadClasses: "table-light",
                buttonsClass: "light",
                columns: this._getDefaultColumns(),
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,

                // Set table properties, these are read from config property
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: (pageFrom, pageTo, totalRows) =>
                    this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows, null, this.isApproximateCount),
                showExport: this._config.showExport,
                // detailView: this._config.detailView,
                // detailFormatter: this.detailFormatter,
                // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
                loadingTemplate: () => GridCommons.loadingFormatter(),
                // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
                variantGrid: this,

                ajax: params => {
                    this.gridCommons.clearResponseWarningEvents();
                    let rearrangementResponse = null;

                    // Make a deep clone object to manipulate the query sent to OpenCGA
                    const internalQuery = JSON.parse(JSON.stringify(this.query));

                    const tableOptions = $(this.table).bootstrapTable("getOptions");
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit * 2 || tableOptions.pageSize * 2,
                        skip: params.data.offset || 0,
                        count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,

                        approximateCount: true,
                        approximateCountSamplingSize: 500,

                        ...internalQuery,
                        includeSampleId: "true",
                        includeInterpretation: this.clinicalAnalysis?.interpretation?.id,
                        type: "BREAKEND"
                    };

                    this.opencgaSession.opencgaClient.clinical()
                        .queryVariant(this.filters)
                        .then(res => {
                            this.isApproximateCount = res.responses[0].attributes?.approximateCount ?? false;
                            rearrangementResponse = res;

                            // Generate map of genes to variants
                            return this.generateGenesMapFromVariants(res.responses[0].results);
                        })
                        .then(() => {
                            // pairs will have the following format: [[v1, v2], [v3, v4], [v5, v6]];
                            const results = rearrangementResponse.responses[0].results;
                            const pairs = this.generateRowsFromVariants(results);
                            // It's important to overwrite results array
                            rearrangementResponse.responses[0].results = pairs;

                            params.success(rearrangementResponse);
                        })
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null);
                        });
                },
                responseHandler: response => {
                    this.gridCommons.displayResponseWarningEvents(response);
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onLoadSuccess: data => {
                    // We keep the table rows as global variable, needed to fetch the variant object when checked
                    this._rows = data.rows;
                    this.gridCommons.onLoadSuccess(data, 2);

                    // Josemi Note 20240214 - We need to force an update of the grid component to propagate the applied
                    // filters in 'this.filters' to the component 'opencga-grid-toolbar'.
                    this.requestUpdate();
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
            });
        }
    }

    renderLocalVariants() {
        // Generate rows from local clinical variants
        // const variants = this.clinicalAnalysis.interpretation.primaryFindings;
        const variants = this.generateRowsFromVariants(this.clinicalVariants);

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: this._getDefaultColumns(),
            sidePagination: "server",
            // Josemi Note 2024-01-31: we have added the ajax function for local variants for getting genes info
            // and map the genes to each variant
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = variants.slice(skip, skip + limit);

                // Generate map of genes to variants
                this.generateGenesMapFromVariants(rows.flat())
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-31: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: variants.length,
                    rows: response,
                };
            },

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
            // detailView: this._config.detailView,
            // detailFormatter: this.detailFormatter,
            // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            loadingTemplate: () => GridCommons.loadingFormatter(),
            // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
            variantGrid: this,

            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                this._rows = data;
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
            },
            rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
        });
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

    vcfDataFormatter(value, row, field) {
        if (row?.studies?.length > 0) {
            let source = "FILE";
            if (field.variantCaller?.dataFilters) {
                const dataFilter = field.variantCaller.dataFilters.find(filter => filter.id === field.key);
                source = dataFilter?.source || "FILE";
            } else {
                // TODO Search in file.attributes to guess the source
            }

            if (source === "FILE") {
                for (const file of row.studies[0].files) {
                    if (file.data[field.key]) {
                        return file.data[field.key];
                    }
                }
            } else {
                const sampleIndex = row.studies[0].samples.findIndex(sample => sample.sampleId === field.sampleId);
                const index = row.studies[0].sampleDataKeys.findIndex(key => key === field.key);
                if (index >= 0) {
                    return row.studies[0].samples[sampleIndex].data[index];
                }
            }
        } else {
            console.error("This should never happen: row.studies[] is not valid");
        }
        return "-";
    }

    // DEPRECATED
    pathogeniticyFormatter(value, row, index) {
        // TODO we must call to PathDB to get the frequency of each variant, next code is just an example
        return `
            <div class="col-md-12" style="padding: 0px">
                <form class="form-horizontal">
                    <div class="col-md-12" style="padding: 0px">
                        <form class="form-horizontal">
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-5">HP:00${Math.floor((Math.random() * 1000) + 1)}</label>
                                <div class="col-md-7">${Number(Math.random()).toFixed(2)}</div>
                            </div>
                            <div class="form-group" style="margin: 0px 2px">
                                <label class="col-md-5">HP:00${Math.floor((Math.random() * 1000) + 1)}</label>
                                <div class="col-md-7">${Number(Math.random()).toFixed(2)}</div>
                            </div>
                        </form>
                    </div>
                </form>
            </div>
        `;
    }

    _getDefaultColumns() {
        // This code creates dynamically the columns for the VCF INFO and FORMAT column data.
        // Multiple file callers are supported.
        const vcfDataColumns = {
            vcf1: [],
            vcf2: [],
        };
        const vcfDataColumnNames = [];
        const variantTypes = new Set(this._config.variantTypes || []);
        const fileCallers = (this.clinicalAnalysis?.files || [])
            .filter(file => file.format === "VCF" && file.software?.name)
            .map(file => file.software.name.toUpperCase());

        if (this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers?.length > 0) {
            const variantCallers = this.opencgaSession.study.internal.configuration.clinical.interpretation.variantCallers
                .filter(vc => vc.somatic === this._config.somatic)
                .filter(vc => vc.types.some(type => variantTypes.has(type)));

            variantCallers.forEach(variantCaller => {
                if (fileCallers.includes(variantCaller.id.toUpperCase())) {
                    if (!vcfDataColumnNames.includes(variantCaller.id)) {
                        vcfDataColumnNames.push(variantCaller.id);
                    }
                    (variantCaller.columns || []).forEach(column => {
                        ["vcf1", "vcf2"].forEach((name, index) => {
                            const field = {
                                key: column,
                                sampleId: this.clinicalAnalysis?.proband?.samples?.[0]?.id,
                                variantCaller: variantCaller,
                            };
                            const id = name + column.replace("EXT_", "");
                            vcfDataColumns[name].push({
                                id: id,
                                title: column.replace("EXT_", ""),
                                field: field,
                                rowspan: 1,
                                colspan: 1,
                                formatter: (value, row) => this.vcfDataFormatter(value, row[index], field),
                                halign: "center",
                                excludeFromSettings: true,
                                visible: !this._config.hideVcfFileData,
                            });
                        });
                    });
                }
            });
        }

        // IMPORTANT: empty columns are not supported in boostrap-table,
        // we need to create an empty not visible column when no VCF file data is configured.
        if (!vcfDataColumns.vcf1 || vcfDataColumns.vcf1.length === 0) {
            vcfDataColumns.vcf1 = [{visible: false}];
            vcfDataColumns.vcf2 = [{visible: false}];
        }

        // Prepare Grid columns
        this._columns = [
            [
                {
                    id: "variant1",
                    title: "Variant 1",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.variantIdFormatter(value, row[0], index, this.opencgaSession.project.organism.assembly, this._config),
                    halign: "center",
                    sortable: true,
                    visible: this.gridCommons.isColumnVisible("variant1"),
                },
                {
                    id: "variant2",
                    title: "Variant 2",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.variantIdFormatter(value, row[1], index, this.opencgaSession.project.organism.assembly, this._config),
                    halign: "center",
                    sortable: true,
                    visible: this.gridCommons.isColumnVisible("variant2"),
                },
                {
                    id: "gene",
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        return VariantInterpreterGridFormatter.rearrangementGeneFormatter(row, this.genesByVariant, this.opencgaSession);
                    },
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("gene"),
                },
                {
                    id: "evidences",
                    title: "Role in Cancer",
                    field: "evidences",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantInterpreterGridFormatter.roleInCancerFormatter(row[0]?.evidences, index),
                    halign: "center",
                    visible: this.clinicalAnalysis.type?.toUpperCase() === "CANCER" && this.gridCommons.isColumnVisible("evidences"),
                },
                {
                    id: "geneFeatureOverlap",
                    title: "Gene Feature Overlap",
                    rowspan: 1,
                    colspan: 2,
                    halign: "center",
                },
                {
                    id: "vcfData1",
                    title: "VCF Data 1",
                    rowspan: 1,
                    colspan: vcfDataColumns.vcf1?.length,
                    halign: "center",
                    visible: vcfDataColumns.vcf1?.length > 1 && this.gridCommons.isColumnVisible("vcfData1"),
                },
                {
                    id: "vcfData2",
                    title: "VCF Data 2",
                    rowspan: 1,
                    colspan: vcfDataColumns.vcf2?.length,
                    halign: "center",
                    visible: vcfDataColumns.vcf2?.length > 1 && this.gridCommons.isColumnVisible("vcfData2"),
                },
                {
                    id: "interpretation",
                    title: `Interpretation
                        <a class='interpretation-info-icon'
                            tooltip-title='Interpretation'
                            tooltip-text="<span class='fw-bold'>Prediction</span> column shows the Clinical Significance prediction and Tier following the ACMG guide recommendations"
                            tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <i class='fa fa-info-circle' aria-hidden='true'></i>
                        </a>`,
                    field: "interpretation",
                    rowspan: 1,
                    colspan: 4,
                    halign: "center"
                },
                {
                    title: "Actions",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        const reviewId = `${this._prefix}${row[0].id}VariantReviewActionButton`;
                        const reviewDisabled = (!this.checkedVariants.has(row[0].id) || this.clinicalAnalysis.locked || this.clinicalAnalysis.interpretation?.locked) ? "disabled" : "";

                        return `
                            <div class="dropdown">
                                <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-toolbox me-1" aria-hidden="true"></i>
                                    <span>Actions</span>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a id="${reviewId}" href="javascript:void 0;" class="dropdown-item reviewButton" data-action="edit" ${reviewDisabled}>
                                            <i class="fas fa-edit icon-padding reviewButton" aria-hidden="true"></i> Edit ...
                                        </a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li class="dropdown-header">Fetch Variant</li>
                                    <li>
                                        <a href="javascript: void 0" class="dropdown-item" data-action="download">
                                            <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        `;
                    },
                    align: "center",
                    events: {
                        "click a": this.onActionClick.bind(this)
                    },
                    excludeFromExport: true,
                    excludeFromSettings: true,
                }
            ],
            [
                {
                    id: "geneFeatureOverlapVariant1",
                    title: "Variant 1",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, rows) => {
                        return VariantInterpreterGridFormatter.rearrangementFeatureOverlapFormatter(rows[0], this.genesByVariant[rows[0].id], this.opencgaSession);
                    },
                    halign: "center",
                    valign: "top",
                    visible: this.gridCommons.isColumnVisible("geneFeatureOverlapVariant1"),
                },
                {
                    id: "geneFeatureOverlapVariant2",
                    title: "Variant 2",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, rows) => {
                        return VariantInterpreterGridFormatter.rearrangementFeatureOverlapFormatter(rows[1], this.genesByVariant[rows[1].id], this.opencgaSession);
                    },
                    halign: "center",
                    valign: "top",
                    visible: this.gridCommons.isColumnVisible("geneFeatureOverlapVariant2"),
                },
                ...vcfDataColumns.vcf1,
                ...vcfDataColumns.vcf2,
                {
                    id: "cohorts",
                    title: "Cohorts",
                    field: "cohort",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantInterpreterGridFormatter.studyCohortsFormatter.bind(this),
                    visible: (this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY") && this.gridCommons.isColumnVisible("cohorts",)
                },
                {
                    id: "prediction",
                    title: `${this.clinicalAnalysis.type !== "CANCER" ? "ACMG <br> Prediction" : "Prediction"}`,
                    field: "prediction",
                    rowspan: 1,
                    colspan: 1,
                    formatter: VariantInterpreterGridFormatter.predictionFormatter,
                    halign: "center",
                    visible: (this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY") && this.gridCommons.isColumnVisible("prediction"),
                },
                {
                    title: "Select",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row, index) => {
                        const checked = this.checkedVariants?.has(row[0].id) ? "checked" : "";
                        return `<input class="check check-variant" type="checkbox" data-row-index="${index}" ${checked}>`;
                    },
                    align: "center",
                    events: {
                        "click input": event => this.onRowCheck(event),
                    },
                    visible: this._config.showSelectCheckbox,
                    excludeFromExport: true // this is used in opencga-export
                },
                {
                    title: "Review",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row, index) => {
                        const disabled = (!this.checkedVariants?.has(row[0].id) || this.clinicalAnalysis.locked || this.clinicalAnalysis.interpretation?.locked) ? "disabled" : "";
                        const checked = this.checkedVariants.has(row[0].id);
                        const variant = checked ? this.checkedVariants.get(row[0].id) : row[0];
                        return VariantInterpreterGridFormatter.reviewFormatter(variant, index, checked, disabled, this._prefix, this._config);
                    },
                    align: "center",
                    events: {
                        "click button": e => this.onReviewClick(e),
                    },
                    visible: this.review || this._config.showReview,
                    excludeFromExport: true // this is used in opencga-export
                },
            ]
        ];

        // Update columns
        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);

        return this._columns;
    }

    onActionClick(e, value, row) {
        const action = (e.target.dataset.action || "").toLowerCase();
        switch (action) {
            case "edit":
                this.variantsReview = null;
                if (this.checkedVariants && this.checkedVariants.has(row[0].id)) {
                    this.variantsReview = [
                        UtilsNew.objectClone(this.checkedVariants.get(row[0].id)),
                        UtilsNew.objectClone(this.checkedVariants.get(row[1].id)),
                    ];
                    this.requestUpdate();
                    // $("#" + this._prefix + "ReviewSampleModal").modal("show");
                    // const reviewSampleModal = new bootstrap.Modal("#" + this._prefix + "ReviewSampleModal");
                    this.reviewSampleModal.show();
                }
                break;
            case "download":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
        }
    }

    async onDownload(e) {
        this.toolbarConfig = {
            ...this.toolbarConfig,
            downloading: true,
        };
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
            limit: e.detail?.exportLimit ?? 1000,
            count: false,
            includeSampleId: "true",
            ...this.query
        };
        this.opencgaSession.opencgaClient.clinical().queryVariant(filters)
            .then(restResponse => {
                const results = restResponse.getResults();
                // Check if user clicked in Tab or JSON format
                if (e.detail.option.toLowerCase() === "tab") {
                    const fields = [
                        "id",
                        "type",
                        "svclass",
                        "assemblyScore",
                        "cnFlag",
                        "fusionFlag",
                    ];
                    const transformFields = {
                        type: (value, row) => {
                            return VariantGridFormatter.vcfFormatter(value, row, "EXT_SVTYPE", "INFO") || "-";
                        },
                        svclass: (value, row) => {
                            return VariantGridFormatter.vcfFormatter(value, row, "SVCLASS", "INFO") || "-";
                        },
                        assemblyScore: (value, row) => {
                            return VariantGridFormatter.vcfFormatter(value, row, "BAS", "INFO") || "-";
                        },
                        cnFlag: (value, row) => {
                            return VariantGridFormatter.vcfFormatter(value, row, "CNCH", "INFO") || "-";
                        },
                        fusionFlag: (value, row) => {
                            return VariantGridFormatter.vcfFormatter(value, row, "FFV", "INFO") || "-";
                        },
                    };
                    // Add callers data
                    const fileCallers = (this.clinicalAnalysis?.files || [])
                        .filter(file => file.format === "VCF" && file.software?.name)
                        .map(file => file.software.name);
                    if (this._config.callers?.length > 0 && fileCallers?.length > 0) {
                        this._config.callers.forEach(caller => {
                            // INFO column
                            (caller.info || []).forEach(info => {
                                (info.fields || []).forEach(infoField => {
                                    fields.push(infoField);
                                    transformFields[infoField] = (value, row) => {
                                        return VariantGridFormatter.vcfFormatter(value, row, infoField, "INFO") || "-";
                                    };
                                });
                            });
                            // FORMAT column
                            (caller.format || []).forEach(format => {
                                const name = format.toLowerCase().replace(/\s/g, "");
                                fields.push(name);
                                transformFields[name] = (value, row) => {
                                    return VariantGridFormatter.vcfFormatter(value, row, format, "FORMAT") || "-";
                                };
                            });
                        });
                    }
                    const data = UtilsNew.toTableString(results, fields, transformFields);
                    UtilsNew.downloadData(data, "variant_interpreter_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                } else {
                    UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "variant_interpreter_" + this.opencgaSession.study.id + ".json", "application/json");
                }
            })
            .catch(response => {
                console.log(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
            });
    }

    onShare() {
        const _this = this;
        $("[data-toggle=popover]").popover({
            content: function () {
                const getUrlQueryParams = _this._getUrlQueryParams();
                const query = ["limit=1000"];
                for (const key in getUrlQueryParams.queryParams) {
                    // Check sid has a proper value. For public projects sid is undefined. In that case, sid must be removed from the url
                    if (key === "sid" && getUrlQueryParams.queryParams[key] === undefined) {
                        delete getUrlQueryParams.queryParams["sid"];
                    } else {
                        query.push(key + "=" + getUrlQueryParams.queryParams[key]);
                    }
                }
                return getUrlQueryParams.host + "?" + query.join("&");
            }
        }).on("show.bs.popover", function () {
            $(this).data("bs.popover").tip().css("max-width", "none");
        });
    }

    showLoading() {
        $("#" + this.gridId).bootstrapTable("showLoading");
    }

    onRowCheck(event) {
        const index = parseInt(event.target.dataset.rowIndex);

        // Add or remove this pair of variants from checkedVariants list
        this._rows[index].forEach(variant => {
            if (event.target.checked) {
                this.checkedVariants.set(variant.id, variant);
            } else {
                this.checkedVariants.delete(variant.id);
            }
        });

        // Set 'Edit' button as enabled/disabled in 'Review' column
        // Josemi NOTE 20240205 - Edit buton in column is not rendered when 'Review' column is hidden
        const reviewButton = document.getElementById(`${this._prefix}${this._rows[index][0].id}VariantReviewButton`);
        if (reviewButton) {
            reviewButton.disabled = !event.currentTarget.checked;
        }

        // Set 'Edit' button as enabled/disabled in 'Actions' dropdown
        // Josemi NOTE 20240205 - Edit buton in actions dropdown is not rendered when when actions column is hidden
        const reviewActionButton = document.getElementById(`${this._prefix}${this._rows[index][0].id}VariantReviewActionButton`);
        if (reviewActionButton) {
            if (event.currentTarget.checked) {
                reviewActionButton.removeAttribute("disabled");
            } else {
                reviewActionButton.setAttribute("disabled", "true");
            }
        }

        // Dispatch row check event
        LitUtils.dispatchCustomEvent(this, "checkrow", null, {
            checked: event.target.checked,
            row: this._rows[index],
            rows: Array.from(this.checkedVariants.values()),
        });
    }

    onReviewClick(e) {
        const index = parseInt(e.currentTarget.dataset.index);
        const variants = this._rows[index];
        this.variantsReview = null;

        if (this.checkedVariants && this.checkedVariants.has(variants[0].id)) {
            this.variantsReview = [
                this.checkedVariants.get(variants[0].id),
                this.checkedVariants.get(variants[1].id)
            ];
            this.requestUpdate();

            // $("#" + this._prefix + "ReviewSampleModal").modal("show");
            // const reviewSampleModal = new bootstrap.Modal("#" + this._prefix + "ReviewSampleModal");
            this.reviewSampleModal.show();
        }
    }

    onConfigClick(e) {
        // $("#" + this._prefix + "ConfigModal").modal("show");
        const configModal = new bootstrap.Modal("#" + this._prefix + "ConfigModal");
        configModal.show();
    }

    onVariantChange(e) {
        this.variantsReview[0] = e.detail.value;
    }

    onSaveVariant() {
        // Update second variant info
        this.variantsReview[1] = {
            ...this.variantsReview[1],
            discussion: this.variantsReview[0].discussion,
            status: this.variantsReview[0].status,
            comments: this.variantsReview[0].comments,
            confidence: this.variantsReview[0].confidence,
        };

        // Update checked variants
        this.variantsReview.forEach(variant => {
            this.checkedVariants?.set(variant.id, variant);
        });

        // Dispatch variant update
        LitUtils.dispatchCustomEvent(this, "updaterow", null, {
            id: this.variantsReview[0].id,
            row: this.variantsReview,
            rows: Array.from(this.checkedVariants.values()),
        });

        // Reset variants review
        this.variantsReview = null;
        this.requestUpdate();
    }

    onCancelVariant(e) {
        this.variantsReview = null;
        this.requestUpdate();
        // this._variantChanged = null;
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

            <div id="${this.gridId}WarningEvents"></div>

            <opencb-grid-toolbar
                .config="${this.toolbarConfig}"
                .settings="${this.toolbarSetting}"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.filters}"
                @columnChange="${this.onColumnChange}"
                @download="${this.onDownload}"
                @export="${this.onDownload}"
                @sharelink="${this.onShare}">
            </opencb-grid-toolbar>

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}VariantBrowserGrid"></table>
            </div>

            <div class="modal fade pt-0" id="${this._prefix}ReviewSampleModal" tabindex="-1"
                 role="dialog" aria-hidden="true" style="overflow-y: visible">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <h3>Review Variant</h3>
                        </div>
                        ${this.variantsReview ? html`
                            <clinical-interpretation-variant-review
                                .opencgaSession="${this.opencgaSession}"
                                .variant="${this.variantsReview[0]}"
                                mode=${"form"}
                                @variantChange="${e => this.onVariantChange(e)}">
                            </clinical-interpretation-variant-review>
                        ` : null}
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="${() => this.onCancelVariant()}">Cancel</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="${e => this.onSaveVariant(e)}">OK</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade pt-0" id="${this._prefix}ConfigModal" tabindex="-1"
                role="dialog" aria-hidden="true" style="overflow-y: visible">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                        <h3>Settings</h3>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="container-fluid">
                                <variant-interpreter-grid-config
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${this._config}"
                                    .gridColumns="${this._columns}"
                                    @configChange="${this.onGridConfigChange}">
                                </variant-interpreter-grid-config>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="${e => this.onGridConfigSave(e)}">OK</button>
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
            showExport: true,
            showSettings: true,
            detailView: true,
            showReview: true,
            showEditReview: true,
            showSelectCheckbox: false,
            showActions: false,
            multiSelection: false,
            nucleotideGenotype: true,
            hideVcfFileData: false,

            alleleStringLengthMax: 50,

            // genotype: {
            //     type: "VCF_CALL"
            // },
            quality: {
                qual: 30,
                dp: 20
            },
            populationFrequencies: [],

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
            callers: [
                {
                    id: "brass",
                    // TODO
                    columns: [
                        {name: "Assembly Score", field: "BAS", position: 5},
                        {name: "...", field: "CNCH", position: 6},
                        {name: "...", field: "FFV", position: 9},
                    ],
                    info: [
                        {name: "Gene", fields: ["GENE", "TID"], separator: "<br>"},
                        {name: "Region Type", fields: ["RGN"]},
                        {name: "Region Position", fields: ["RGNNO", "RGNC"]}
                    ]
                }
            ],
            evidences: {
                showSelectCheckbox: true,
            },
            somatic: false,
            variantTypes: [],
        };
    }

}

customElements.define("variant-interpreter-rearrangement-grid", VariantInterpreterRearrangementGrid);
