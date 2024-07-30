/*
 * Copyright 2015-2024 OpenCB
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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import VariantGridFormatter from "../variant/variant-grid-formatter.js";
import "../commons/opencb-grid-toolbar.js";

export default class DiseasePanelGeneView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            genePanels: {
                type: Array
            },
            search: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this.genePanels = {};
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + "GenePanelBrowserGrid";
        this._config = this.getDefaultConfig();
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.displayConfigDefault = {
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom",
            },
        };
    }

    // connectedCallback() {
    //     super.connectedCallback();
    //     this._config = {...this.getDefaultConfig()};
    //     this.gridCommons = new GridCommons(this.gridId, this, this._config);
    // }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config") || changedProperties.has("genePanels")) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must update config and create the columns again. No extra checks are needed.
        this._config = this.getDefaultConfig();
        // Config for the grid toolbar
        this.toolbarConfig = {
            ...this.config?.toolbar,
            resource: "DISEASE_PANEL",
            buttons: ["columns", "download"],
            columns: this.getDefaultColumns()
        };
        this.renderTable();
    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: this.getDefaultColumns(),
            data: this.genePanels,
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
            detailView: !!this.detailFormatter,
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
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

    geneFormatter(row) {
        const geneLinks = [];

        const geneName = row.name || row.id;
        if (geneName) {
            const tooltipText = `
                ${VariantGridFormatter.getGeneTooltip(geneName, this.opencgaSession?.project?.organism?.assembly)}
            `;
            geneLinks.push(`
                <a class="gene-tooltip text-decoration-none" tooltip-title="Links" tooltip-text="${tooltipText}" style="margin-left: 2px">
                    ${geneName}
                </a>`);
        }

        // let resultHtml = "";
        // Second, the other genes
        // for (let i = 0; i < geneLinks.length; i++) {
        //     resultHtml += geneLinks[i];
        //     if (i + 1 !== geneLinks.length) {
        //         if (i === 0) {
        //             resultHtml += ",";
        //         } else if ((i + 1) % 2 !== 0) {
        //             resultHtml += ",";
        //         } else {
        //             resultHtml += "<br>";
        //         }
        //     }
        // }
        return geneLinks.join("");
    }

    generateList(arr, field) {
        return arr ? arr
            .map(item => `<li>${field ? item[field] : item}</li>`)
            .join("") : "";
    }

    getDefaultColumns() {
        return [
            [
                {
                    id: "name",
                    title: "Gene",
                    field: "name",
                    formatter: (value, row) => this.geneFormatter(row, this.opencgaSession),
                    halign: this.displayConfigDefault.header.horizontalAlign
                },
                {
                    id: "modesOfInheritance",
                    title: "Mode of Inheritance",
                    field: "modesOfInheritance",
                    formatter: (value, row) => {
                        const modesOfInheritanceContent = this.generateList(row.modesOfInheritance, "");
                        return String.raw `
                            ${modesOfInheritanceContent ? String.raw `
                                <ul>
                                    ${modesOfInheritanceContent}
                                </ul>` : "-"
                        }
                        `;
                    },
                },
                {
                    id: "confidence",
                    title: "Confidence",
                    field: "confidence",
                    align: "center",
                    formatter: (value, row) => {
                        const statusConfidence = {
                            "HIGH": "badge text-bg-success",
                            "MEDIUM": "badge text-bg-warning",
                            "LOW": "badge text-bg-danger",
                        };
                        if (row.confidence) {
                            return `
                                <h4>
                                    <span class="${statusConfidence[row.confidence] || "badge bg-secondary"}">${row.confidence}</span>
                                </h4>`;
                        } else {
                            return "-";
                        }
                    },
                    halign: this.displayConfigDefault.header.horizontalAlign
                },
                {
                    id: "phenotypes",
                    title: "Phenotypes",
                    field: "phenotypes",
                    formatter: (value, row) => {
                        const phenotypesContent = this.generateList(row.phenotypes, "name");
                        return String.raw`
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
                        return String.raw`
                        ${evidencesContent ? String.raw`
                                <ul>
                                    ${evidencesContent}
                                </ul>` : "-"}`;
                    }
                }
            ],
        ];
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

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 5,
            pageList: [5, 10, 25],
            showExport: false,
            showToolbar: false,
        };
    }

}

customElements.define("disease-panel-gene-view", DiseasePanelGeneView);
