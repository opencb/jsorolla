/**
 * Copyright 2015-2022 OpenCB
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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import GridCommons from "../commons/grid-commons.js";
import "../commons/opencb-grid-toolbar.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";


export default class GeneGrid extends LitElement {

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
            query: {
                type: Object
            },
            genePanels: {
                type: Array
            },
            config: {
                type: Object
            },
            active: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + "GenePanelBrowserGrid";
        this.active = true;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig()};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") ||
            changedProperties.has("query") ||
            changedProperties.has("config") ||
            changedProperties.has("genePanels") ||
            changedProperties.has("active")) &&
            this.active) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};
        // Config for the grid toolbar
        this.toolbarConfig = {
            ...this.config?.toolbar,
            resource: "DISEASE_PANEL",
            // buttons: ["columns", "download"],
            columns: this._getDefaultColumns()
        };
        this.renderTable();
    }

    renderTable() {
        // If this.diseasePanel is provided as property we render the array directly
        if (this.genePanels && this.genePanels.length > 0) {
            this.renderLocalTable();
        }
        // else {
        //     this.renderRemoteTable();
        // }
        this.requestUpdate();
    }

    renderRemoteTable() {
        if (this.opencgaSession.opencgaClient && this.opencgaSession?.study?.fqn) {
            const filters = {...this.query};
            // TODO fix and replicate this in all browsers (the current filter is not "filters", it is actually built in the ajax() function in bootstrapTable)
            if (UtilsNew.isNotUndefinedOrNull(this.lastFilters) &&
                JSON.stringify(this.lastFilters) === JSON.stringify(filters)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }

            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._getDefaultColumns(),
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                // Table properties
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this._config.detailFormatter,
                gridContext: this,
                formatLoadingMessage: () => String.raw`<div><loading-spinner></loading-spinner></div>`,
                ajax: async params => {
                    const _filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...filters
                    };
                    // Store the current filters
                    this.lastFilters = {..._filters};
                    try {
                        const data = await this.fetchGenePanels(_filters);
                        params.success(data);
                    } catch (e) {
                        console.log(e);
                        params.error(e);
                    }

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
                        if (element[0].innerHTML.includes("fa-plus")) {
                            this.table.bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            this.table.bootstrapTable("collapseRow", element[0].dataset.index);
                        }
                    }
                },
                onCheck: (row, $element) => {
                    this.gridCommons.onCheck(row.id, row);
                },
                onCheckAll: rows => {
                    this.gridCommons.onCheckAll(rows);
                },
                onUncheck: (row, $element) => {
                    this.gridCommons.onUncheck(row.id, row);
                },
                onUncheckAll: rows => {
                    this.gridCommons.onUncheckAll(rows);
                },
                onLoadSuccess: data => {
                    this.gridCommons.onLoadSuccess(data, 1);
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            });
        }
    }

    async fetchGenePanels(query) {
        try {
            return await this.opencgaSession.opencgaClient.panels().search(query);
        } catch (e) {
            console.error(e);
            await Promise.reject(e);
        }
    }

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.genePanels,
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            // onPageChange: (page, size) => {
            //     const result = this.gridCommons.onPageChange(page, size);
            //     this.from = result.from || this.from;
            //     this.to = result.to || this.to;
            // },
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    onActionClick(e, _, row) {
        const {action} = e.target.dataset;

        if (action === "download") {
            UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
        }
    }

    _getDefaultColumns() {
        let _columns = [[
            {
                id: "name",
                title: "Gene",
                field: "name",
                formatter: (value, row) => this.geneFormatter(row.name, this.opencgaSession),
                halign: this._config.header.horizontalAlign
            },
            {
                id: "modeOfInheritance",
                title: "Mode of Inheritance",
                field: "modeOfInheritance",
            },
            {
                id: "confidence",
                title: "Confidence",
                field: "confidence",
                align: "center",
                formatter: (value, row) => {
                    const statusConfidence = {
                        "HIGH": "label label-success",
                        "MEDIUM": "label label-warning",
                        "LOW": "label label-danger",
                    };
                    return String.raw`<h4><span class="${statusConfidence[row.confidence] || "label label-default"}">${row.confidence ?? "-"}</span></h4>`;
                },
                halign: this._config.header.horizontalAlign
            },
            {
                id: "phenotypes",
                title: "Phenotypes",
                field: "phenotypes",
                formatter: (value, row) => {
                    const phenotypesContent = this.generateList(row.phenotypes, "name");
                    return String.raw `
                        ${phenotypesContent ? String.raw`
                                <ul>
                                    ${phenotypesContent}
                                </ul>` : "-"}`;
                }
            },
            {
                id: "evidences",
                title: "Evidences",
                field: "evidences",
                formatter: (value, row) => {
                    const evidencesContent = this.generateList(row.evidences, "");
                    return String.raw `
                        ${evidencesContent ? String.raw `
                                <ul>
                                    ${evidencesContent}
                                </ul>` : "-"}`;
                }
            }
            // {
            //     id: "details",
            //     title: "Details",
            //     formatter: (value, row) => {
            //         const generateList = (arr, field) => {
            //             return arr? arr.map(item => String.raw `<li>${field?item[field]:item}</li>`).join(""):"";
            //         };
            //         const evidencesContent = generateList(row.evidences, "");
            //         const phenotypesContent = generateList(row.phenotypes, "name");
            //         const tagsContent = generateList(row.tags, "");
            //         const content = String.raw `
            // ${evidencesContent ? String.raw `
            //     <label>Sources</label>
            //         <ul>
            //             ${evidencesContent}
            //         </ul>` : ""}
            //             ${phenotypesContent ? String.raw `
            //                 <label>Phenotypes</label>
            //                     <ul>
            //                         ${phenotypesContent}
            //                     </ul>` : ""}
            //             ${tagsContent? String.raw`
            //                 <label>Phenotypes</label>
            //                     <ul>
            //                         ${tagsContent}
            //                     </ul>` : ""}
            //             `.trim();
            //         return `${content? content: "-"}`;
            //     },
            // },
        ],
        ];

        _columns = UtilsNew.mergeTable(_columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);
        return _columns;
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;
        const params = {
            study: this.opencgaSession.study.fqn,
            ...this.query,
            limit: 1000,
            skip: 0,
            count: false,
        };

        this.opencgaSession.opencgaClient.panels().search(params)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "tab") {
                        const fields = ["id", "individualId", "fileIds", "collection.method", "processing.preparationMethod", "somatic", "creationDate"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "samples_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                // console.log(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
            });
    }

    geneFormatter(geneName, opencgaSession) {

        const geneLinks = [];
        const geneWithCtLinks = [];

        if (geneName) {
            let geneViewMenuLink = "";
            if (opencgaSession.project && opencgaSession.study) {
                geneViewMenuLink = String.raw`
                            <div style='padding: 5px'>
                                <a style='cursor: pointer' href='#gene/${opencgaSession.project.id}/${opencgaSession.study.id}/${geneName}' data-cy='gene-view2'>Gene View</a>
                            </div>`;
            }

            const tooltipText = String.raw`
                        ${geneViewMenuLink}
                        <div class='dropdown-header' style='padding-left: 5px;padding-top: 5px'>External Links</div>
                        <div style='padding: 5px'>
                            <a target='_blank' href='${BioinfoUtils.getEnsemblLink(geneName, "gene", opencgaSession?.project?.organism?.assembly)}'>Ensembl</a>
                        </div>
                        <div style='padding: 5px'>
                            <a target='_blank' href='${BioinfoUtils.getGeneLink(geneName, "lrg")}'>LRG</a>
                        </div>
                        <div style='padding: 5px'>
                            <a target='_blank' href='${BioinfoUtils.getUniprotLink(geneName)}'>UniProt</a>
                        </div>

                        <div class='dropdown-header' style='padding-left: 5px;padding-top: 5px'>Clinical Resources</div>
                        <div style='padding: 5px'>
                            <a target='_blank' href='${BioinfoUtils.getGeneLink(geneName, "decipher")}'>Decipher</a>
                        </div>
                        <div style='padding: 5px'>
                            <a target='_blank' href='${BioinfoUtils.getGeneLink(geneName, "cosmic", opencgaSession.project.organism.assembly)}'>COSMIC</a>
                        </div>
                        <div style='padding: 5px'>
                            <a target='_blank' href='${BioinfoUtils.getGeneLink(geneName, "omim")}'>OMIM</a>
                        </div>`;

            geneLinks.push(String.raw `
                                        <a class="gene-tooltip" tooltip-title="Links" tooltip-text="${tooltipText}" style="margin-left: 2px">
                                            ${geneName}
                                        </a>`);
        }

        let resultHtml = "";

        // Second, the other genes
        for (let i = 0; i < geneLinks.length; i++) {
            resultHtml += geneLinks[i];
            if (i + 1 !== geneLinks.length) {
                if (i === 0) {
                    resultHtml += ",";
                } else if ((i + 1) % 2 !== 0) {
                    resultHtml += ",";
                } else {
                    resultHtml += "<br>";
                }
            }
        }
        return resultHtml;
    }

    generateList(arr, field) {
        return arr? arr.map(item => String.raw `<li>${field?item[field]:item}</li>`).join(""):"";
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 5,
            pageList: [5, 10, 25],
            showExport: false,
            detailView: false,
            detailFormatter: null, // function with the detail formatter
            multiSelection: false,
            showToolbar: true,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            }
        };
    }

    render() {
        return html`
            ${this._config.showToolbar ?
                html`
                    <opencb-grid-toolbar
                        .config="${this.toolbarConfig}"
                        .query="${this.query}"
                        .opencgaSession="${this.opencgaSession}"
                        @columnChange="${this.onColumnChange}"
                        @download="${this.onDownload}"
                        @export="${this.onDownload}">
                    </opencb-grid-toolbar>` : nothing
            }

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}GenePanelBrowserGrid"></table>
            </div>
        `;
    }

}

customElements.define("gene-grid", GeneGrid);
