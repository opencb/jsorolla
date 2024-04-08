
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
import "../../../webcomponents/family/family-grid.js";
import "../../../webcomponents/family/family-detail.js";
import "../../../webcomponents/family/family-view.js";
import "../../../webcomponents/family/family-create.js";
import "../../../webcomponents/family/family-update.js";
import "../../../webcomponents/commons/json-viewer.js";

class FamilyBrowserGridTest extends LitElement {

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
        this.COMPONENT_ID = "family-browser";
        this.FILES = [
            "families-platinum.json",
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
                    console.error(err);
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
            <div data-cy="family-browser">
                <h2 style="font-weight: bold;">
                    Family Browser Grid (${this.FILES[0]})
                </h2>
                <family-grid
                    .toolId="${this.COMPONENT_ID}"
                    .families="${this._data}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config.grid}"
                    @userGridSettingsUpdate="${() => this.onUserGridSettingsUpdate()}"
                    @selectrow="${e => this.onSelectRow(e)}">
                </family-grid>
                <family-detail
                    .family="${this._selectedRow}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config.detail}">
                </family-detail>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            grid: {},
            detail: {
                title: "Family",
                showTitle: true,
                items: [
                    {
                        id: "family-view",
                        name: "Overview",
                        active: true,
                        render: (family, active, opencgaSession) => html`
                            <family-view
                                .opencgaSession="${opencgaSession}"
                                .family="${family}"
                                @userGridSettingsUpdate="${() => this.onUserGridSettingsUpdate()}"
                                .settings="${{}}">
                            </family-view>
                        `,
                    },
                    {
                        id: "json-view",
                        name: "JSON Data",
                        render: (family, active) => html`
                            <json-viewer
                                .data="${family}"
                                .active="${active}">
                            </json-viewer>
                        `,
                    }
                ],
            },
        };
    }

}

customElements.define("family-browser-grid-test", FamilyBrowserGridTest);
