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

import {LitElement, html, nothing} from "lit";
import "../commons/forms/data-form.js";
import "./individual-pharmacogenomics-summary.js";
import "./pharmacogenomics/individual-pharmacogenomics-genes.js";
import "./pharmacogenomics/individual-pharmacogenomics-drugs.js";
import "./pharmacogenomics/individual-pharmacogenomics-variants.js";

export default class IndividualPharmacogenomicsView extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            individual: {
                type: Object,
            },
            individualId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "individual-pharmacogenomics-view";
        this._individual = null;
        this._pharmacogenomicsData = null;
        this._loading = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }

        if (changedProperties.has("individual")) {
            this.individualObserver();
        }

        if (changedProperties.has("displayConfig") || changedProperties.has("opencgaSession")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    individualIdObserver() {
        if (this.opencgaSession && this.individualId) {
            this.opencgaSession.opencgaClient.individuals()
                .info(this.individualId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._individual = response.getResult(0);
                    this._loadPharmacogenomicsData();
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    individualObserver() {
        this._individual = {...this.individual};
        this._loadPharmacogenomicsData();
    }

    _loadPharmacogenomicsData() {
        const sampleId = this._individual?.samples?.[0]?.id;
        const folder = this._individual?.attributes?.OPENCGA_PHARMACOGENOMICS;

        if (sampleId && folder) {
            this._loading = true;
            this._pharmacogenomicsData = null;
            this.requestUpdate();

            const resultsFile = `${folder}/results/${sampleId}.json`.replaceAll("/", ":");
            this.opencgaSession.opencgaClient.files()
                .download(resultsFile, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => JSON.parse(response))
                .then(data => {
                    this._pharmacogenomicsData = data;
                    this._config = this.getDefaultConfig();
                })
                .catch(error => {
                    console.error("Error loading pharmacogenomics data:", error);
                    this._pharmacogenomicsData = null;
                })
                .finally(() => {
                    this._loading = false;
                    this.requestUpdate();
                });
        }
    }

    render() {
        if (!this.opencgaSession || !this._individual) {
            return nothing;
        }

        if (this._loading) {
            return html`
                <div class="d-flex justify-content-center align-items-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span class="ms-3 text-muted">Loading pharmacogenomics data...</span>
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this._individual}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                type: "pills",
                pillsLeftColumnClass: "col-md-2",
                pillsRightColumnClass: "col-md-10",
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "overview",
                    name: "Overview",
                    render: (individual, active) => html`
                        <individual-pharmacogenomics-summary
                            .individual="${individual}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </individual-pharmacogenomics-summary>
                    `,
                },
                {
                    id: "genes",
                    name: "Genes",
                    render: (individual, active) => html`
                        <individual-pharmacogenomics-genes
                            .pharmacogenomicsData="${this._pharmacogenomicsData}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </individual-pharmacogenomics-genes>
                    `,
                },
                {
                    id: "drugs",
                    name: "Drugs",
                    render: (individual, active) => html`
                        <individual-pharmacogenomics-drugs
                            .pharmacogenomicsData="${this._pharmacogenomicsData}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </individual-pharmacogenomics-drugs>
                    `,
                },
                {
                    id: "variants",
                    name: "Variants",
                    render: (individual, active) => html`
                        <individual-pharmacogenomics-variants
                            .pharmacogenomicsData="${this._pharmacogenomicsData}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </individual-pharmacogenomics-variants>
                    `,
                },
            ],
        };
    }

}

customElements.define("individual-pharmacogenomics-view", IndividualPharmacogenomicsView);
