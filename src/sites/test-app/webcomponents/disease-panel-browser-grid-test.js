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

import "../../../webcomponents/disease-panel/disease-panel-grid.js";
import "../../../webcomponents/disease-panel/disease-panel-detail.js";
import "../../../webcomponents/disease-panel/disease-panel-create.js";
import "../../../webcomponents/disease-panel/disease-panel-update.js";

import NotificationUtils from "../../../webcomponents/commons/utils/notification-utils.js";


class DiseasePanelBrowserGridTest extends LitElement {

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
        this.COMPONENT_ID = "disease-panel-browser";
        this._ready = false;
        this.FILES = [
            "disease-panels-platinum.json",
        ];
        this._data = [];
        this._selectedInstance = {};

        this._config = {
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

    // TODO: The Sample Browser Test needs to test two things:
    //   1. The view:
    //      - The sample browser: table grid and details
    //      - The sample browser facet
    //  2. The filters

    update(changedProperties) {
        if (changedProperties.has("testDataVersion") || changedProperties.has("opencgaSession")) {
            this.propertyObserver();
        }

        super.update(changedProperties);
    }

    propertyObserver() {
        if (this.opencgaSession && this.testDataVersion) {
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

    onSettingsUpdate() {
        this._config = {
            ...this._config,
            ...this.opencgaSession?.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid,
        };

        this.propertyObserver();
    }

    mutate() {
        // 1. Mutations related to date
        // this._data[3].id = "";
        // this._data[1].creationDate = "";
        // this._data[2].creationDate = "20540101"; // No valid format
        // this._data[2].creationDate = "20210527101416"; // Valid format

        // Finally, we update samples mem address to force a rendering
        // this._data = [...this._data];
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
            <div data-cy="disease-panel-browser-container">
                <h2 style="font-weight: bold;">
                    Disease Panel Browser Grid (${this.FILES[0]})
                </h2>
                <disease-panel-grid
                    .toolId="${this.COMPONENT_ID}"
                    .diseasePanels="${this._data}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config}"
                    @settingsUpdate="${() => this.onSettingsUpdate()}"
                    @selectrow="${e => this.selectInstance(e)}">
                </disease-panel-grid>
                <disease-panel-detail
                    .diseasePanel="${this._selectedInstance}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this.getDefaultTabsConfig()}">
                </disease-panel-detail>
            </div>
        `;
    }

    getDefaultTabsConfig() {
        return {
            title: "Disease Panel",
            showTitle: true,
            items: [
                {
                    id: "disease-panel-view",
                    name: "Summary",
                    active: true,
                    render: (diseasePanel, _active, opencgaSession) => html`
                        <disease-panel-summary
                            .diseasePanel="${diseasePanel}"
                            .opencgaSession="${opencgaSession}">
                        </disease-panel-summary>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (diseasePanel, active) => html`
                        <json-viewer
                                .data="${diseasePanel}"
                                .active="${active}">
                        </json-viewer>
                    `,
                },
            ]
        };
    }

}

customElements.define("disease-panel-browser-grid-test", DiseasePanelBrowserGridTest);
