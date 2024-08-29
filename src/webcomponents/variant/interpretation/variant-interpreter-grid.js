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

import {html, LitElement} from "lit";
import UtilsNew from "../../../core/utils-new.js";
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
import CustomActions from "../../commons/custom-actions";

export default class VariantInterpreterGrid extends LitElement {

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

        this.checkedVariants = new Map();
        this.gridId = this._prefix + "VariantBrowserGrid";
        this.active = true;
        this.review = false;

        this.gridCommons = null;

        // Set colors
        // eslint-disable-next-line no-undef
        this.consequenceTypeColors = VariantGridFormatter.assignColors(CONSEQUENCE_TYPES, PROTEIN_SUBSTITUTION_SCORE);

        // Keep the status of selected variants
        this.queriedVariants = {};

        this.displayConfigDefault = {
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom",
            },
        };
    }

    update(changedProperties) {
        if (changedProperties.has("toolId") && this.toolId) {
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

            if (this.clinicalAnalysis.type?.toUpperCase() === "CANCER") {
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
            ...this.config
        };

        // 2. Create a new grid commons instance with the new configuration
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // 3. Set toolbar settings
        this.toolbarSetting = {
            ...this._config,
            showCreate: false,
        };

        // 4. Set toolbar config
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

    renderVariants() {
        if (this.active) {
            if (this.clinicalVariants?.length > 0) {
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
        if (this.opencgaSession && this.opencgaSession.project && this.opencgaSession.study) {
            this.table = $("#" + this.gridId);
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
                silentSort: false,
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: (pageFrom, pageTo, totalRows) => this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows, null, this.isApproximateCount),
                detailView: this._config.detailView,
                detailFormatter: (value, row) => this.detailFormatter(value, row),
                loadingTemplate: () => GridCommons.loadingFormatter(),
                // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
                variantGrid: this,
                ajax: params => {
                    this.gridCommons.clearResponseWarningEvents();
                    // Make a deep clone object to manipulate the query sent to OpenCGA
                    const internalQuery = JSON.parse(JSON.stringify(this.query));

                    // We need to make sure that the proband is the first sample when analysing Families
                    if (this.clinicalAnalysis.type?.toUpperCase() === "FAMILY" && this.query?.sample) {
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

                        // TODO to be enabled once this is supported in OpenCGA
                        // interpretationId: this.clinicalAnalysis?.interpretation.id,

                        approximateCount: true,
                        approximateCountSamplingSize: 500,

                        ...internalQuery,
                        unknownGenotype: "0/0",
                        includeInterpretation: this.clinicalAnalysis?.interpretation?.id,
                    };

                    let variantResponse = null;
                    this.opencgaSession.opencgaClient.clinical().queryVariant(this.filters)
                        .then(variantQueryResponse => {
                            this.isApproximateCount = variantQueryResponse.responses[0].attributes?.approximateCount ?? false;
                            variantResponse = variantQueryResponse;

                            // FIXME Temporary code to check which variants are being interpreted or have been reported
                            // This should be implemented by OpenCGA
                            // return this.fillReportedVariants(variantResponse.responses[0].results);
                            // return variantResponse;

                            // Josemi Note 2023-10-25: we would need to move this to gridCommons in the future
                            // Prepare data for columns extensions
                            const rows = variantResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(variantResponse))
                        .catch(e => params.error(e))
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

                    // Josemi Note 20240214 - We need to force an update of the grid component to propagate the applied
                    // filters in 'this.filters' to the component 'opencga-grid-toolbar'.
                    this.requestUpdate();
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                onExpandRow: (index, row) => {
                    // Automatically select this row after clicking on "+" icons
                    this.gridCommons.onClickRow(row.id, row, this.querySelector(`tr[data-index="${index}"]`));

                    // Listen to Show/Hide link in the detail formatter consequence type table
                    // TODO remove this
                    document.getElementById(this._prefix + row.id + "ShowEvidence")?.addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));
                    document.getElementById(this._prefix + row.id + "HideEvidence")?.addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));

                    document.getElementById(this._prefix + row.id + "ShowCt")?.addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));
                    document.getElementById(this._prefix + row.id + "HideCt")?.addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));

                    // Enable or disable evidence select
                    Array.from(document.getElementsByClassName(`${this._prefix}EvidenceReviewCheckbox`)).forEach(element => {
                        if (row.id === element.dataset.variantId) {
                            // eslint-disable-next-line no-param-reassign
                            element.disabled = !this.checkedVariants.has(row.id) || this.clinicalAnalysis.locked || this.clinicalAnalysis.interpretation?.locked;
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
                            element.disabled = !isEvidenceSelected || this.clinicalAnalysis.locked || this.clinicalAnalysis.interpretation?.locked;
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
            theadClasses: "table-light",
            buttonsClass: "light",
            // data: this.clinicalVariants,
            columns: this._getDefaultColumns(),
            sidePagination: "server",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Josemi Note 2023-10-25: we have added the ajax function for local variants also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.clinicalVariants.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2023-10-25: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.clinicalVariants.length,
                    rows: response,
                };
            },
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "both",
            formatShowingRows: this.gridCommons.formatShowingRows,
            detailView: this._config.detailView,
            detailFormatter: (value, row) => this.detailFormatter(value, row),
            loadingTemplate: () => GridCommons.loadingFormatter(),
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
                document.getElementById(this._prefix + row.id + "ShowEvidence")?.addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));
                document.getElementById(this._prefix + row.id + "HideEvidence")?.addEventListener("click", VariantGridFormatter.toggleDetailClinicalEvidence.bind(this));

                document.getElementById(this._prefix + row.id + "ShowCt")?.addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));
                document.getElementById(this._prefix + row.id + "HideCt")?.addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));

                // Enable or disable evidence select
                Array.from(document.getElementsByClassName(`${this._prefix}EvidenceReviewCheckbox`)).forEach(element => {
                    if (row.id === element.dataset.variantId) {
                        // eslint-disable-next-line no-param-reassign
                        element.disabled = !this.checkedVariants.has(row.id) || this.clinicalAnalysis.locked || this.clinicalAnalysis.interpretation?.locked;
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
                        element.disabled = !isEvidenceSelected || this.clinicalAnalysis.locked || this.clinicalAnalysis.interpretation?.locked;
                        element.addEventListener("click", e => this.onVariantEvidenceReview(e));
                    }
                });

                UtilsNew.initTooltip(this);
            },
            onPostBody: data => {
                // We call onLoadSuccess to select first row, this is only needed when rendering from local
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
                this._rows = data;
            },
            rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
        });
    }

    // Grid formatters
    detailFormatter(value, row) {
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

            detailHtml += "<div style='padding: 25px 0px 5px 25px'><h4>Reported Cases</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter.reportedVariantDetailFormatter(value, this.queriedVariants[row.id], this.opencgaSession);
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
                                const columnId = column.replace("EXT_", "");
                                vcfDataColumns.push({
                                    id: columnId,
                                    title: columnId,
                                    field: {
                                        key: column,
                                        sampleId: this.clinicalAnalysis?.proband?.samples?.[0]?.id,
                                        variantCaller: variantCaller
                                    },
                                    rowspan: 1,
                                    colspan: 1,
                                    formatter: this.vcfDataFormatter,
                                    halign: this.displayConfigDefault.header.horizontalAlign,
                                    excludeFromSettings: true,
                                    visible: !this._config.hideVcfFileData,
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
                    formatter: (value, row, index) => VariantGridFormatter.variantIdFormatter(value, row, index, this.opencgaSession.project.organism.assembly, this._config),
                    halign: this.displayConfigDefault.header.horizontalAlign,
                    // sortable: true
                    visible: this.gridCommons.isColumnVisible("id"),
                },
                {
                    id: "type",
                    title: "Type",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: VariantGridFormatter.typeFormatter.bind(this),
                    halign: this.displayConfigDefault.header.horizontalAlign,
                    visible: !this._config.hideType && this.gridCommons.isColumnVisible("type"),
                },
                {
                    id: "gene",
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.geneFormatter(row, index, this.query, this.opencgaSession, this._config),
                    halign: this.displayConfigDefault.header.horizontalAlign,
                    visible: this.gridCommons.isColumnVisible("gene"),
                },
                {
                    id: "hgvs",
                    title: "HGVS",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.hgvsFormatter(row, this._config),
                    halign: this.displayConfigDefault.header.horizontalAlign,
                    visible: this.gridCommons.isColumnVisible("hgvs"),
                },
                {
                    id: "consequenceType",
                    title: "Consequence Type",
                    field: "consequenceType",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.consequenceTypeFormatter(value, row, this?.query?.ct, this._config),
                    halign: this.displayConfigDefault.header.horizontalAlign,
                    visible: this.gridCommons.isColumnVisible("consequenceType"),
                },
                {
                    id: "deleteriousness",
                    title: `Deleteriousness <a tooltip-title="Deleteriousness" tooltip-text="SIFT scores are classified into tolerated and deleterious.
                        Polyphen scores are classified into benign, possibly damaging, probably damaging and possibly & probably damaging.
                        Please, leave the cursor over each tag to visualize the actual score value.
                        SIFT score takes values in the range [0, infinite[, the lower the values, the more damaging the prediction.
                        Polyphen score takes values in the range [0, 1[, the closer to 2, the more damaging the prediction.
                        CADD is a tool for scoring the deleteriousness of single nucleotide variants in the human genome.
                        C-scores strongly correlate with allelic diversity, pathogenicity of both coding and non-coding variants,
                        and experimentally measured regulatory effects, and also highly rank causal variants within individual genome sequences.
                        SpliceAI: a deep learning-based tool to identify splice variants.">
                        <i class="fa fa-info-circle text-primary" aria-hidden="true"></i></a>`,
                    field: "deleteriousness",
                    rowspan: 1,
                    colspan: 5,
                    align: "center"
                },
                {
                    id: "evidences",
                    title: "Role in Cancer",
                    field: "evidences",
                    rowspan: 2,
                    colspan: 1,
                    formatter: VariantInterpreterGridFormatter.roleInCancerFormatter.bind(this),
                    halign: this.displayConfigDefault.header.horizontalAlign,
                    visible: this.clinicalAnalysis.type?.toUpperCase() === "CANCER" && this.gridCommons.isColumnVisible("evidences"),
                    excludeFromSettings: !(this.clinicalAnalysis.type?.toUpperCase() === "CANCER"),
                },
                {
                    id: "VCF_Data",
                    title: "VCF File Data: " + vcfDataColumnNames.join(", "),
                    rowspan: 1,
                    colspan: vcfDataColumns?.length,
                    halign: this.displayConfigDefault.header.horizontalAlign,
                },
                {
                    id: "cohort",
                    title: "Cohort Stats",
                    field: "cohort",
                    rowspan: 2,
                    colspan: 1,
                    align: "center",
                    formatter: VariantInterpreterGridFormatter.studyCohortsFormatter.bind(this),
                    // visible: this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY",
                    visible: this.gridCommons.isColumnVisible("cohort"),
                },
                {
                    id: "populationFrequencies",
                    columnTitle: "Reference Population Frequencies",
                    title: `Reference <br> Population <br> Frequencies
                        <a class="pop-preq-info-icon"
                            tooltip-title="Reference Population Frequencies"
                            tooltip-text="${VariantGridFormatter.populationFrequenciesInfoTooltipContent(POPULATION_FREQUENCIES)}"
                            tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                        </a>`,
                    field: "populationFrequencies",
                    rowspan: 2,
                    colspan: 1,
                    align: "center",
                    formatter: (value, row) => {
                        return VariantInterpreterGridFormatter.clinicalPopulationFrequenciesFormatter(value, row, this._config);
                    },
                    visible: !this._config.hidePopulationFrequencies && this.gridCommons.isColumnVisible("populationFrequencies"),
                },
                {
                    id: "clinicalInfo",
                    title: `Clinical Info <a id="phenotypesInfoIcon" tooltip-title="Phenotypes" tooltip-text="
                                <div>
                                    <span class='fw-bold'>ClinVar</span> is a freely accessible, public archive of reports of the relationships among human variations
                                    and phenotypes, with supporting evidence.
                                </div>
                                <div style='padding-top: 10px'>
                                    <span class='fw-bold'>COSMIC</span> is the world's largest and most comprehensive resource for exploring the impact of somatic mutations in human cancer.
                                </div>"
                            tooltip-position-at="left bottom" tooltip-position-my="right top"><i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                    rowspan: 1,
                    colspan: 6,
                    align: "center"
                },
                {
                    id: "methods",
                    title: "Methods",
                    rowspan: 1,
                    colspan: 1,
                    halign: this.displayConfigDefault.header.horizontalAlign,
                },
                {
                    id: "interpretation",
                    title: `Interpretation
                        <a class='interpretation-info-icon'
                            tooltip-title='Interpretation'
                            tooltip-text="<span class='fw-bold'>Prediction</span> column shows the Clinical Significance prediction and Tier following the ACMG guide recommendations"
                            tooltip-position-at="left bottom"
                            tooltip-position-my="right top">
                            <i class='fa fa-info-circle' aria-hidden='true'></i>
                        </a>`,
                    field: "interpretation",
                    rowspan: 1,
                    colspan: 4,
                    halign: this.displayConfigDefault.header.horizontalAlign,
                },
                {
                    id: "actions",
                    title: "Actions",
                    rowspan: 2,
                    colspan: 1,
                    eligible: false,
                    formatter: (value, row) => {
                        let copiesHtml = "";
                        if (this._config.copies) {
                            for (const copy of this._config.copies) {
                                // Check if the copy object has an execute function, this prevents two possible scenarios:
                                // 1. a 'copy' stored in OpenCGA config that has been removed from IVA config
                                // 2. an incorrect copy configuration

                                // Ideas:
                                // CustomActions.check(copy)
                                // CustomActions.checkVersion(copy)
                                // CustomActions.get(copy).execute(variant, showConsequenceTypes)
                                if (copy.execute || CustomActions.exists(copy)) {
                                    copiesHtml = `
                                        <li>
                                            <a href="javascript: void 0" class="dropdown-item" data-action="${copy.id}">
                                                <i class="fas fa-copy" aria-hidden="true" alt="${copy.description}"></i> ${copy.name}
                                            </a>
                                        </li>
                                    `;
                                }
                            }
                        }

                        const reviewId = `${this._prefix}${row.id}VariantReviewActionButton`;
                        const reviewDisabled = (!this.checkedVariants.has(row.id) || this.clinicalAnalysis.locked || this.clinicalAnalysis.interpretation?.locked) ? "disabled" : "";

                        return `
                            <div class="dropdown">
                                <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-toolbox me-1" aria-hidden="true"></i>
                                    Actions
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a id="${reviewId}" href="javascript: void 0" class="dropdown-item reviewButton" data-action="edit" ${reviewDisabled}>
                                            <i class="fas fa-edit me-1 reviewButton" aria-hidden="true"></i> Edit ...
                                        </a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li class="dropdown-header">External Links</li>
                                    <li>
                                        <a target="_blank" class="dropdown-item"
                                                href="${BioinfoUtils.getVariantLink(row.studies[0]?.files[0]?.call?.variantId?.split(",")[0] || row.id, row.chromosome + ":" + row.start + "-" + row.end, "decipher")}">
                                            <i class="fas fa-external-link-alt me-1" aria-hidden="true"></i> Decipher
                                        </a>
                                    </li>
                                    <li data-cy="varsome-variant-link">
                                        <a target="_blank" class="btn force-text-left" ${row.type === "COPY_NUMBER" ? "disabled" : ""}
                                            href="${BioinfoUtils.getVariantLink(row.id, "", "varsome", this.opencgaSession?.project?.organism?.assembly)}">
                                            <i class="fas fa-external-link-alt me-1" aria-hidden="true"></i> Varsome
                                        </a>
                                    </li>
                                    <li class="dropdown-header">CellBase Links</li>
                                    ${["v5.2", "v5.8"].map(v => `
                                    <li>
                                        <a target="_blank" class="dropdown-item" href="${BioinfoUtils.getVariantLink(row.id, row.chromosome + ":" + row.start + "-" + row.end, `CELLBASE_${v}`)}">
                                            <i class="fas fa-external-link-alt me-1" aria-hidden="true"></i>
                                            CellBase ${v} ${this.opencgaSession?.project.cellbase.version === v ? "(current)" : ""}
                                        </a>
                                    </li>
                                    `).join("")}
                                    <li class="dropdown-header">External Genome Browsers</li>
                                    <li>
                                        <a target="_blank" class="dropdown-item"
                                                href="${BioinfoUtils.getVariantLink(row.id, row.chromosome + ":" + row.start + "-" + row.end, "ensembl_genome_browser", this.opencgaSession?.project?.organism?.assembly)}">
                                            <i class="fas fa-external-link-alt me-1" aria-hidden="true"></i> Ensembl Genome Browser
                                        </a>
                                    </li>
                                    <li>
                                        <a target="_blank" class="dropdown-item"
                                                href="${BioinfoUtils.getVariantLink(row.id, row.chromosome + ":" + row.start + "-" + row.end, "ucsc_genome_browser")}">
                                            <i class="fas fa-external-link-alt me-1" aria-hidden="true"></i> UCSC Genome Browser
                                        </a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li class="dropdown-header">Fetch Variant</li>
                                    <li>
                                        <a href="javascript: void 0" class="dropdown-item" data-action="copy-json">
                                            <i class="fas fa-copy me-1" aria-hidden="true"></i> Copy JSON
                                        </a>
                                    </li>
                                    <li>
                                        <a href="javascript: void 0" class="dropdown-item" data-action="download">
                                            <i class="fas fa-download me-1" aria-hidden="true"></i> Download JSON
                                        </a>
                                    </li>
                                    <li data-cy="varsome-copy">
                                        <a href="javascript: void 0" class="btn force-text-left" ${row.type === "COPY_NUMBER" ? "disabled" : ""} data-action="copy-varsome-id">
                                            <i class="fas fa-download me-1" aria-hidden="true"></i> Copy Varsome ID
                                        </a>
                                    </li>
                                    ${copiesHtml ? `
                                        <li><hr class="dropdown-divider"></li>
                                        <li class="dropdown-header">Custom Copy</li>
                                        ${copiesHtml}
                                    ` : ""}
                                </ul>
                            </div>`;
                    },
                    align: "center",
                    events: {
                        "click a": (e, value, row) => this.onActionClick(e, value, row)
                    },
                    visible: this._config?.showActions,
                    excludeFromSettings: true,
                    excludeFromExport: true // this is used in opencga-export
                    // visible: this._config.showActions && !this._config?.columns?.hidden?.includes("actions")
                },
            ],
            [
                {
                    id: "SIFT",
                    title: "SIFT",
                    field: "sift",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.siftPproteinScoreFormatter(value, row, this.consequenceTypeColors),
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("SIFT", "deleteriousness")
                },
                {
                    id: "polyphen",
                    title: "Polyphen",
                    field: "polyphen",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.polyphenProteinScoreFormatter(value, row, this.consequenceTypeColors),
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("polyphen", "deleteriousness")
                },
                {
                    id: "revel",
                    title: "Revel",
                    field: "revel",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.revelProteinScoreFormatter(value, row),
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("revel", "deleteriousness")
                },
                {
                    id: "cadd",
                    title: "CADD",
                    field: "cadd",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.caddScaledFormatter(value, row),
                    align: "right",
                    halign: this.displayConfigDefault.header.horizontalAlign,
                    visible: !this._config.hideDeleteriousness && this.gridCommons.isColumnVisible("cadd", "deleteriousness"),
                    excludeFromSettings: this._config.hideDeleteriousness,
                    excludeFromExport: this._config.hideDeleteriousness,
                },
                {
                    id: "spliceai",
                    title: "SpliceAI",
                    field: "spliceai",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.spliceAIFormatter(value, row),
                    align: "right",
                    halign: this.displayConfigDefault.header.horizontalAlign,
                    visible: !this._config.hideDeleteriousness && this.gridCommons.isColumnVisible("spliceai", "deleteriousness"),
                    excludeFromSettings: this._config.hideDeleteriousness,
                    excludeFromExport: this._config.hideDeleteriousness,
                },
                ...vcfDataColumns,
                {
                    id: "clinvar",
                    title: "ClinVar",
                    field: "clinvar",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalTraitAssociationFormatter,
                    align: "center",
                    visible: !this._config.hideClinicalInfo && this.gridCommons.isColumnVisible("clinvar", "clinicalInfo"),
                },
                {
                    id: "cosmic",
                    title: "Cosmic",
                    field: "cosmic",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalTraitAssociationFormatter,
                    align: "center",
                    visible: !this._config.hideClinicalInfo && this.gridCommons.isColumnVisible("cosmic", "clinicalInfo"),
                },
                {
                    id: "hgmd",
                    title: "HGMD",
                    field: "hgmd",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalTraitAssociationFormatter,
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("hgmd", "clinicalInfo")
                },
                {
                    id: "omim",
                    title: "OMIM",
                    field: "omim",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalOmimFormatter,
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("omim"),
                },
                {
                    id: "pharmgkb",
                    title: "PharmGKB",
                    field: "pharmgkb",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalPharmGKBFormatter,
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("pharmgkb"),
                },
                {
                    id: "hotspots",
                    title: "Cancer <br> Hotspots",
                    field: "hotspots",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalCancerHotspotsFormatter,
                    align: "center",
                    visible: !this._config.hideClinicalInfo && this.gridCommons.isColumnVisible("hotspots", "clinicalInfo"),
                },
                // Interpretation methods column
                {
                    id: "exomiser",
                    title: "Exomiser",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => {
                        const variant = this.checkedVariants.get(row.id);
                        return VariantInterpreterGridFormatter.exomiserScoresFormatter(value, variant);
                    },
                    align: "center",
                    visible: this.clinicalAnalysis?.interpretation?.method?.name === "interpretation-exomiser" && this.gridCommons.isColumnVisible("exomiser", "methods"),
                    excludeFromSettings: !(this.clinicalAnalysis?.interpretation?.method?.name === "interpretation-exomiser"),
                },
                // Interpretation Column
                {
                    id: "reported",
                    title: "Interpreted and/or<br> Reported",
                    field: "reported",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.reportedVariantFormatter(value, this.queriedVariants[row.id]),
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("reported", "interpretation"),
                },
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
                    visible: (
                        (this.clinicalAnalysis.type?.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type?.toUpperCase() === "FAMILY") &&
                        this.gridCommons.isColumnVisible("prediction", "interpretation")
                    ),
                },
                {
                    id: "Select",
                    title: "Select",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => {
                        const checked = this.checkedVariants?.has(row.id) ? "checked" : "";
                        const disabled = (this.clinicalAnalysis.locked || this.clinicalAnalysis.interpretation?.locked) ? "disabled" : "";
                        return `<input class="check check-variant" type="checkbox" data-variant-id="${row.id}" ${checked} ${disabled}>`;
                    },
                    align: "center",
                    events: {
                        "click input": e => this.onVariantCheck(e)
                    },
                    visible: this._config.showSelectCheckbox,
                    excludeFromSettings: true,
                    excludeFromExport: true // this is used in opencga-export
                },
                {
                    id: "review",
                    title: "Review",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row, index) => {
                        const disabled = (!this.checkedVariants?.has(row.id) || this.clinicalAnalysis.locked || this.clinicalAnalysis.interpretation?.locked) ? "disabled" : "";
                        const checked = this.checkedVariants.has(row.id);
                        const variant = checked ? this.checkedVariants.get(row.id) : row;
                        return VariantInterpreterGridFormatter.reviewFormatter(variant, index, checked, disabled, this._prefix, this._config);
                    },
                    align: "center",
                    events: {
                        "click button": e => this.onVariantReview(e)
                    },
                    excludeFromSettings: true,
                    visible: this.review || this._config?.showReview,
                    excludeFromExport: true // this is used in opencga-export
                },
            ]
        ];

        // update columns dynamically
        this._columns = this._updateTableColumns(this._columns);
        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);

        return this._columns;
    }

    _updateTableColumns(_columns) {
        let samples = [];
        if (!_columns) {
            return;
        }

        if (this.clinicalAnalysis && (this.clinicalAnalysis.type?.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type?.toUpperCase() === "FAMILY")) {
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
                            role: this.clinicalAnalysis.family?.roles[this.clinicalAnalysis.proband.id]?.[member.id]?.toLowerCase(),
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
                _columns[0].splice(6, 0, {
                    id: "sampleGenotypes",
                    title: "Sample Genotypes",
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

                    _columns[1].splice(i + 5, 0, {
                        id: samples[i].id,
                        title: `<span style="color: ${color}">${samples[i].id}</span>
                                <br>
                                <span style="font-style: italic">${sampleInfo[samples[i].id].role}, ${affected}</span>`,
                        rowspan: 1,
                        colspan: 1,
                        formatter: (value, row, index) => {
                            return VariantInterpreterGridFormatter.sampleGenotypeFormatter(value, row, index, {
                                sampleId: samples[i].id,
                                clinicalAnalysis: this.clinicalAnalysis,
                                config: this._config
                            });
                        },
                        align: "center",
                        excludeFromSettings: true,
                        visible: !this._config.hideSampleGenotypes,
                    });
                }
            }
        }

        if (this.clinicalAnalysis && this.clinicalAnalysis.type?.toUpperCase() === "CANCER") {
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
                    samples = this.clinicalAnalysis.proband.samples.filter(s => s.somatic === this._config?.somatic);
                }

                _columns[0].splice(7, 0, {
                    id: "sampleGenotypes",
                    title: "Sample Genotypes",
                    rowspan: 1,
                    colspan: samples.length,
                    align: "center"
                });
                for (let i = 0; i < samples.length; i++) {
                    const sample = samples[i];
                    const color = sample?.somatic ? "darkred" : "black";

                    _columns[1].splice(i + 5, 0, {
                        id: sample.id,
                        title: `
                            <div style="word-break:break-all;max-width:192px;white-space:break-spaces;">${sample.id}</div>
                            <div style="color:${color};font-style:italic;">${sample?.somatic ? "somatic" : "germline"}</div>
                        `,
                        rowspan: 1,
                        colspan: 1,
                        formatter: (value, row, index) => {
                            return VariantInterpreterGridFormatter.sampleGenotypeFormatter(value, row, index, {
                                sampleId: sample.id,
                                config: this._config,
                                clinicalAnalysis: this.clinicalAnalysis
                            });
                        },
                        align: "center",
                        excludeFromSettings: true,
                        visible: !this._config.hideSampleGenotypes,
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
                    const modalElm = document.querySelector(`#${this._prefix}ReviewSampleModal`);
                    UtilsNew.draggableModal(document, modalElm);
                    // $(`#${this._prefix}ReviewSampleModal`).modal("show");
                    const variantModal = new bootstrap.Modal(modalElm);
                    variantModal.show();
                }
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(row, null, "\t"));
                break;
            case "download":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
            case "copy-varsome-id":
                // Note: varsome format is disabled for copy_number variants
                // See https://app.clickup.com/t/36631768/TASK-3902
                if (row.type !== "COPY_NUMBER") {
                    const varsomeId = BioinfoUtils.getVariantInVarsomeFormat(row.id);
                    UtilsNew.copyToClipboard(varsomeId);
                }
                break;
            default:
                const copy = this._config.copies.find(copy => copy.id.toLowerCase() === action);
                if (copy) {
                    // Sort and group CTs by Gene name
                    BioinfoUtils.sort(row.evidences, v => v.genomicFeature?.geneName);

                    // we need to prepare evidences to be filtered properly,
                    // the easiest way is to recycle the existing function 'consequenceTypeDetailFormatterFilter',
                    // so we need to add consequenceType information
                    const transcriptMap = new Map();
                    row.annotation.consequenceTypes.forEach(ct => transcriptMap.set(ct.transcriptId, ct));
                    const newEvidences = [];
                    row.evidences.forEach((evidence, index) => {
                        // we are missing regulatory variants
                        if (evidence.genomicFeature?.transcriptId) {
                            const newEvidence = {
                                index,
                                ...evidence,
                                ...transcriptMap.get(evidence.genomicFeature.transcriptId)
                            };
                            newEvidences.push(newEvidence);
                        }
                    });
                    const showArrayIndexes = VariantGridFormatter._consequenceTypeDetailFormatterFilter(newEvidences, this._config).indexes;
                    UtilsNew.copyToClipboard(CustomActions.get(copy).execute(row, showArrayIndexes));
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
        // $("#" + this._prefix + "ConfigModal").modal("show");
        const configModal = new bootstrap.Modal("#" + this._prefix + "ConfigModal");
        configModal.show();
    }

    onVariantCheck(e) {
        const variantId = e.currentTarget.dataset.variantId;

        // NOTE Josemi 20221121: we will check first if this variant is in the primaryFindings list
        // If not, we will get the variant from the rows list
        let variant = (this.clinicalAnalysis?.interpretation?.primaryFindings || []).find(item => item.id === variantId);
        if (!variant) {
            variant = this._rows.find(e => e.id === variantId);
        }

        if (e.currentTarget.checked) {
            // Add current filter executed when variant is checked
            variant.filters = {...this.filters};
            this.checkedVariants.set(variantId, variant);
        } else {
            this.checkedVariants.delete(variantId);
        }

        // Set 'Edit' button as enabled/disabled in 'Review' column
        // Josemi NOTE 20240205 - Edit buton in column is not rendered when 'Review' column is hidden
        const reviewButton = document.getElementById(`${this._prefix}${variantId}VariantReviewButton`);
        if (reviewButton) {
            reviewButton.disabled = !e.currentTarget.checked;
        }

        // Set 'Edit' button as enabled/disabled in 'Actions' dropdown
        // Josemi NOTE 20240205 - Edit buton in actions dropdown is not rendered when when actions column is hidden
        const reviewActionButton = document.getElementById(`${this._prefix}${variantId}VariantReviewActionButton`);
        if (reviewActionButton) {
            if (e.currentTarget.checked) {
                reviewActionButton.removeAttribute("disabled");
            } else {
                reviewActionButton.setAttribute("disabled", "true");
            }
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
            const modalElm = document.querySelector(`#${this._prefix}ReviewSampleModal`);
            UtilsNew.draggableModal(document, modalElm);
            // $(`#${this._prefix}ReviewSampleModal`).modal("show");
            const reviewSampleModal = new bootstrap.Modal(modalElm);
            reviewSampleModal.show();
        }
    }

    onVariantReviewChange(e) {
        this.variantReview = e.detail.value;
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
            const modalElm = document.querySelector(`#${this._prefix}EvidenceReviewModal`);
            UtilsNew.draggableModal(document, modalElm);
            // $(`#${this._prefix}EvidenceReviewModal`).modal("show");
            const evidenceReviewModal = new bootstrap.Modal(modalElm);
            evidenceReviewModal.show();
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
                        <button type="button" class="btn btn-light btn-sm" aria-haspopup="true" aria-expanded="false" @click="${e => this.onConfigClick(e)}">
                            <i class="fas fa-cog"></i> Settings ...
                        </button>`
                }
            ];
        }
        return [];
    }

    renderStyle() {
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
        `;
    }

    render() {
        return html`

            <div id="${this.gridId}WarningEvents"></div>

            <opencb-grid-toolbar
                .config="${this.toolbarConfig}"
                .settings="${this.toolbarSetting}"
                .query="${this.filters}"
                .opencgaSession="${this.opencgaSession}"
                @columnChange="${this.onColumnChange}"
                @download="${this.onDownload}"
                @export="${this.onDownload}">
            </opencb-grid-toolbar>

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}VariantBrowserGrid"></table>
            </div>

            <div class="modal fade" id="${this._prefix}ReviewSampleModal" tabindex="-1"
                role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog modal-lg" style="width: 768px">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Review Variant</h3>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal" @click="${() => this.onVariantReviewCancel()}">Cancel</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="${() => this.onVariantReviewOk()}">Ok</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade pt-0" id="${this._prefix}EvidenceReviewModal" tabindex="-1"
                role="dialog" aria-hidden="true" style="overflow-y: visible">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Review Variant Evidence</h3>
                        </div>
                        ${this.evidenceReview ? html`
                            <clinical-interpretation-variant-evidence-review
                                .opencgaSession="${this.opencgaSession}"
                                .review="${this.evidenceReview}"
                                .mode="${"page"}"
                                .somatic="${this.clinicalAnalysis.type === "CANCER"}"
                                @evidenceReviewChange="${e => this.onEvidenceReviewChange(e)}">
                            </clinical-interpretation-variant-evidence-review>
                        ` : null}
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="${() => this.onEvidenceReviewOk()}">Ok</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            // Bootstrap Grid config
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            detailView: true,
            showSelectCheckbox: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 10,

            showReview: true,
            showEditReview: true,
            showType: true,

            showToolbar: true,
            showActions: true,

            showCreate: false,
            showExport: true,
            showSettings: true,
            exportTabs: ["download", "export", "link", "code"], // this is customisable in external settings in `table.toolbar`

            hideType: false,
            hidePopulationFrequencies: false,
            hideClinicalInfo: false,
            hideDeleteriousness: false,
            hideSampleGenotypes: false,
            hideVcfFileData: false,

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
