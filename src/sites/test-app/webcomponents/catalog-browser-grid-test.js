
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
import "../../../webcomponents/file/file-grid.js";


class CatalogVariantBrowserGridTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            testFile: {
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
        this.data = [];
        this._dataFormConfig = DATA_FORM_EXAMPLE;
        this.configVariantGrid = {
            pageSize: 10,
            pageList: [10, 25, 50],
            multiSelection: false,
            showSelectCheckbox: false,
            toolbar: {
                showColumns: true,
                showDownload: false,
                showExport: false,
                showSettings: false,
                exportTabs: ["download", "link", "code"]
            },
        };
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("testFile") &&
            changedProperties.has("testDataVersion") &&
            changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.#setLoading(true);
        UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${this.testFile}.json`)
            .then(content => {
                this.data = content;
                if (this.testFile === "variant-browser-germline") {
                    // this.germlineMutate();
                } else {
                    // this.cancerMutate();
                }
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    fileMutate() {

    }


    changeView(id) {
        this.activeTab = id;
        // this.mutate();
    }


    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <h2 style="font-weight: bold;">
                Catalog Browser Grid (${this.testFile})
            </h2>
            <file-grid
                .files="${this.data}"
                .opencgaSession="${this.opencgaSession}">
            </file-grid>
            <!-- sample,individual grid... -->
        `;
    }

}

customElements.define("catalog-browser-grid-test", CatalogVariantBrowserGridTest);
