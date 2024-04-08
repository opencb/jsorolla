
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
import "../../../webcomponents/cohort/cohort-grid.js";
import "../../../webcomponents/cohort/cohort-detail.js";
import "../../../webcomponents/cohort/cohort-view.js";
import "../../../webcomponents/cohort/cohort-update.js";
import "../../../webcomponents/cohort/cohort-create.js";
import "../../../webcomponents/commons/json-viewer.js";

class CohortBrowserGridTest extends LitElement {

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
        this.COMPONENT_ID = "cohort-browser";
        this.FILES = [
            "cohorts-1000G.json",
        ];
        this._data = null;
        this._selectedRow = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("testDataVersion") || changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        if (this.opencgaSession && this.testDataVersion) {
            const allPromises = this.FILES.map(file => {
                return UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${file}`);
            });

            Promise.all(allPromises)
                .then(data => {
                    this._data = data[0];
                    this._selectedRow = this._data[0];
                    this.mutate();
                    this.requestUpdate();
                })
                .catch(err => {
                    console.log(err);
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
            <div data-cy="cohort-browser">
                <h2 style="font-weight: bold;">
                    Cohort Browser Grid (${this.FILES[0]})
                </h2>
                <cohort-grid
                    .toolId="${this.COMPONENT_ID}"
                    .cohorts="${this._data}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config.grid}"
                    @userGridSettingsUpdate="${() => this.onUserGridSettingsUpdate()}"
                    @selectrow="${e => this.onSelectRow(e)}">
                </cohort-grid>
                <cohort-detail
                    .cohort="${this._selectedRow}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config.detail}">
                </cohort-detail>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            grid: {},
            detail: {
                title: "Cohort",
                showTitle: true,
                items: [
                    {
                        id: "cohort-view",
                        name: "Overview",
                        active: true,
                        render: (cohort, active, opencgaSession) => {
                            return html`
                                <cohort-view
                                    .opencgaSession="${opencgaSession}"
                                    .cohort="${cohort}">
                                </cohort-view>
                            `;
                        }
                    },
                    {
                        id: "json-view",
                        name: "JSON Data",
                        render: (cohort, active) => {
                            return html`
                                <json-viewer
                                    .data="${cohort}"
                                    .active="${active}">
                                </json-viewer>
                            `;
                        }
                    }
                ],
            },
        };
    }

}

customElements.define("cohort-browser-grid-test", CohortBrowserGridTest);
