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

import {html, LitElement} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../../webcomponents/disease-panel/disease-panel-grid.js";
import "../../../webcomponents/disease-panel/disease-panel-detail.js";
import "../../../webcomponents/disease-panel/disease-panel-create.js";
import "../../../webcomponents/disease-panel/disease-panel-update.js";

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
        };
    }

    #init() {
        this.COMPONENT_ID = "disease-panel-browser";
        this.FILES = [
            "disease-panels-platinum.json",
        ];
        this._data = null;
        this._selectedRow = {};
        this._config = this.getDefaultConfig();
    }

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

            Promise.all(promises)
                .then(data => {
                    this._data = data[0];
                    this._selectedRow = this._data[0];
                    this.mutate();
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    mutate() {
        return null;
    }

    onUserGridSettingsUpdate() {
        this._config.grid = {
            ...this._config.grid,
            ...this.opencgaSession?.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid,
        };
        this.requestUpdate();
    }

    onSelectRow(e) {
        this._selectedRow = e.detail.row;
        this.requestUpdate();
    }

    render() {
        if (!this._data) {
            return "Loading...";
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
                    .config="${this._config.grid}"
                    @userGridSettingsUpdate="${() => this.onUserGridSettingsUpdate()}"
                    @selectrow="${e => this.onSelectRow(e)}">
                </disease-panel-grid>
                <disease-panel-detail
                    .diseasePanel="${this._selectedRow}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config.detail}">
                </disease-panel-detail>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            grid: {
                pageSize: 10,
                pageList: [10, 25, 50],
                toolbar: {
                    showColumns: true,
                    showDownload: false,
                    showExport: false,
                    showSettings: true,
                    exportTabs: ["download", "link", "code"]
                },
            },
            detail: {
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
            },
        };
    }

}

customElements.define("disease-panel-browser-grid-test", DiseasePanelBrowserGridTest);
