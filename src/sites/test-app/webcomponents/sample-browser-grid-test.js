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
import "../../../webcomponents/sample/sample-update.js";
import "../../../webcomponents/sample/sample-create.js";


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
        };
    }

    #init() {
        this.COMPONENT_ID = "sample-browser";
        this.FILES = [
            "samples-platinum.json",
        ];
        this._data = null;
        this._selectedRow = {};

        this._config = this.getDefaultConfig();
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
                    this._selectedRow = this._data[0];
                    // Mutate data and update
                    this.mutate();
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    mutate() {
        // 1. Mutations related to date
        // this._data[3].id = "";
        // this._data[1].creationDate = "";
        this._data[2].creationDate = "20540101"; // No valid format
        this._data[2].creationDate = "20210527101416"; // Valid format

        // Finally, we update samples mem address to force a rendering
        this._data = [...this._data];
    }

    onSettingsUpdate() {
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
            return html`Processing...`;
        }

        return html`
            <div data-cy="sample-browser-container">
                <h2 style="font-weight: bold;">
                    Sample Browser Grid (${this.FILES[0]})
                </h2>
                <sample-grid
                    .toolId="${this.COMPONENT_ID}"
                    .samples="${this._data}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config?.grid}"
                    @settingsUpdate="${() => this.onSettingsUpdate()}"
                    @selectrow="${e => this.onSelectRow(e)}">
                </sample-grid>
                <sample-detail
                    .sample="${this._selectedRow}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config?.detail}">
                </sample-detail>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            grid: {},
            detail: {
                title: "Sample",
                showTitle: true,
                items: [
                    {
                        id: "sample-view",
                        name: "Overview",
                        active: true,
                        render: (sample, active, opencgaSession) => html`
                            <sample-view
                                .sample="${sample}"
                                .active="${active}"
                                .opencgaSession="${opencgaSession}">
                            </sample-view>
                        `,
                    },
                    {
                        id: "json-view",
                        name: "JSON Data",
                        render: (sample, active) => html`
                            <json-viewer
                                .data="${sample}"
                                .active="${active}">
                            </json-viewer>
                        `,
                    }
                ],
            },
        };
    }

}

customElements.define("sample-browser-grid-test", SampleBrowserGridTest);
