
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
            },
            _selectRow: {
                type: Object,
                state: true
            },
            _ready: {
                type: Boolean,
                state: true
            }
        };
    }

    #init() {
        this._ready = false;
        this.data = [];
        this._config = {};
    }


    update(changedProperties) {
        if (changedProperties.has("testFile") &&
            changedProperties.has("testDataVersion") &&
            changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    opencgaSessionObserver() {
        this.#setLoading(true);
        UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${this.testFile}.json`)
            .then(content => {
                this.families = content;
                this.mutate();
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    onSettingsUpdate() {
        this._config = {...this._config, ...this.opencgaSession?.user?.configs?.IVA?.familyBrowser?.grid};
        this.opencgaSessionObserver();
    }

    getDefaultTabsConfig() {
        return {
            title: "Family",
            showTitle: true,
            items: [
                {
                    id: "family-view",
                    name: "Overview",
                    active: true,
                    // visible:
                    render: (family, active, opencgaSession) => html`
                        <family-view
                            .opencgaSession="${opencgaSession}"
                            .family="${family}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}"
                            .settings="${{}}">
                        </family-view>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (family, active, opencgaSession) => html`
                        <json-viewer
                            .data="${family}"
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

    selectRow(e) {
        this._selectRow = {...e.detail.row};
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <h2 style="font-weight: bold;">
                Catalog Browser Grid (${this.testFile})
            </h2>
            <family-grid
                .families="${this.families}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                @settingsUpdate="${() => this.onSettingsUpdate()}"
                @selectrow="${e => this.selectRow(e)}">
            </family-grid>
            <family-detail
                .family="${this._selectRow}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this.getDefaultTabsConfig()}">
            </family-detail>
        `;
    }

}

customElements.define("family-browser-grid-test", FamilyBrowserGridTest);
