/**
 * Copyright 2015-2019 OpenCB
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

import {html, LitElement, nothing} from "lit";
import ExtensionsManager from "../extensions-manager.js";
import "../commons/forms/data-form.js";
import "./sample-summary.js";
import "./sample-variant-stats-view.js";
import "../alignment/qc/samtools-flagstats-view.js";

export default class SampleView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            sampleId: {
                type: String
            },
            sample: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "sample-view";
        this._sample = null;
        this._config = this.getDefaultConfig();
        this.#updateDetailTabs();
    }

    update(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        if (changedProperties.has("sample")) {
            this.sampleObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.#updateDetailTabs();
        }
        super.update(changedProperties);
    }

    sampleObserver() {
        this._sample = {...this.sample};
        this.requestUpdate();
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId) {
            this.opencgaSession.opencgaClient.samples()
                .info(this.sampleId, {
                    study: this.opencgaSession.study.fqn,
                    includeIndividual: true
                })
                .then(response => {
                    this._sample = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    #updateDetailTabs() {
        this._config.sections = [
            ...this._config.sections,
            ...ExtensionsManager.getDetailTabs(this.COMPONENT_ID),
        ];
    }

    render() {
        if (!this.opencgaSession || !this._sample) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._sample}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            // title: "Sample",
            display: {
                // titleClass: "mt-4",
                // contentClass: "p-3"
                type: "tabs",
                buttonsVisible: false,
            },
            sections: [
                {
                    id: "sample-view",
                    name: "Overview",
                    render: (sample, active) => html`
                        <sample-summary
                            .sample="${sample}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </sample-summary>
                    `,
                },
                {
                    id: "sample-variant-stats-view",
                    name: "Variant Stats",
                    render: (sample, active) => html`
                        <sample-variant-stats-view
                            .sampleId="${sample.id}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </sample-variant-stats-view>
                    `,
                },
                {
                    id: "samtools-flags-stats-view",
                    name: "Samtools Flagstat",
                    render: (sample, active) => html`
                        <samtools-flagstats-view
                            .sample="${sample}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </samtools-flagstats-view>
                    `,
                },
                {
                    id: "individual-view",
                    name: "Individual",
                    render: (sample, active) => html`
                        <individual-view
                            .individualId="${sample?.individualId}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </individual-view>
                    `,
                },
                {
                    id: "file-view",
                    name: "Files",
                    render: (sample, active) => html`
                        <file-grid
                            .query="${{sampleIds: sample.id, type: "FILE,VIRTUAL"}}"
                            .active="${active}"
                            .config="${{
                                showToolbar: false,
                            }}"
                            .opencgaSession="${this.opencgaSession}">
                        </file-grid>
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
        };
    }

}

customElements.define("sample-view", SampleView);
