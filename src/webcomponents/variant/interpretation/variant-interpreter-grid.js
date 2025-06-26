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
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
import GridCommons from "../../commons/grid-commons.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import CustomActions from "../../commons/custom-actions";
import VariantUtils from "../variant-utils.js";
import WebUtils from "../../commons/utils/web-utils.js";
import "../../commons/grid-toolbar.js";
import "../../loading-spinner.js";
import "../review/variant-review.js";
import "./variant-interpreter-grid-config.js";
import "./variant-interpreter-view.js";

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
        this.RESOURCE = "CLINICAL_VARIANT";
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
        this._rows = [];
        this._selectedVariant = null;
        this._selectedVariantChecked = false;
        this._selectedEvidence = null;
        this._selectedEvidenceIndex = null;
        this._checkedVariants = new Map();

        this.toolbarConfig = {};
        this.toolbarSetting = {};

        this.gridId = this._prefix + "VariantBrowserGrid";
        this.active = true;
        this.review = false;

        this.gridCommons = null;

        // Set colors
        // eslint-disable-next-line no-undef
        this.consequenceTypeColors = VariantGridFormatter.assignColors(CONSEQUENCE_TYPES, PROTEIN_SUBSTITUTION_SCORE);

        // Keep the status of selected variants
        this.queriedVariants = {};
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

            this._checkedVariants = new Map();
            if (this.clinicalAnalysis?.interpretation?.primaryFindings?.length > 0) {
                for (const variant of this.clinicalAnalysis.interpretation.primaryFindings) {
                    this._checkedVariants.set(variant.id, variant);
                }
            } else {
                this._checkedVariants.clear();
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
            resource: this.RESOURCE,
            showInterpreterConfig: true,
            columns: this._getDefaultColumns()
        };

        // register modals
        this.gridCommons.registerModals({
            "review-variant": () => ({
                display: {
                    scrollable: true,
                    title: `${WebUtils.formatDisplayName(this.clinicalAnalysis.interpretation.id, this.clinicalAnalysis.interpretation.name)} - Review Variant`,
                    size: "modal-3xl",
                    buttonsVisible: true,
                    buttonCancelText: "Cancel",
                    buttonSaveText: "Save Review",
                },
                render: () => html`
                    <variant-review
                        .opencgaSession="${this.opencgaSession}"
                        .clinicalAnalysis="${this.clinicalAnalysis}"
                        .variant="${this._selectedVariant}"
                        .selected="${this._selectedVariantChecked}"
                        .reviewEvidences="${true}"
                        .settings="${{
                            geneSet: this._config?.geneSet,
                            consequenceType: this._config?.consequenceType,
                        }}"
                        @variantChange="${event => this.onVariantReviewChange(event)}">
                    </variant-review>
                `,
                onCancel: () => {
                    this.onVariantReviewCancel();
                },
                onSave: () => {
                    this.onVariantReviewSave();
                },
            }),
            "view-variant": () => ({
                display: {
                    modalTitle: `Variant ${this._selectedVariant.id}`,
                    modalCyDataName: `modal-variant-view`,
                    modalSize: "modal-3xl",
                },
                render: () => html`
                    <variant-interpreter-view
                        .opencgaSession="${this.opencgaSession}"
                        .clinicalAnalysis="${this.clinicalAnalysis}"
                        .toolId="${this.toolId}"
                        .variant="${this._selectedVariant}">
                    </variant-interpreter-view>
                `,
            }),
            // "review-variant": () => ({
            //     display: {
            //         modalTitle: `Review Variant ${this._selectedVariant.id}`,
            //         modalCyDataName: `modal-variant-reivew`,
            //         modalSize: "modal-lg",
            //         modalBtnsVisible: true,
            //         btnCancelText: "Cancel",
            //         btnSaveText: "Save",
            //     },
            //     render: () => html`
            //         <clinical-interpretation-variant-review
            //             .opencgaSession="${this.opencgaSession}"
            //             .variant="${this._selectedVariant}"
            //             .mode="${"form"}"
            //             @variantChange="${e => this.onVariantReviewChange(e)}">
            //         </clinical-interpretation-variant-review>
            //     `,
            //     onCancel: () => this.onVariantReviewCancel(),
            //     onOk: () => this.onVariantReviewSave(),
            // }),
            // "review-evidence": () => ({
            //     display: {
            //         modalTitle: `Review Variant Evidence`,
            //         modalCyDataName: `modal-evidence-review`,
            //         modalSize: "modal-lg",
            //         modalBtnsVisible: true,
            //         btnCancelText: "Cancel",
            //         btnSaveText: "Save",
            //     },
            //     render: () => html`
            //         <clinical-interpretation-variant-evidence-review
            //             .opencgaSession="${this.opencgaSession}"
            //             .review="${this._selectedEvidence}"
            //             .mode="${"page"}"
            //             .somatic="${this.clinicalAnalysis.type === "CANCER"}"
            //             @evidenceReviewChange="${e => this.onEvidenceReviewChange(e)}">
            //         </clinical-interpretation-variant-evidence-review>
            //     `,
            //     onCancel: () => this.onEvidenceReviewCancel(),
            //     onOk: () => this.onEvidenceReviewSave(),
            // }),
        });
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
                classes: "table table-borderless table-hover table-grid",
                buttonsClass: "light",
                columns: this._getDefaultColumns(),
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                // Set table properties, these are read from config property
                uniqueId: "id",
                silentSort: false,
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows, null, this.isApproximateCount),
                loadingTemplate: () => GridCommons.loadingFormatter(),
                // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
                variantGrid: this,
                ajax: params => {
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
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: variantResponse,
                            });
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
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
                rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
            });
        }
    }

    renderLocalVariants() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            classes: "table table-borderless table-hover table-grid",
            buttonsClass: "light",
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
            paginationVAlign: "bottom",
            formatShowingRows: this.gridCommons.formatShowingRows,
            loadingTemplate: () => GridCommons.loadingFormatter(),
            // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
            variantGrid: this,
            onPostBody: data => {
                // We call onLoadSuccess to select first row, this is only needed when rendering from local
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
                this._rows = data;
            },
            rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
        });
    }

    // Grid formatters
    // TODO: REMOVE
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
                                    align: "center",
                                    halign: "center",
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
                    formatter: (value, row, index) => {
                        return VariantGridFormatter.variantIdFormatter(value, row, index, this.opencgaSession.project.organism.assembly, this._config);
                    },
                    events: {
                        "click a": (event, value, row) => this.onActionClick(event, row),
                    },
                    visible: this.gridCommons.isColumnVisible("id"),
                },
                {
                    id: "type",
                    title: "Type",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: VariantGridFormatter.typeFormatter.bind(this),
                    visible: !this._config.hideType && this.gridCommons.isColumnVisible("type"),
                },
                {
                    id: "gene",
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.geneFormatter(row, index, this.query, this.opencgaSession, this._config),
                    visible: this.gridCommons.isColumnVisible("gene"),
                },
                {
                    id: "hgvs",
                    title: "HGVS",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.hgvsFormatter(row, this._config),
                    visible: this.gridCommons.isColumnVisible("hgvs"),
                },
                {
                    id: "consequenceType",
                    title: "Consequence Type",
                    field: "consequenceType",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.consequenceTypeFormatter(value, row, this?.query?.ct, this._config),
                    visible: this.gridCommons.isColumnVisible("consequenceType"),
                },
                {
                    id: "deleteriousness",
                    title: `
                        <span>Deleteriousness</span>
                        <a tooltip-title="Deleteriousness" tooltip-text="${VariantGridFormatter.deleteriousnessInfoTooltipContent()}">
                            <i class="fa fa-info-circle text-primary"></i>
                        </a>
                    `,
                    field: "deleteriousness",
                    rowspan: 1,
                    colspan: 5,
                    align: "center",
                    halign: "center",
                },
                {
                    id: "evidences",
                    title: "Role in Cancer",
                    field: "evidences",
                    rowspan: 2,
                    colspan: 1,
                    formatter: VariantInterpreterGridFormatter.roleInCancerFormatter.bind(this),
                    visible: this.clinicalAnalysis.type?.toUpperCase() === "CANCER" && this.gridCommons.isColumnVisible("evidences"),
                    excludeFromSettings: !(this.clinicalAnalysis.type?.toUpperCase() === "CANCER"),
                },
                {
                    id: "VCF_Data",
                    title: "VCF File Data: " + vcfDataColumnNames.join(", "),
                    rowspan: 1,
                    colspan: vcfDataColumns?.length,
                    halign: "center",
                },
                {
                    id: "cohort",
                    title: "Cohort Stats",
                    field: "cohort",
                    rowspan: 2,
                    colspan: 1,
                    align: "center",
                    formatter: VariantInterpreterGridFormatter.studyCohortsFormatter.bind(this),
                    visible: this.gridCommons.isColumnVisible("cohort"),
                },
                {
                    id: "populationFrequencies",
                    columnTitle: "Reference Population Frequencies",
                    title: `
                        <span>Reference<br>Population Frequencies</span>
                        <a tooltip-title="Population Frequencies" tooltip-text="${VariantGridFormatter.populationFrequenciesInfoTooltipContent(POPULATION_FREQUENCIES)}">
                            <i class="fa fa-info-circle text-primary"></i>
                        </a>
                    `,
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
                    title: `
                        <span>Clinical Info</span>
                        <a tooltip-title="Clinical Info" tooltip-text="${VariantGridFormatter.clinicalInfoTooltipContent()}" tooltip-position-my="right top">
                            <i class="fa fa-info-circle text-primary"></i>
                        </a>
                    `,
                    rowspan: 1,
                    colspan: 6,
                    align: "center"
                },
                {
                    id: "methods",
                    title: "Methods",
                    rowspan: 1,
                    colspan: 1,
                },
                {
                    id: "interpretation",
                    title: `
                        <span>Interpretation</span>
                        <a tooltip-title="Interpretation" tooltip-text="${VariantGridFormatter.interpretationInfoTooltipContent()}" tooltip-position-my="right top">
                            <i class="fa fa-info-circle text-primary"></i>
                        </a>
                    `,
                    field: "interpretation",
                    align: "center",
                    rowspan: 1,
                    colspan: 3,
                },
                {
                    id: "actions",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => this.actionsFormatter(value, row),
                    align: "right",
                    events: {
                        "click a": (event, value, row) => this.onActionClick(event, row)
                    },
                    visible: this._config?.showActions,
                    excludeFromSettings: true,
                    excludeFromExport: true,
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
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("revel", "deleteriousness")
                },
                {
                    id: "cadd",
                    title: "CADD",
                    field: "cadd",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.caddScaledFormatter(value, row),
                    align: "center",
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
                    align: "center",
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
                        const variant = this._checkedVariants.get(row.id);
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
                        const checkedVariant = this._checkedVariants?.has(row.id) ? this._checkedVariants.get(row.id) : row;
                        return VariantInterpreterGridFormatter.predictionFormatter(value, checkedVariant);
                    },
                    align: "center",
                    visible: (
                        (this.clinicalAnalysis.type?.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type?.toUpperCase() === "FAMILY") &&
                        this.gridCommons.isColumnVisible("prediction", "interpretation")
                    ),
                },
                {
                    id: "review",
                    title: "Review",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => {
                        return VariantInterpreterGridFormatter.newReviewFormatter(row, this.clinicalAnalysis, this._checkedVariants, this._config);
                    },
                    align: "center",
                    events: {
                        "click button": (event, value, row) => this.onVariantReview(event, row),
                    },
                    excludeFromSettings: true,
                    excludeFromExport: true,
                    visible: this.review || this._config?.showReview,
                },
            ]
        ];

        // update columns dynamically
        this._columns = this._updateTableColumns(this._columns);
        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);

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
                        title: `
                            <span style="color: ${color}">${samples[i].id}</span>
                            <br>
                            <span style="font-style: italic">${sampleInfo[samples[i].id].role}, ${affected}</span>
                        `,
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

    actionsFormatter(value, row) {
        // Check if the copy object has an execute function, this prevents two possible scenarios:
        // 1. a 'copy' stored in OpenCGA config that has been removed from IVA config
        // 2. an incorrect copy configuration
        const copiesItems = (this._config?.copies || [])
            .filter(copy => copy.execute || CustomActions.exists(copy))
            .map(copy => {
                return `
                    <a class="dropdown-item cursor-pointer" data-action="custom-copy" data-copy="${copy.id}">
                        <i class="fas fa-copy" alt="${copy.description}"></i> ${copy.name}
                    </a>
                `;
            });

        const reviewDisabled = this.clinicalAnalysis.locked || this.clinicalAnalysis.interpretation?.locked;
        const position = row.chromosome + ":" + row.start + "-" + row.end;

        return `
            <div class="dropdown">
                <button class="btn" data-bs-toggle="dropdown">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item ${reviewDisabled ? "disabled" : "cursor-pointer"}" data-action="review">
                        <i class="fas fa-edit pe-2"></i>
                        <span>Review Variant</span>
                    </a>
                    <hr class="dropdown-divider">
                    <div class="dropdown-header">External Links</div>
                    <a target="_blank" class="dropdown-item" href="${BioinfoUtils.getVariantLink(row.studies[0]?.files[0]?.call?.variantId?.split(",")[0] || row.id, position, "decipher")}">
                        <i class="fas fa-external-link-alt me-1"></i> Decipher
                    </a>
                    <a target="_blank" class="dropdown-item" ${row.type === "COPY_NUMBER" ? "disabled" : ""} href="${BioinfoUtils.getVariantLink(row.id, "", "varsome", this.opencgaSession?.project?.organism?.assembly)}">
                        <i class="fas fa-external-link-alt me-1"></i> Varsome
                    </a>
                    <div class="dropdown-header">CellBase Links</div>
                    ${["v5.2", "v5.8"].map(v => `
                        <a target="_blank" class="dropdown-item" href="${BioinfoUtils.getVariantLink(row.id, position, `CELLBASE_${v}`)}">
                            <i class="fas fa-external-link-alt me-1"></i>
                            <span>CellBase ${v} ${this.opencgaSession?.project.cellbase.version === v ? "(current)" : ""}</span>
                        </a>
                    `).join("")}
                    <div class="dropdown-header">External Genome Browsers</div>
                    <a target="_blank" class="dropdown-item" href="${BioinfoUtils.getVariantLink(row.id, position, "ensembl_genome_browser", this.opencgaSession?.project?.organism?.assembly)}">
                        <i class="fas fa-external-link-alt me-1"></i> Ensembl Genome Browser
                    </a>
                    <a target="_blank" class="dropdown-item" href="${BioinfoUtils.getVariantLink(row.id, position, "ucsc_genome_browser")}">
                        <i class="fas fa-external-link-alt me-1"></i> UCSC Genome Browser
                    </a>
                    <hr class="dropdown-divider">
                    <div class="dropdown-header">Fetch Variant</div>
                    <a class="dropdown-item cursor-pointer" data-action="copy-json">
                        <i class="fas fa-copy me-1"></i> Copy JSON
                    </a>
                    <a class="dropdown-item cursor-pointer" data-action="download">
                        <i class="fas fa-download me-1"></i> Download JSON
                    </a>
                    <a class="dropdown-item cursor-pointer" ${row.type === "COPY_NUMBER" ? "disabled" : ""} data-action="copy-varsome-id">
                        <i class="fas fa-download me-1"></i> Copy Varsome ID
                    </a>
                    ${copiesItems.length > 0 ? `
                        <hr class="dropdown-divider">
                        <div class="dropdown-header">Custom Copy</div>
                        ${copiesItems.join("")}
                    ` : ""}
                </div>
            </div>
        `;
    }

    onActionClick(event, variant) {
        const action = event.currentTarget?.dataset?.action?.toLowerCase();
        switch (action) {
            case "view":
                this._selectedVariant = variant;
                this.gridCommons.changeActiveModal("view-variant");
                break;
            case "review":
            case "edit":
                this.onVariantReview(event, variant);
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(variant, null, "\t"));
                break;
            case "download":
                UtilsNew.downloadData([JSON.stringify(variant, null, "\t")], variant.id + ".json");
                break;
            case "copy-varsome-id":
                // Note: varsome format is disabled for copy_number variants
                // See https://app.clickup.com/t/36631768/TASK-3902
                if (variant.type !== "COPY_NUMBER") {
                    const varsomeId = BioinfoUtils.getVariantInVarsomeFormat(variant.id);
                    UtilsNew.copyToClipboard(varsomeId);
                }
                break;
            case "custom-copy":
                const copyId = event.currentTarget?.dataset?.copy;
                const copy = this._config.copies.find(copy => copy.id.toLowerCase() === copyId);
                if (copy) {
                    // Sort and group CTs by Gene name
                    BioinfoUtils.sort(variant.evidences, v => v.genomicFeature?.geneName);

                    // we need to prepare evidences to be filtered properly,
                    // the easiest way is to recycle the existing function 'consequenceTypeDetailFormatterFilter',
                    // so we need to add consequenceType information
                    const transcriptMap = new Map();
                    variant.annotation.consequenceTypes.forEach(ct => transcriptMap.set(ct.transcriptId, ct));
                    const newEvidences = [];
                    variant.evidences.forEach((evidence, index) => {
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
                    UtilsNew.copyToClipboard(CustomActions.get(copy).execute(variant, showArrayIndexes));
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

    onVariantReview(event, row) {
        // check if the variant is already selected
        if (this._checkedVariants.has(row.id)) {
            this._selectedVariant = UtilsNew.objectClone(this._checkedVariants.get(row.id));
            this._selectedVariantChecked = true;
        } else {
            this._selectedVariant = UtilsNew.objectClone(row);
            this._selectedVariantChecked = false;
        }
        this.gridCommons.changeActiveModal("review-variant");
    }

    onVariantReviewChange(event) {
        this._selectedVariant = event.detail.variant;
        this._selectedVariantChecked = event.detail.selected;
    }

    onVariantReviewSave() {
        // 1. get the action to perform based on the selected variant state
        let action = "";
        if (this._selectedVariantChecked && !this._checkedVariants.has(this._selectedVariant.id)) {
            // we have to update the variant.filters field to include the current filters
            action = "ADD";
            this._selectedVariant.filters = {
                ...this.filters,
            };
        } else if (this._selectedVariantChecked && this._checkedVariants.has(this._selectedVariant.id)) {
            action = "UPDATE";
        } else {
            action = "REMOVE";
        }

        // 2. emit the event with the selected variant and action
        LitUtils.dispatchCustomEvent(this, "variantReview", null, {
            id: this._selectedVariant.id,
            variant: this._selectedVariant,
            action: action,
        });

        // 3. clear selected variant to review
        this._selectedVariant = null;
        this.gridCommons.clearActiveModal();
    }

    onVariantReviewCancel() {
        this._selectedVariant = null;
        this.gridCommons.clearActiveModal();
    }

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
    }

    render() {
        return html`
            <grid-toolbar
                .config="${this.toolbarConfig}"
                .settings="${this.toolbarSetting}"
                .query="${this.filters}"
                .opencgaSession="${this.opencgaSession}"
                .leftContent="${this.renderToolbarLeftContent()}"
                @columnChange="${this.onColumnChange}"
                @download="${this.onDownload}"
                @export="${this.onDownload}">
            </grid-toolbar>

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}VariantBrowserGrid"></table>
            </div>

            ${this.gridCommons.renderModals()}
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
