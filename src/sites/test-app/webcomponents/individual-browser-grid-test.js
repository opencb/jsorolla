
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
import "../../../webcomponents/loading-spinner.js";
import "../../../webcomponents/individual/individual-grid.js";
import "../../../webcomponents/individual/individual-detail.js";
import "../../../webcomponents/individual/individual-view.js";
import "../../../webcomponents/commons/json-viewer.js";
import NotificationUtils from "../../../webcomponents/commons/utils/notification-utils";

class IndividualBrowserGridTest extends LitElement {

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
            },
            _selectRow: {
                type: Object,
                state: true
            },
        };
    }

    #init() {
        this._ready = false;
        this.FILES = [
            "individuals-platinum.json",
        ];
        this._data = [];
        this._selectedInstance = {};

        this.configGrid = {
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

    update(changedProperties) {
        /* if (changedProperties.has("testFile") &&
            changedProperties.has("testDataVersion") &&
            changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        } */
        if (changedProperties.has("testDataVersion") || changedProperties.has("opencgaSession")) {
            this.propertyObserver();
        }

        super.update(changedProperties);
    }

    propertyObserver() {
        if (this.opencgaSession?.cellbaseClient && this.testDataVersion) {

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
    }

    getDefaultTabsConfig() {
        return {
            title: "Individual",
            showTitle: true,
            items: [
                {
                    id: "individual-view",
                    name: "Overview",
                    active: true,
                    render: (individual, active, opencgaSession) => html`
                        <individual-view
                            .individual="${individual}"
                            .active="${active}"
                            .opencgaSession="${opencgaSession}">
                        </individual-view>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (individual, active, opencgaSession) => html`
                        <json-viewer
                            .data="${individual}"
                            .active="${active}">
                        </json-viewer>
                    `,
                }
            ]
        };
    }

    mutate() {
        return null;
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
            <div data-cy="individual-browser-container">
                <h2 style="font-weight: bold;">
                    Individual Browser Grid (${this.FILES[0]})
                </h2>
                <individual-grid
                    .individuals="${this._data}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this.configGrid}"
                    @selectrow="${this.selectInstance}">
                </individual-grid>
                <individual-detail
                    .individual="${this._selectedInstance}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this.getDefaultTabsConfig()}">
                </individual-detail>
            </div>
        `;
    }

}

customElements.define("individual-browser-grid-test", IndividualBrowserGridTest);
