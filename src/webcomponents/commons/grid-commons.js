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

import {nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import WebUtils from "./utils/web-utils.js";
import ModalUtils from "./modal/modal-utils.js";
import CustomActions from "./custom-actions.js";
import ExtensionsManager from "../extensions-manager.js";

export default class GridCommons {

    static GRID_ICONS_PREFIX = "fas";
    static GRID_ICONS = {
        paginationSwitchDown: "fa-caret-square-down",
        paginationSwitchUp: "fa-caret-square-up",
        refresh: "fa-sync",
        toggleOff: "fa-toggle-off",
        toggleOn: "fa-toggle-on",
        columns: "fa-th-list",
        fullscreen: "fa-arrows-alt",
        detailOpen: "fa-plus",
        detailClose: "fa-minus"
    }

    static loadingFormatter() {
        return `<div><loading-spinner></loading-spinner></div>`;
    }

    constructor(gridId, context, config) {
        this.gridId = gridId;
        this.context = context;
        this.config = config;
        this.checkedRows = new Map();
        this.selectedRow;
        this.extensionsData = {}; // To store extra data for extensions
        this.activeModal = ""; // current active modal
        this.modals = {}; // map with all the available modals
    }

    responseHandler(response, bootstrapTableConfig) {
        let numMatches, from, to, approximateCountResult;
        numMatches = this.context.numMatches || 0;
        if (response.getResponse().numMatches >= 0) {
            numMatches = response.getResponse().numMatches;
            this.context.numMatches = numMatches;
        }
        // If no variant is returned then we start in 0
        if (response.getResponse(0).numMatches === 0) {
            from = numMatches;
        }
        // If do not fetch as many variants as requested then to is numMatches
        if (response.getResponse(0).numResults < bootstrapTableConfig.pageSize) {
            to = numMatches;
        }
        const numTotalResultsText = numMatches.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (response.getParams().skip === 0 && numMatches < response.getParams().limit) {
            from = 1;
            to = numMatches;
        }

        if (response.getResponse()?.attributes?.approximateCount) {
            approximateCountResult = response.getResponse().attributes.approximateCount;
        }

        return {
            numMatches: numMatches,
            from: from,
            to: to,
            numTotalResultsText: numTotalResultsText,
            approximateCountResult: approximateCountResult,
            pageSize: bootstrapTableConfig.pageSize,
            response: {
                total: numMatches,
                rows: response.getResults()
            }
        };
    }

    onClickRow(rowId, row, selectedElement) {
        $("#" + this.gridId + " tr").removeClass("table-success");
        $(selectedElement).addClass("table-success");
        this.selectedRow = selectedElement;
        // $("#" + this.gridId + " tr td").removeClass("success");
        // $("td", selectedElement).addClass("success");

        this.context.dispatchEvent(new CustomEvent("selectrow", {
            detail: {
                id: rowId,
                row: row
            },
            bubbles: true,
            composed: true
        }));
    }

    onCheck(rowId, row, others) {
        this.checkedRows.set(rowId, row);
        this.context.dispatchEvent(new CustomEvent("checkrow", {
            detail: {
                id: rowId,
                row: row,
                checked: true,
                rows: Array.from(this.checkedRows.values()),
                ...others
            }
        }));
    }

    onCheckAll(rows, others) {
        for (const row of rows) {
            // delete row.checkbox;
            this.checkedRows.set(row.id, row);
        }
        this.context.dispatchEvent(new CustomEvent("checkrow", {
            detail: {
                rows: Array.from(this.checkedRows.values()),
                ...others
            }
        }));
    }

    onUncheck(rowId, row, others) {
        this.checkedRows.delete(rowId);
        this.context.dispatchEvent(new CustomEvent("checkrow", {
            detail: {
                id: rowId,
                row: row,
                checked: false,
                rows: Array.from(this.checkedRows.values()),
                ...others
            }
        }));
    }

    onUncheckAll(rows, others) {
        for (const row of rows) {
            this.checkedRows.delete(row.id);
        }
        this.context.dispatchEvent(new CustomEvent("checkrow", {
            detail: {
                rows: Array.from(this.checkedRows.values()),
                checked: false,
                ...others
            }
        }));
    }

    onLoadSuccess(data) {
        if (data?.rows?.length > 0) {
            const table = $("#" + this.gridId);

            if (this.checkedRows && this.checkedRows.size > 0) {
                for (let i = 0; i < data.rows.length; i++) {
                    if (this.checkedRows.has(data.rows[i].id)) {
                        table.bootstrapTable("check", i);
                    }
                }
            }

            // Add events for expand/collapse content (for content generated by generateExpandCollapseContent)
            Array.from(this.context.querySelectorAll(`div[data-role="expand-collapse-content"]`)).forEach(el => {
                const expandLink = el.querySelector(`[data-role="expand-content"]`);
                const collapseLink = el.querySelector(`[data-role="collapse-content"]`);
                const hiddenContent = el.querySelector(`[data-role="hidden-content"]`);
                // Note: expandLink and collapseLink could be null if there are no hidden items
                if (expandLink && collapseLink) {
                    expandLink.addEventListener("click", () => {
                        expandLink.style.display = "none";
                        collapseLink.style.display = "";
                        hiddenContent.style.display = "";
                    });
                    collapseLink.addEventListener("click", () => {
                        collapseLink.style.display = "none";
                        expandLink.style.display = "";
                        hiddenContent.style.display = "none";
                    });
                }
            });
        }

        // This init all grid tooltips
        UtilsNew.initTooltip(this.context);
    }

    onLoadError(e, response) {
        this.context.dispatchEvent(new CustomEvent("selectrow", {
            detail: {
                id: null,
                row: null
            }
        }));

        // in some cases `response` is a string (in case the error state doesn't come from the server there is no restResponse instance, so we send a custom error msg)
        let msg = "Generic Error";
        if (response?.getEvents?.("ERROR")?.length) {
            msg = response.getEvents("ERROR").map(error => `${error.name}: ${error.message ?? ""}`).join("<br>");
        } else if (response instanceof Error) {
            msg = `<h2>${response.name}</h2><br>${response.message ?? ""}`;
        } else if (response instanceof Object) {
            msg = JSON.stringify(response);
        } else if (typeof response === "string") {
            msg = response;
        }
        this.context.table.bootstrapTable("updateFormatText", "formatNoMatches", msg);
    }

    onPageChange(page, size) {
        // this.context.from = (page - 1) * size + 1;
        // this.context.to = page * size;
        return {
            from: (page - 1) * size + 1,
            to: page * size
        };
    }

    // overrides the pagination info in bootstrap-table
    formatShowingRows(pageFrom, pageTo, totalRows, totalRowsNotTruncated, isApproximateCount) {
        const pagedFromFormatted = Number(pageFrom).toLocaleString();
        const pagedToFormatted = Number(pageTo).toLocaleString();
        let message;
        if (!totalRowsNotTruncated) {
            message = `Showing <b>${pagedFromFormatted}</b> to <b>${pagedToFormatted}</b> of <b>${Number(totalRows).toLocaleString()}</b> records`;
            if (isApproximateCount) {
                message += " <span title=\"Approximate count\" style=\"color: red; vertical-align: top; font-size: 1.0rem\"><i class=\"fas fa-asterisk fa-xs\"></i></span>";
            }
        } else {
            message = `
                Showing <b>${pagedFromFormatted}</b> to <b>${pagedToFormatted}</b> of <b>${Number(totalRowsNotTruncated).toLocaleString()}</b> records
                <span title="Only first 1M pages shown" style="color: darkorange; vertical-align: top; font-size: 1.0rem"><i class="fas fa-asterisk fa-xs"></i></span>`;
        }
        // Terrible hack to display the top pagination info
        // Note that this is only executed if there is a pagination container in the grid
        const paginationContainer = this.context?.querySelector(`#${this.gridId}PaginationInfo`);
        if (paginationContainer) {
            paginationContainer.innerHTML = Number(totalRows) > 0 ? message : "";
        }
        return message;
    }

    onColumnChange(e) {
        if (e.detail.selected) {
            e.detail.id.split(",").forEach(id => this.context.table.bootstrapTable("showColumn", id));
        } else {
            e.detail.id.split(",").forEach(id => this.context.table.bootstrapTable("hideColumn", id));
        }
    }

    isColumnVisible(colName, parentName) {
        if (this.config.columns?.length > 0) {
            return this.config.columns.includes(colName) || this.config.columns.includes(parentName);
        } else {
            // Columns are visible by default.
            return true;
        }
    }

    rowHighlightStyle(row, index) {
        let rowStyle = {};
        (this.config.highlights || [])
            .filter(highlight => highlight.active)
            .forEach(highlight => {
                if (CustomActions.get(highlight).execute(row, highlight)) {
                    rowStyle = {
                        css: {
                            "background-color": highlight.style?.rowBackgroundColor || "",
                            "opacity": highlight.style?.rowOpacity,
                        },
                    };
                }
            });
        return rowStyle;
    }

    addColumnsFromAnnotations(columns, formatter, gridConfig) {
        if (gridConfig?.annotations?.length > 0) {
            for (const annotation of gridConfig.annotations) {
                const column = {
                    id: "annotations",
                    title: annotation.title || "Custom Annotation",
                    field: "annotationSets",
                    formatter: annotationSets => formatter(annotationSets, annotation.variableSetId, annotation.variables),
                    halign: gridConfig.header?.horizontalAlign || "center",
                    visible: true,
                    excludeFromSettings: true,
                    // visible: this.gridCommons.isColumnVisible("annotations")
                };
                columns.splice(annotation.position, 0, column);
            }
        }
        return columns;
    }

    async prepareDataForExtensions(componentId, opencgaSession, query, rows) {
        this.extensionsData = {};
        if (!this.context?._config?.skipExtensions) {
            const id = componentId || this.context?.COMPONENT_ID;
            this.extensionsData = await ExtensionsManager.prepareDataForColumns(id, opencgaSession, query, rows);
        }
    }

    addColumnsFromExtensions(componentId, opencgaSession, columns) {
        if (!this.context?._config?.skipExtensions) {
            const id = componentId || this.context?.COMPONENT_ID;
            const isVisible = columnId => this.isColumnVisible(columnId);
            const getData = () => this.extensionsData || {};
            return ExtensionsManager.injectColumns(id, opencgaSession, columns, isVisible, getData);
        }
        // No extensions to inject, just return the original columns list
        return columns;
    }

    hideHeader(hide = false) {
        const header = this.context.querySelector(`#${this.gridId} thead`);
        if (header) {
            if (hide) {
                header.style.display = "none";
                // this.context.querySelector(`#${this.gridId} tbody tr:first-child`).style.borderTopWidth = "1px";
            } else {
                header.style.display = "";
            }
        }
    }

    // get the configuration for the provided modal
    getModalConfig(name) {
        let modalConfig = this.modals[name || this.activeModal];
        // sometimes the modalConfig is a function that returns a modalConfig
        // for example when the configuration dependes on the selected row in the grid
        if (modalConfig && typeof modalConfig === "function") {
            modalConfig = modalConfig(this.context);
        }
        return modalConfig;
    }

    // change the current active modal
    changeActiveModal(name) {
        const prevModal = this.activeModal;

        // 1. check if there is a modal rendered
        if (this.activeModal) {
            ModalUtils.close(`GridModal${this.activeModal}`);
        }

        // 2. set the new active modal
        this.activeModal = name;
        this.context.requestUpdate();

        // 3. show the new active action modal (if provided)
        this.context.updateComplete.then(() => {
            if (this.activeModal) {
                ModalUtils.show(`GridModal${this.activeModal}`);

                // 4. if the active modal has changed, we can perform some action
                if (prevModal !== this.activeModal) {
                    const modalConfig = this.getModalConfig();

                    // if the clearAfterClosing flag is set, we need to reset the active modal once it is closed
                    if (modalConfig.clearAfterClosing === true) {
                        this.registerModalEventListener(this.activeModal, "hidden.bs.modal", () => {
                            // console.log(`${this.activeModal} modal closed, clearing active modal`);
                            this.clearActiveModal();
                        });
                    }
                }
            }
        });
    }

    // resets the active modal
    clearActiveModal() {
        this.changeActiveModal("");
    }

    // register a list of modals available for this grid
    registerModals(modals) {
        this.modals = modals;
    }

    // method to register an event listener on the specified modal
    registerModalEventListener(modalName, eventName, callback) {
        if (this.activeModal === modalName) {
            const modalElement = this.context.querySelector(`#GridModal${modalName}`);
            if (modalElement) {
                modalElement.addEventListener(eventName, event => callback(event));
            }
        }
    }

    // render the active modal
    renderModals() {
        if (this.activeModal) {
            const modalConfig = this.getModalConfig();
            // check if the modalConfig is a valid object
            if (modalConfig && typeof modalConfig.render === "function") {
                return ModalUtils.create(this.context, `GridModal${this.activeModal}`, modalConfig);
            }
        }
        return nothing;
    }

    // checks if the current has the provided permission on the specified resource
    hasPermission(mode = "VIEW", resource = "") {
        return OpencgaCatalogUtils.getStudyEffectivePermission(
            this.context?.opencgaSession?.study,
            this.context?.opencgaSession?.user?.id,
            WebUtils.getPermissionID((resource || this.context?.RESOURCE || "").toUpperCase(), mode.toUpperCase()),
            this.context?.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions
        );
    }

    static generateExpandCollapseContent(items = [], maxItems = 5) {
        if (items.length <= maxItems) {
            return items.join("") || "-";
        } else {
            const hiddenItemsLength = items.length - maxItems;
            return `
                <div data-role="expand-collapse-content">
                    <div class="d-flex flex-column gap-1 mb-1">
                        ${items.slice(0, maxItems).join("")}
                    </div>
                    <div data-role="hidden-content" style="display:none">
                        <div class="d-flex flex-column gap-1 mb-1">
                            ${items.slice(maxItems).join("")}
                        </div>
                    </div>
                    ${hiddenItemsLength > 0 ? `
                        <div class="mt-1">
                            <div class="cursor-pointer" data-role="expand-content" style="">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fa fa-chevron-down fs-8"></i>
                                    <span class="fw-bold hover:text-decoration-underline text-nowrap">Show all (${items.length})</span>
                                </div>
                            </div>
                            <div class="cursor-pointer" data-role="collapse-content" style="display:none;">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="fa fa-chevron-up fs-8"></i>
                                    <span class="fw-bold hover:text-decoration-underline text-nowrap">Show less</span>
                                </div>
                            </div>
                        </div>
                    ` : ""}
                </div>
            `;
        }
    }

}
