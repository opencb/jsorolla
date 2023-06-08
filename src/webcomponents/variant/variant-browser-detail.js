/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html} from "lit";
import "./annotation/cellbase-variant-annotation-summary.js";
import "./annotation/variant-consequence-type-view.js";
import "./annotation/cellbase-population-frequency-grid.js";
import "./annotation/variant-annotation-clinical-view.js";
import "./variant-cohort-stats.js";
import "./variant-samples.js";


export default class VariantBrowserDetail extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variantId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    variantIdObserver() {
        if (this.cellbaseClient && this.variantId) {
            this.cellbaseClient.get("genomic", "variant", this.variantId, "annotation", {assembly: this.opencgaSession.project.organism.assembly}, {})
                .then(response => {
                    this.variant = {
                        id: this.variantId,
                        annotation: response.responses[0].results[0],
                    };
                    this.requestUpdate();
                });
        } else {
            this.variant = null;
            this.requestUpdate();
        }
    }

    render() {
        if (!this.opencgaSession || !this.variant?.annotation) {
            return "";
        }

        return html`
            <detail-tabs
                .data="${this.variant}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            // detail-tab configuration in variant-browser
        };
    }

}

customElements.define("variant-browser-detail", VariantBrowserDetail);
