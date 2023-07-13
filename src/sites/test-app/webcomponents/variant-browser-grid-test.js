
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


import {DATA_FORM_EXAMPLE} from "../conf/data-form.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../../webcomponents/loading-spinner.js";
import "../../../webcomponents/variant/variant-browser-grid.js";


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
            testDataFile: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            testDataVersion: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.isLoading = false;
        this.variants = [];
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
                // columns list for the dropdown will be added in grid webcomponents based on settings.table.columns
            },
        };
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("testDataFile") &&
            changedProperties.has("testDataVersion") &&
            changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.#setLoading(true);
        UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${this.testDataFile}.json`)
            .then(content => {
                this.variants = content;
                this.mutate();
                this.requestUpdate();
            })
            .catch(err => {
                // this.variants = [];
                console.log(err);
            }).finally(() => {
                this.#setLoading(false);
            });
    }

    mutate() {
        // 1. no CT array
        // this.variants[0].annotation.consequenceTypes.forEach(ct => ct.geneName = null);

    }

    render() {

        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }
        this.opencgaSession
debugger
        return html`
        <variant-browser-grid
            .variants="${this.variants}"
            .opencgaSession="${this.opencgaSession}"
            .config="${this.configVariantGrid}"
            .populationFrequencies="${this.config.populationFrequencies}">
        </variant-browser-grid>
    `;
    }

}

customElements.define("variant-browser-grid-test", VariantBrowserGridTest);
