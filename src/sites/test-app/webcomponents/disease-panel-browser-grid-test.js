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

    onSettingsUpdate() {
        this._config.grid = {
            ...this._config.grid,
            ...this.opencgaSession?.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid,
        };
        this.requestUpdate();
    }

    render() {
        if (!this._data) {
            return "Loading...";
        }

        return html`
            <h2 class="fw-bold">
                Disease Panel Browser Grid (${this.FILES[0]})
            </h2>
            <disease-panel-grid
                .toolId="${this.COMPONENT_ID}"
                .diseasePanels="${this._data}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config.grid}"
                @settingsUpdate="${() => this.onSettingsUpdate()}">
            </disease-panel-grid>
        `;
    }

    getDefaultConfig() {
        return {
            grid: {},
        };
    }

}

customElements.define("disease-panel-browser-grid-test", DiseasePanelBrowserGridTest);
