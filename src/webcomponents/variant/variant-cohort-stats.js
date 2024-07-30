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
import UtilsNew from "../../core/utils-new.js";
import "./variant-cohort-stats-grid.js";

export default class VariantCohortStats extends LitElement {

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
                type: String,
            },
            variant: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.active = false;
        this.studyNames = {};
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("variantId") || changedProperties.has("active")) {
            this.variantIdObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.studyNames = {};
        if (this.opencgaSession?.project?.studies) {
            this.opencgaSession.project.studies.forEach(study => {
                this.studyNames[study.id] = study.name;
                this.studyNames[study.fqn] = study.name;
            });
        }
    }

    variantIdObserver() {
        if (this.variantId && this.variantId.split(":").length > 2 && this.active) {
            this.opencgaSession.opencgaClient.variants()
                .query({
                    id: this.variantId,
                    study: this.opencgaSession.study.fqn,
                    includeStudy: "all",
                    exclude: "annotation,studies.files,studies.samples,studies.scores,studies.issues",
                    useSearchIndex: "no",
                })
                .then(response => {
                    if (response.responses[0].results[0]) {
                        this.variant = response.responses[0].results[0];
                        // this.requestUpdate();
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    render() {
        if (!this.variant || !(this.variant?.studies?.length > 0)) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-info-circle pe-1"></i>
                    <span>No studies available for this variant.</span>
                </div>
            `;
        }

        return html`
            ${this.variant.studies.map(study => html`
                <h3>${this.studyNames[study.studyId] || ""}</h3>
                <div style="">
                    <variant-cohort-stats-grid
                        .stats="${study.stats}">
                    </variant-cohort-stats-grid>
                </div>
            `)}
        `;
    }

}

customElements.define("variant-cohort-stats", VariantCohortStats);
