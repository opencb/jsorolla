
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
import "../../../webcomponents/cohort/cohort-grid.js";
import "../../../webcomponents/cohort/cohort-detail.js";
import "../../../webcomponents/cohort/cohort-view.js";
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
        };
    }

    #init() {
        this.isLoading = false;
        this.data = [];
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("testFile") &&
            changedProperties.has("testDataVersion") &&
            changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.#setLoading(true);
        UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${this.testFile}.json`)
            .then(content => {
                this.cohorts = content;
                this.mutate();
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    getDefaultTabsConfig() {
        return {
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
                // {
                //     id: "sample-view",
                //     name: "Samples",
                //     render: (cohort, active, opencgaSession) => {
                //         return html`
                //             <sample-grid
                //                 .opencgaSession="${opencgaSession}"
                //                 .query="${{cohortIds: cohort.id}}"
                //                 .config="${{showSelectCheckbox: false}}"
                //                 .active="${active}">
                //             </sample-grid>
                //         `;
                //     }
                // },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (cohort, active, opencgaSession) => {
                        return html`
                            <json-viewer
                                .data="${cohort}"
                                .active="${active}">
                            </json-viewer>
                        `;
                    }
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
            <cohort-grid
                .cohorts="${this.cohorts}"
                .opencgaSession="${this.opencgaSession}"
                @selectrow="${e => this.selectRow(e)}">
            </cohort-grid>
            <cohort-detail
                .cohort="${this._selectRow}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this.getDefaultTabsConfig()}">
            </cohort-detail>
        `;
    }

}

customElements.define("cohort-browser-grid-test", CohortBrowserGridTest);
