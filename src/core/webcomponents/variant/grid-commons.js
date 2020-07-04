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

import UtilsNew from "../../utilsNew.js";


export default class GridCommons {

    constructor(gridId, context, config) {
        this.gridId = gridId;
        this.context = context;
        this.config = config;

        this.checkedRows = new Map();
        // this.bootstrapTable = $("#" + this.gridId);
        // this.bootstrapTableConfig = this.bootstrapTable.bootstrapTable("getOptions");
    }

    responseHandler(response, bootstrapTableConfig) {
        let numMatches, from, to, numTotalResultsText, approximateCountResult;
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
        numTotalResultsText = numMatches.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (response.getParams().skip === 0 && numMatches < response.getParams().limit) {
            from = 1;
            to = numMatches;
        }
        approximateCountResult = response.getResponse().attributes.approximateCount;

        return {
            numMatches: numMatches,
            from: from,
            to: to,
            numTotalResultsText: numTotalResultsText,
            approximateCountResult: approximateCountResult,
            response: {
                total: numMatches,
                rows: response.getResults()
            }
        };
    }

    onClickRow(rowId, row, selectedElement) {
        $("#" + this.gridId + " tr").removeClass("success");
        $(selectedElement).addClass("success");
        //$("#" + this.gridId + " tr td").removeClass("success");
        //$("td", selectedElement).addClass("success");

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
        for (let row of rows) {
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
        for (let row of rows) {
            this.checkedRows.delete(row.id);
        }
        this.context.dispatchEvent(new CustomEvent("checkrow", {
            detail: {
                rows: Array.from(this.checkedRows.values()),
                ...others
            }
        }));
    }

    onLoadSuccess(data, firstRowIndex = 2, idField) {
        if (data.rows && data.rows.length > 0) {

            let table = $("#" + this.gridId);
            for (let i = 0; i < data.rows.length; i++) {
                if (this.checkedRows.has(data.rows[i].id)) {
                    table.bootstrapTable('check', i);
                }
            }

            if (table[0]) {
                table[0].rows[firstRowIndex].setAttribute("class", "success");
            }

            let id = idField ? idField : "id";
            this.context.dispatchEvent(new CustomEvent("selectrow", {
                detail: {
                    id: data.rows[0][id],
                    row: data.rows[0]
                }
            }));
        } else {
            this.context.dispatchEvent(new CustomEvent("selectrow", {
                detail: {
                    id: null,
                    row: null
                }
            }));
        }
        UtilsNew.initTooltip(this.context);
        /*$("a[tooltip-title]", this.context).each(function() {
            $(this).qtip({
                content: {
                    title: $(this).attr("tooltip-title"),
                    text: $(this).attr("tooltip-text")
                },
                position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
                style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
                show: {delay: 200},
                hide: {fixed: true, delay: 300}
            });
        });*/
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
    formatShowingRows(pageFrom, pageTo, totalRows, totalNotFiltered) {
        return `Showing ${pageFrom} to ${pageTo} of ${Number(totalRows).toLocaleString()} records`
    }

}
