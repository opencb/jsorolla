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


import Utils from "../../utils.js";

export default class GridCommons {

    constructor(gridId, context, config) {
        this.gridId = gridId;
        this.context = context;
        this.config = config;

        // this.bootstrapTable = $("#" + this.gridId);
        // this.bootstrapTableConfig = this.bootstrapTable.bootstrapTable("getOptions");
    }

    responseHandler(response, bootstrapTableConfig) {
        let numMatches, from, to, numTotalResultsText, approximateCountResult;
        // let _numMatches = _this._numMatches || 0;
        numMatches = 0;
        if (response.getResponse().numMatches >= 0) {
            numMatches = response.getResponse().numMatches;
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
        // debugger
        // approximateCountResult = response.getResponse().attributes.approximateCount;

        return {
            numMatches: numMatches,
            from: from,
            to: to,
            numTotalResultsText: numTotalResultsText,
            approximateCountResult: approximateCountResult,
            response: {
                total: numMatches,
                // rows: response.getResults()
                rows: response.getResponse()
            }
        };
    }

    onClickRow(rowId, row, selectedElement) {
        $("#" + this.gridId + " tr").removeClass("success");
        $(selectedElement).addClass("success");

        // this.onSelectVariant(row, this.context);
        this.context.dispatchEvent(new CustomEvent("selectrow", {
            detail: {
                id: rowId,
                row: row
            }
        }));
    }

    onCheck(rowId, row) {
        // let rowId = this._getVariantId(variant);
        this.context.dispatchEvent(new CustomEvent("checkrow", {
            detail: {
                id: rowId,
                row: row,
                checked: true,
                rows: $("#" + this.gridId).bootstrapTable("getAllSelections") || []
            }
        }));
    }

    onSelectVariant(variant, event) {
        let variantId = this._getVariantId(variant);
        this.context.dispatchEvent(new CustomEvent(event, {
            detail: {
                id: variantId,
                variant: variant
            }
        }));
    }

    _getVariantId(variant) {
        let variantId = null;
        if (typeof variant !== "undefined") {
            const reference = variant.reference !== "" ? variant.reference : "-";
            const alternate = variant.alternate !== "" ? variant.alternate : "-";
            variantId = variant.chromosome + ":" + variant.start + ":" + reference + ":" + alternate;
        }
        return variantId;
    }
}