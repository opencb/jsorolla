
/**
 * Copyright 2015-2023 OpenCB
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


import "../../../webcomponents/commons/forms/data-form.js";
import {DATA_FORM_EXAMPLE} from "../conf/data-form.js";
import {SAMPLE_DATA} from "../data/data-example.js";
import JSZip from "jszip";
import UtilsNew from "../../../core/utils-new.js";

class VariantBrowserGridTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._dataFormConfig = DATA_FORM_EXAMPLE;
        this.configVariantGrid = {
            pageSize: 10,
            pageList: [10, 25, 50],
            multiSelection: false,
            showSelectCheckbox: false,
            toolbar: {
                // showNew: true,
                showColumns: true,
                showDownload: false,
                showExport: false,
                showSettings: false,
                exportTabs: ["download", "link", "code"]
                // columns list for the dropdown will be added in grid components based on settings.table.columns
            },
        };
        this.#loadFileJson("data/variant-browser-data.zip", "variant-browser-data.json");
    }


    #loadFileJson(path, filename) {
        // Approach #1: read file from zip
        JSZip.loadAsync(UtilsNew.importBinaryFile(path))
            .then(zip => {
                zip.file(filename).async("string")
                    .then(content => {
                        this.variantBrowserData = JSON.parse(content);
                        this.requestUpdate();
                    });
            }).catch(err => {
                console.error("File not exist", err);
            });
    }

    render() {
        return html`
            <variant-browser-grid
                .variants="${this.variantBrowserData}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this.configVariantGrid}"
                .populationFrequencies="${this.config.populationFrequencies}">
            </variant-browser-grid>
        `;
    }

}

customElements.define("variant-browser-grid-test", VariantBrowserGridTest);
