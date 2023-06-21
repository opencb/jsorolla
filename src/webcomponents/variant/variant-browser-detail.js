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
import ExtensionsManager from "../extensions-manager.js";
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
            opencgaSession: {
                type: Object
            },
            variantId: {
                type: String
            },
            variant: {
                type: Object,
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-browser-detail";
        this._variant = null;
        this._config = this.getDefaultConfig();
        this.#updateDetailTabs();
    }

    update(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }

        if (changedProperties.has("variant")) {
            this.variantObserver();
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

    variantIdObserver() {
        if (this.opencgaSession && this.variantId) {
            this.opencgaSession.opencgaClient.variants()
                .query({
                    study: this.opencgaSession.study.fqn,
                    id: this.variantId,
                })
                .then(response => {
                    this._variant = response.responses?.[0]?.results?.[0];
                    this.requestUpdate();
                });
        }
    }

    variantObserver() {
        this._variant = {...this.variant};
        this.requestUpdate();
    }

    #updateDetailTabs() {
        this._config.items = [
            ...this._config.items,
            ...ExtensionsManager.getDetailTabs(this.COMPONENT_ID),
        ];
    }

    render() {
        if (!this.opencgaSession) {
            return "";
        }

        return html`
            <detail-tabs
                .data="${this._variant}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            items: [],
        };
    }

}

customElements.define("variant-browser-detail", VariantBrowserDetail);
