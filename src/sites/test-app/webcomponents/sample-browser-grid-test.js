
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
import "../../../webcomponents/sample/sample-grid.js";
import "../../../webcomponents/sample/sample-detail.js";


class SampleBrowserGridTest extends LitElement {

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
        this.samples = [];
        this._dataFormConfig = DATA_FORM_EXAMPLE;

        this.configSampleGrid = {
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

    // #setLoading(value) {
        // this.isLoading = value;
        // this.requestUpdate();
    // }

    update(changedProperties) {
        if (changedProperties.has("testFile")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        // this.#setLoading(true);
        UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${this.testFile}.json`)
            .then(content => {
                this.samples = content;
                this.selectedSample = this.samples[0];
                this.mutate();
                this.requestUpdate();
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                // this.#setLoading(false);
            });
    }

    mutate() {
        // 1. no gene names in the CT array
        this.samples[1].creationDate = "";
        this.samples[2].creationDate = "20540101";

        // Finally, we update samples mem address to force a rendering
        this.samples = [...this.samples];
        // this.requestUpdate();
    }

    selectSample(e) {
        this.selectedSample = e.detail.value;
        this.requestUpdate();
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <h2 style="font-weight: bold;">
                Sample Browser Grid (${this.testFile?.split("-")?.at(-1)})
            </h2>

            <!--
        <div>
            <button class="${`btn btn-success ${this.activeTab === "table-tab" ? "active" : ""}`}"
                type="button" @click="${() => this.mutate()}">
                    <i class="fas fa-sync"></i>
                    <strong>Mutate 1: missing variants</strong>
            </button>
            <button type="button" class="${`btn btn-success ${this.activeTab === "facet-tab" ? "active" : ""}`}"
                @click="${() => this.mutate("sdsad")}">
                    <i class="fas fa-sync"></i>
                    <strong>Mutate 2: other case</strong>
            </button>
        </div>
        -->

            <sample-grid
                .samples="${this.samples}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this.configSampleGrid}"
                .active="${true}"
                @selectrow="${this.selectSample}">
            </sample-grid>

            <sample-detail
                .opencgaSession="${this.opencgaSession}"
                .sample="${this.selectedSample}">
            </sample-detail>\`
        `;
    }

}

customElements.define("sample-browser-grid-test", SampleBrowserGridTest);
