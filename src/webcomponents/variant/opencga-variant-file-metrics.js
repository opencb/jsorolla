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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";


export default class OpencgaVariantFileMetrics extends LitElement {

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
            variant: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ovfm" + UtilsNew.randomString(6) + "_";
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("variant")) {
            this.renderTable();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.renderTable();
        }
    }

    renderTable() {
        if (!this.variant || !this.variant.studies || !this.variant.studies.length) {
            return;
        }

        // We take the first study by default. Two possible improvements are:
        // 1. we could pass a new studyId parameter to choose the study
        // 2. render all of the studies in different tables or the same table with two-level columns
        const files = this.variant.studies[0].files;
        const attributesSet = new Set();
        // We find all the existing attributes
        for (const file of files) {
            for (const attr of Object.keys(file.data)) {
                if (attr !== "QUAL" && attr !== "FILTER") {
                    attributesSet.add(attr);
                }
            }
        }
        const attributesArray = Array.from(attributesSet.values()).sort();
        attributesArray.unshift("QUAL", "FILTER");

        // We store the values as: result = [{id: "AC", file1: 1, file2: 2}]
        let data = [];
        for (const attr of attributesArray) {
            let tmp = {id: attr};
            for (const file of files) {
                tmp[file.fileId] = file.data[attr];
            }
            data.push(tmp);
        }

        $('#' + this._prefix + 'FileMetrics').bootstrapTable('destroy');
        $('#' + this._prefix + 'FileMetrics').bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            data: data,
            pagination: false,
            columns: this._getColumns()
        });
    }

    _getColumns() {
        // This methods calculates dynamically the columns from te variant files and samples.
        // Files must be grouped by the samples it contains.
        let files = this.variant.studies[0].files;
        let samples = this.variant.studies[0].samples;

        // 1. Get the samples for each file
        let fileToSamples = new Map();
        for (let sample of samples) {
            let file = files[0];
            let sampleId = sample.sampleId ? sample.sampleId : "NA";
            if (!fileToSamples.has(file.fileId)) {
                fileToSamples.set(file.fileId, []);
            }
            fileToSamples.get(file.fileId).push(sampleId);
        }

        // 2. Group files for the samples it contains
        let samplesToFiles = {};
        for (let fileId of fileToSamples.keys()) {
            let sampleListId = fileToSamples.get(fileId).join(", ");
            if (!samplesToFiles[sampleListId]) {
                samplesToFiles[sampleListId] = [];
            }
            samplesToFiles[sampleListId].push({fileId: fileId, samples: fileToSamples.get(fileId)});
        }

        // 3. Create the Boostrap columns
        let columns = [
            [
                {
                    title: 'File Attributes',
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    halign: "center"
                }
            ],
            []
        ];
        for (let sampleColumnKey of Object.keys(samplesToFiles)) {
            let sampleColumns = samplesToFiles[sampleColumnKey];
            columns[0].push(
                {
                    title: sampleColumnKey,
                    rowspan: 1,
                    colspan: sampleColumns.length,
                    halign: "center"
                }
            );
            for (let sampleColumn of sampleColumns) {
                columns[1].push(
                    {
                        title: sampleColumn.fileId,
                        field: sampleColumn.fileId,
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    }
                );
            }
        }
        return columns;
    }

    getDefaultConfig() {
        return {
        }
    }

    render() {
        return html`
            <div style="padding: 20px">
                <table id="${this._prefix}FileMetrics"></table>
            </div>
        `;
    }
}

customElements.define("opencga-variant-file-metrics", OpencgaVariantFileMetrics);
