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

import UtilsNew from "../../../core/utils-new.js";

import "../../../webcomponents/sample/sample-grid.js";
import "../../../webcomponents/sample/sample-detail.js";
import NotificationUtils from "../../../webcomponents/commons/utils/notification-utils";


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
            opencgaSession: {
                type: Object
            },
            testDataVersion: {
                type: String
            },
            _ready: {
                type: Boolean,
                state: true,
            }
        };
    }

    #init() {
        this._ready = false;
        this.FILES = [
            "samples-platinum.json",
        ];
        this._data = [];
        this._selectedInstance = {};

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

    // TODO: The Sample Browser Test needs to test two things:
    //   1. The view:
    //      - The sample browser: table grid and details
    //      - The sample browser facet
    //  2. The filters

    update(changedProperties) {
        if (changedProperties.has("testDataVersion")) {
            this.testDataVersionObserver();
        }
        // CAUTION: it could be useful to test by study. Json from current study?
        /*
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
         */

        super.update(changedProperties);
    }

    testDataVersionObserver() {
        const promises = this.FILES.map(file => {
            return UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${file}`);
        });

        // Import all files
        Promise.all(promises)
            .then(data => {
                this._data = data[0];
                this._selectedInstance = this._data[0];
                // Mutate data and update
                this.mutate();
                this.requestUpdate();
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            }).finally(() => {
                this._ready = true;
            });
    }

    mutate() {
        // 1. Mutations related to date
        this._data[1].creationDate = "";
        this._data[2].creationDate = "20540101";

        // Finally, we update samples mem address to force a rendering
        this._data = [...this._data];
    }

    selectInstance(e) {
        this._selectedInstance = e.detail.row;
        this.requestUpdate();
    }

    render() {
        if (!this._ready) {
            return html `Processing`;
        }

        return html`
            <h2 style="font-weight: bold;">
                Sample Browser Grid (${this.testFile?.split("-")?.at(-1)})
            </h2>
            <sample-grid
                .samples="${this._data}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this.configSampleGrid}"
                @selectrow="${this.selectInstance}">
            </sample-grid>
            <sample-detail
                .opencgaSession="${this.opencgaSession}"
                .sample="${this._selectedInstance}">
            </sample-detail>
        `;
    }

}

customElements.define("sample-browser-grid-test", SampleBrowserGridTest);
